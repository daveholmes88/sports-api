const pkg = require('pg');
const fs = require('fs');

const { Pool } = pkg
const WEEK = 2
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

const getLastNightGames = async () => {
    const jsonweekData = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=20250902-20250907`
    );
    const weekData = await jsonweekData.json();
    const lastNightGames = [];
    for (const game of weekData.events) {
        const gameArray = game.name.split(' at ');
        const gameObj = {};
        gameObj['homeTeam'] = gameArray[1].replace(/'/g, "");
        gameObj['awayTeam'] = gameArray[0].replace(/'/g, "");
        gameObj['date'] = game.date.split('T')[0];
        gameObj['id'] = parseInt(game.id)
        game.competitions[0].competitors.forEach(c => {
            if (c['homeAway'] === 'home') {
                gameObj['homeScore'] = parseInt(c.score);
                gameObj['homeHalfScore'] = parseInt(c.linescores[0].value) + parseInt(c.linescores[1].value);
            } else {
                gameObj['awayScore'] = parseInt(c.score);
                gameObj['awayHalfScore'] = parseInt(c.linescores[0].value) + parseInt(c.linescores[1].value);
            }
        });
        lastNightGames.push(gameObj);
    }
    return lastNightGames
}

const rounded = num => Math.round(num * 100) / 100;

const saveOldInfo = (teams) => {
    const jsonString = JSON.stringify(teams)
    fs.writeFile(`./csv/ncaaf/NCAAF${WEEK}.json`, jsonString, (err) => {
        if (err) {
            console.error(err);
        }
        console.log('JSON file has been created successfully!');
    });
    fs.writeFile(`./src/wnbaData.json`, jsonString, (err) => {
        if (err) {
            console.error(err);
        }
        console.log('JSON file has been created successfully!');
    });
}

const updateInfo = async () => {
    const games = await getLastNightGames()
    console.log(games)
    const client = await pool.connect();
    const resultTeams = await pool.query('SELECT * FROM ncaaf_teams;')
    const resultGames = await pool.query('SELECT * FROM ncaaf_games;')
    const teams = resultTeams.rows
    const savedGames = resultGames.rows
    const newGames = games.filter(game => {
        const g = savedGames.find(sg => sg.id === game.id)
        return (!g)
    })
    if (games.length === newGames.length) {
        saveOldInfo(teams)
    }
    for (let g of newGames) {
        if (g.homeScore !== 0 & g.awayScore !== 0) {
            const netScore = g.homeScore - g.awayScore;
            const homeTeam = teams.find(t => t.name === g.homeTeam);
            const awayTeam = teams.find(t => t.name === g.awayTeam);
            if (homeTeam && awayTeam) {
                homeTeam.rating = rounded((netScore + awayTeam.rating)*0.1 + (homeTeam.rating * 0.9))
                awayTeam.rating = rounded((netScore * -1 + homeTeam.rating)*0.1 + (awayTeam.rating * 0.9))
                await pool.query(`INSERT INTO ncaaf_games (id, home_team, away_team, home_score, away_score, home_half_score, away_half_score, date)
                VALUES (${g.id}, '${g.homeTeam}', '${g.awayTeam}', ${g.homeScore}, ${g.awayScore}, ${g.homeHalfScore}, ${g.awayHalfScore}, '${g.date}')`)
            }
           
        }
    }
    for (let team of teams) {
        const { id, rating } = team
        await pool.query(`UPDATE ncaaf_teams 
            SET rating=${rating}
            WHERE id = ${id};`)
    }
    client.release();
    pool.end();
} 

updateInfo()