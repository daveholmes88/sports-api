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

const jeff = {
    San_Francisco_49ers: 24.98,
    Buffalo_Bills: 27.12,
    Detroit_Lions: 24.11,
    Kansas_City_Chiefs: 25.03,
    Houston_Texans: 22.61,
    Baltimore_Ravens: 21.83,
    Philadelphia_Eagles: 23.95,
    Miami_Dolphins: 20.55,
    Green_Bay_Packers: 23.54,
    Cincinnati_Bengals: 19.84,
    New_York_Jets: 22.91,
    Los_Angeles_Rams: 19.82,
    Dallas_Cowboys: 19.75,
    Jacksonville_Jaguars: 17.74,
    Pittsburgh_Steelers: 22.87,
    Cleveland_Browns: 18.02,
    Chicago_Bears: 19.42,
    Seattle_Seahawks: 22.21,
    Indianapolis_Colts: 19.75,
    Atlanta_Falcons: 19.72,
    Minnesota_Vikings: 22.90,
    Arizona_Cardinals: 19.76,
    Los_Angeles_Chargers: 19.54,
    Tampa_Bay_Buccaneers: 18.04,
    Tennessee_Titans: 15.38,
    New_Orleans_Saints: 19.72,
    Washington_Commanders: 16.00,
    Las_Vegas_Raiders: 14.17,
    New_England_Patriots: 15.00,
    Denver_Broncos: 17.05,
    New_York_Giants: 14.59,
    Carolina_Panthers: 12.06,
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
