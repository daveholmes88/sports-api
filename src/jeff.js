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

const jeff = {
    San_Francisco_49ers: 26.79,
    Buffalo_Bills: 24.87,
    Detroit_Lions: 25.09,
    Kansas_City_Chiefs: 25.19,
    Houston_Texans: 24.32,
    Baltimore_Ravens: 23.62,
    Philadelphia_Eagles: 24.17,
    Miami_Dolphins: 23.66, 
    Green_Bay_Packers: 21.77, 
    Cincinnati_Bengals: 23.05,
    New_York_Jets: 22.33,
    Los_Angeles_Rams: 21.44,
    Dallas_Cowboys: 21.17,
    Jacksonville_Jaguars: 20.80,
    Pittsburgh_Steelers: 21.28,
    Cleveland_Browns: 19.35,
    Chicago_Bears: 20.55,
    Seattle_Seahawks: 20.22,
    Indianapolis_Colts: 19.77, 
    Atlanta_Falcons: 19.07,
    Minnesota_Vikings: 20.01,
    Arizona_Cardinals: 17.93,  
    Los_Angeles_Chargers: 18.32,
    Tampa_Bay_Buccaneers: 17.85,
    Tennessee_Titans: 16.73,
    New_Orleans_Saints: 17.3,
    Washington_Commanders: 14.67,
    Las_Vegas_Raiders: 14.45,
    New_England_Patriots: 15.53,
    Denver_Broncos: 14.21,
    New_York_Giants: 13.15,
    Carolina_Panthers: 10.57,
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
        const spread = env.handler(game, WEEK, lastWeekGames, away, home)
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
    fs.writeFile(`../csv/nflJeffWeek${WEEK}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
    client.release();
    pool.end();
};

handler();