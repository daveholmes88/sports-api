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
    San_Francisco_49ers: 25.78,
    Buffalo_Bills: 26.3,
    Detroit_Lions: 23.37,
    Kansas_City_Chiefs: 24.65,
    Houston_Texans: 24.36,
    Baltimore_Ravens: 21.75,
    Philadelphia_Eagles: 23.3,
    Miami_Dolphins: 21.69,
    Green_Bay_Packers: 22.58,
    Cincinnati_Bengals: 21.23,
    New_York_Jets: 22.22,
    Los_Angeles_Rams: 18.99,
    Dallas_Cowboys: 20.47,
    Jacksonville_Jaguars: 19.34,
    Pittsburgh_Steelers: 21.97,
    Cleveland_Browns: 19.34,
    Chicago_Bears: 20.39,
    Seattle_Seahawks: 20.63,
    Indianapolis_Colts: 19.37,
    Atlanta_Falcons: 19.79,
    Minnesota_Vikings: 21.46,
    Arizona_Cardinals: 20.25,
    Los_Angeles_Chargers: 20.03,
    Tampa_Bay_Buccaneers: 19.56,
    Tennessee_Titans: 16.26,
    New_Orleans_Saints: 19.92,
    Washington_Commanders: 15.01,
    Las_Vegas_Raiders: 16.00,
    New_England_Patriots: 16.12,
    Denver_Broncos: 14.31,
    New_York_Giants: 13.14,
    Carolina_Panthers: 10.39,
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
