const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();

const { Pool } = pkg;
const PASSWORD = process.env.PASSWORD;
const date = '20250514'

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
    const client = await pool.connect();
    const result = await pool.query(`SELECT * FROM mls_teams`);
    const teams = result.rows;
    client.release();
    pool.end();
    const jsonGames = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard?dates=${date}`
    );
    const games = await jsonGames.json();
    const todayGames = [];
    games.events.forEach(game => {
        let homeOdds = 'n/a';
        let awayOdds = 'n/a';
        let drawOdds = 'n/a';
        console.log(game.competitions[0])
        if (game.competitions[0]?.odds) {
            let moneyline = game.competitions[0].odds[0].moneyline ? game.competitions[0].odds[0].moneyline : game.competitions[0].odds[1].moneyline
            homeOdds = moneyline.home.close.odds
            awayOdds = moneyline.away.close.odds
            drawOdds = moneyline.draw.close.odds
        }
        const gameArray = game.name.split(' at ');
        todayGames.push({
            away: gameArray[0],
            home: gameArray[1],
            homeOdds,
            drawOdds,
            awayOdds,
            id: game.id,
        });
    });
    const final = todayGames.map(game => {
        const { homeOdds, drawOdds, awayOdds, home, away } = game;
        const awayTeam = teams.find(team => away === team.name);
        const homeTeam = teams.find(team => home === team.name);
        const dbRating = homeTeam.rating - awayTeam.rating;
        const homeSpread = rounding(dbRating + 0.5) * -1;
        const xgRating = homeTeam.xg - awayTeam.xg
        const homeXg = rounding(xgRating + 0.5) * -1;
        return [
            home,
            homeTeam.rating,
            homeTeam.xg,
            away,
            awayTeam.rating,
            awayTeam.xg,
            `${home} ${homeSpread}`,
            `${home} ${homeXg}`,
            homeOdds,
            drawOdds,
            awayOdds,
        ];
    });
    const header = [
        'Home Team',
        'Home DB Rating',
        'Home XG Rating',
        'Away Team',
        'Away DB Rating',
        'Away XG Rating',
        'DB Spread',
        'XG Spread',
        'Home Odds',
        'Draw Odds',
        'Away Odds',
    ];
    const csvFromGames = convertArrayToCSV(final, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/mlsModel/mlsModel${date}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('model csv file written');
    });
};

handler();
