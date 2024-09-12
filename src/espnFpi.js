const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();
const env = require('./nflEnv');
const nflGames = require('./nflGames')

const { Pool } = pkg;
const PASSWORD = process.env.PASSWORD;
const WEEK = 2;

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
    const json = fs.readFileSync('../csv/espn.json', 'utf8');
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
        const awayFpi = fpi.find(team => awayTeam === team.name).rankings;
        const homeFpi = fpi.find(team => homeTeam === team.name).rankings;
        let db = home.espn_api - away.espn_api;
        const spread = env.handler(game, WEEK, lastWeekGames, away, home)
        let homeSpread = rounding(spread + db) * -1;
        const homeDb = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        const espnSpread = rounding(homeFpi - awayFpi + spread) * -1;
        const homeEspn = espnSpread > 0 ? `+${espnSpread}` : espnSpread;
        end.push([
            home.team,
            home.espn_api,
            homeFpi,
            away.team,
            away.espn_api,
            awayFpi,
            spread,
            `${homeTeam} ${homeDb}`,
            `${homeTeam} ${homeEspn}`,
            game.espnOdds,
        ]);
    });
    const header = [
        'Home Team',
        'Home DB FPI',
        'Home ESPN FPI',
        'Away Team',
        'Away DB FPI',
        'Away ESPN FPI',
        'Environmental Factors',
        'DB FPI Spread',
        'ESPN FPI Spread',
        'ESPN Spread',
    ];
    const csvFromGames = convertArrayToCSV(end, {
        header,
        separator: ',',
    });
    fs.writeFile(`../csv/nflEspnWeek${WEEK}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
    client.release();
    pool.end();
};

handler();