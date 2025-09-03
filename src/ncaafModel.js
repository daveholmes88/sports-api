const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();
const { Pool } = pkg;
const PASSWORD = process.env.PASSWORD;

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
    const week = 2
    const games = [];
    const jsonWeek = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250902-20250907`
    );
    const weekData = await jsonWeek.json();
    weekData.events.forEach(game => {
        const homeRecord =
            game.competitions[0].competitors[0].records[0].summary;
        const awayRecord =
            game.competitions[0].competitors[1].records[0].summary;
        let odds = 'n/a';
        let abs = 'n/a';
        if (game.competitions[0]?.odds) {
            odds = game.competitions[0]?.odds[0].details;
            abs =
                game.competitions[0]?.odds[0]?.homeTeamOdds?.team
                    ?.abbreviation;
        }
        const gameArray = game.name.split(' at ');
        games.push({
            away: gameArray[0],
            home: gameArray[1],
            date: game.status.type.detail,
            id: game.id,
            neutral: game.competitions[0].neutralSite,
            espnOdds: odds,
            abbreviation: abs,
            homeRecord,
            awayRecord,
        });
    });
    const client = await pool.connect();
    const result = await pool.query(`SELECT * FROM ncaaf_teams`);
    const teams = result.rows;
    client.release();
    pool.end();
    const json = fs.readFileSync('./csv/espnNcaaf.json', 'utf8');
    const fpi = JSON.parse(json);
    const end = []
    games.forEach(game => {
        console.log(game)
        const awayTeam = game.away;
        const homeTeam = game.home;
        const away = teams.find(team => awayTeam === team.name);
        const home = teams.find(team => homeTeam === team.name);
        const awayFpi = fpi.find(team => game.away === team.name);
        const homeFpi = fpi.find(team => game.home === team.name);
        let espn = 0
        let spread = 0
        const awayEspnRating = awayFpi ? awayFpi.rankings : 0
        const homeEspnRating = homeFpi ? homeFpi.rankings : 0
        if (home && away) {
            spread = rounding(home.rating - away.rating + 3) * -1;
            if (awayFpi && homeFpi) {
                espn = rounding(homeEspnRating - awayEspnRating + 3) * -1;
            }
            end.push([
            home.name,
            home.rating,
            homeEspnRating,
            away.name,                
            away.rating,
            awayEspnRating,
            `${homeTeam} ${spread}`,
            `${homeTeam} ${espn}`,
            game.espnOdds,
            ]);
        }
    });
    const header = [
        'Home Team',
        'Home Ranking',
        'Home ESPN',
        'Away Team',
        'Away Ranking',
        'Away ESPN',
        'DB Spread',
        'FPI Spread',
        'ESPN Spread',
    ];
    const csvFromGames = convertArrayToCSV(end, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/ncaafModelWeek${week}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('model csv file written');
    });
};

handler()