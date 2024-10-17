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
    San_Francisco_49ers: 24.97,
    Buffalo_Bills: 24.74,
    Detroit_Lions: 26.54,
    Kansas_City_Chiefs: 26.21,
    Houston_Texans: 24.05,
    Baltimore_Ravens: 24.46,
    Philadelphia_Eagles: 22.12,
    Miami_Dolphins: 28.61,
    Green_Bay_Packers: 24.66,
    Cincinnati_Bengals: 20.68,
    New_York_Jets: 21.71,
    Los_Angeles_Rams: 18.96,
    Dallas_Cowboys: 18.83,
    Jacksonville_Jaguars: 16.89,
    Pittsburgh_Steelers: 22.2,
    Cleveland_Browns: 16.14,
    Chicago_Bears: 22.17,
    Seattle_Seahawks: 19.22,
    Indianapolis_Colts: 20.35,
    Atlanta_Falcons: 21.2,
    Minnesota_Vikings: 24.12,
    Arizona_Cardinals: 17.76,
    Los_Angeles_Chargers: 19.52,
    Tampa_Bay_Buccaneers: 20.91,
    Tennessee_Titans: 17.11,
    New_Orleans_Saints: 17.66,
    Washington_Commanders: 19.2,
    Las_Vegas_Raiders: 13.08,
    New_England_Patriots: 13.22,
    Denver_Broncos: 17.64,
    New_York_Giants: 15.02,
    Carolina_Panthers: 10.06,
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
