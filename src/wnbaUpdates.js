const pkg = require('pg');
const fs = require('fs');

const { Pool } = pkg
const DATE = '20250615'
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
    const jsonLastNight = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates=${DATE}`
    );
    const lastNightData = await jsonLastNight.json();
    const lastNightGames = [];
    for (const game of lastNightData.events) {
        const gameArray = game.name.split(' at ');
        const gameObj = {};
        gameObj['homeTeam'] = gameArray[1];
        gameObj['awayTeam'] = gameArray[0];
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
    fs.writeFile(`./csv/wnbaDB/WNBA${DATE}.json`, jsonString, (err) => {
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
    const client = await pool.connect();
    const resultTeams = await pool.query('SELECT * FROM wnba_teams;')
    const resultGames = await pool.query('SELECT * FROM wnba_games;')
    const teams = resultTeams.rows
    const savedGames = resultGames.rows
    const newGames = games.filter(game => {
        const g = savedGames.find(sg => sg.id === game.id)
        return (!g)
    })
    if (games.length === newGames.length) {
        saveOldInfo(teams)
    }
    console.log(newGames)
    for (let g of newGames) {
        if (g.homeScore !== 0 & g.awayScore !== 0) {
            const netScore = g.homeScore - g.awayScore;
            const total = g.homeScore + g.awayScore;
            const halfTotal = g.homeHalfScore + g.awayHalfScore;
            const halfScore = g.homeHalfScore - g.awayHalfScore;
            const homeTeam = teams.find(t => t.name === g.homeTeam);
            const awayTeam = teams.find(t => t.name === g.awayTeam);
            homeTeam.rating = rounded((netScore + awayTeam.rating)*0.1 + (homeTeam.rating * 0.9))
            awayTeam.rating = rounded((netScore * -1 + homeTeam.rating)*0.1 + (awayTeam.rating * 0.9))
            homeTeam.half = rounded((halfScore + awayTeam.half)*0.1 + (homeTeam.half * 0.9))
            awayTeam.half = rounded((halfScore * -1 + homeTeam.half)*0.1 + (awayTeam.half * 0.9))
            homeTeam.total = rounded((total*0.1) + (homeTeam.total*0.9))
            awayTeam.total = rounded((total*0.1) + (awayTeam.total*0.9))
            homeTeam.half_total = rounded((halfTotal*0.1) + (homeTeam.half_total*0.9))
            awayTeam.half_total = rounded((halfTotal*0.1) + (awayTeam.half_total*0.9))
            await pool.query(`INSERT INTO wnba_games (id, home_team, away_team, home_score, away_score, home_half_score, away_half_score, date)
                VALUES (${g.id}, '${g.homeTeam}', '${g.awayTeam}', ${g.homeScore}, ${g.awayScore}, ${g.homeHalfScore}, ${g.awayHalfScore}, '${g.date}')`)
        }
    }
    for (let team of teams) {
        const { half, rating, name, total, half_total } = team
        await pool.query(`UPDATE wnba_teams 
            SET rating=${rating}, half=${half}, total=${total}, half_total=${half_total}
            WHERE name = '${name}';`)
    }
    client.release();
    pool.end();
} 

updateInfo()