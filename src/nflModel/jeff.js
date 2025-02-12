const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();
const env = require('./nflEnv');
const nflGames = require('./nflGames');

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

const jeffData = {
    San_Francisco_49ers: 20.75,
    Buffalo_Bills: 27.5,
    Detroit_Lions: 29.19,
    Kansas_City_Chiefs: 24.64,
    Houston_Texans: 22.66,
    Baltimore_Ravens: 26.18,
    Philadelphia_Eagles: 26.23,
    Miami_Dolphins: 21.31,
    Green_Bay_Packers: 27.72,
    Cincinnati_Bengals: 21.62,
    New_York_Jets: 18.00,
    Los_Angeles_Rams: 21.97,
    Dallas_Cowboys: 18.12,
    Jacksonville_Jaguars: 15.83,
    Pittsburgh_Steelers: 21.46,
    Cleveland_Browns: 14.17,
    Chicago_Bears: 17.13,
    Seattle_Seahawks: 20.82,
    Indianapolis_Colts: 18.22,
    Atlanta_Falcons: 18.55,
    Minnesota_Vikings: 24.72,
    Arizona_Cardinals: 19.13,
    Los_Angeles_Chargers: 20.77,
    Tampa_Bay_Buccaneers: 21.62,
    Tennessee_Titans: 14.07,
    New_Orleans_Saints: 15.23,
    Washington_Commanders: 20.94,
    Las_Vegas_Raiders: 13.36,
    New_England_Patriots: 14.24,
    Denver_Broncos: 20.82,
    New_York_Giants: 10.98,
    Carolina_Panthers: 12.07,
};

const rounding = num => Math.round(num * 100) / 100;

const handler = async () => {
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
        const awayJeff = jeff[awayTeam.replaceAll(' ', '_')];
        const homeJeff = jeff[homeTeam.replaceAll(' ', '_')];
        const db = home.jeff - away.jeff;
        const spread = env.handler(game, WEEK, lastWeekGames, away, home);
        const homeSpread = rounding(spread + db) * -1;
        const homeDb = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        const jeffSpread = rounding(homeJeff - awayJeff + spread) * -1;
        const homeJeffSpread = jeffSpread > 0 ? `+${jeffSpread}` : jeffSpread;
        end.push([
            home.team,
            home.jeff,
            homeJeff,
            away.team,
            away.jeff,
            awayJeff,
            spread,
            `${homeTeam} ${homeDb}`,
            `${homeTeam} ${homeJeffSpread}`,
            game.espnOdds,
        ]);
    });
    const header = [
        'Home Team',
        'Home DB',
        'Home Jeff',
        'Away Team',
        'Away DB',
        'Away Jeff',
        'Environmental Factors',
        'DB Spread',
        'Jeff Spread',
        'ESPN Spread',
    ];
    const csvFromGames = convertArrayToCSV(end, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/nflJeffWeek${WEEK}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
    client.release();
    pool.end();
};

handler();
