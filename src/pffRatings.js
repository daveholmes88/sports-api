const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();
const env = require('./nflEnv');
const nflGames = require('./nflGames')

const { Pool } = pkg;
const PASSWORD = process.env.PASSWORD;
const WEEK = process.env.WEEK;

const pool = new Pool({
    user: 'davidholmes',
    database: 'backendgambling_development',
    password: PASSWORD,
    port: 5432, // This is the default PostgreSQL port
    //   ssl: {
    //     rejectUnauthorized: false
    //   }
});

const rounding = num => Math.round(num * 100) / 100;

const handler = async () => {
    const json = fs.readFileSync('../csv/ffpRankings.json', 'utf8');
    const fpi = JSON.parse(json);
    const end = [];
    const weekData = await nflGames.handler(WEEK);
    const { games, lastWeekGames } = weekData;
    const client = await pool.connect();
    const result = await pool.query(`SELECT * FROM football_teams`);
    const teams = result.rows;
    games.forEach(game => {
        const awayTeam = game.away;
        const homeTeam = game.home;
        const away = teams.find(team => awayTeam === team.team);
        const home = teams.find(team => homeTeam === team.team);
        const awayPff = fpi.find(team => awayTeam === team.team).ranking;
        const homePff = fpi.find(team => homeTeam === team.team).ranking;
        let db = home.ffp_power - away.ffp_power;
        const spread = env.handler(game, WEEK, lastWeekGames, away, home)
        let homeSpread = rounding(spread + db) * -1;
        const homeDb = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        const pffSpread = rounding(homePff - awayPff + spread) * -1;
        const homePffSpread = pffSpread > 0 ? `+${pffSpread}` : pffSpread;
        end.push([
            home.team,
            home.ffp_power,
            homePff,
            away.team,
            away.ffp_power,
            awayPff,
            spread,
            `${homeTeam} ${homeDb}`,
            `${homeTeam} ${homePffSpread}`,
            game.espnOdds,
        ]);
    });
    const header = [
        'Home Team',
        'Home DB',
        'Home PFF',
        'Away Team',
        'Away DB',
        'Away PFF',
        'Environmental Factors',
        'DB Spread',
        'PFF Spread',
        'ESPN Spread',
    ];
    const csvFromGames = convertArrayToCSV(end, {
        header,
        separator: ',',
    });
    fs.writeFile(`../csv/nflPffWeek${WEEK}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
    client.release();
    pool.end();
};

handler();