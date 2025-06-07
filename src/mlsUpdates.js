const pkg = require('pg');
const fs = require('fs');

const { Pool } = pkg
const DATE = '20250601'
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

const xg = {
    'Chicago Fire FC': -0,
    'Columbus Crew': 0.6,
    'Colorado Rapids': -1.8,
    'FC Dallas': 0.8,
    'Sporting Kansas City': -0.3,
    'LA Galaxy': -1.3,
    'New England Revolution': -0.6,
    'New York Red Bulls': -0.7,
    'San Jose Earthquakes': 0.3,
    'D.C. United': -1.4,
    'Real Salt Lake': -0.3,
    'Houston Dynamo FC': 0.8, 
    'Toronto FC': 1.4,
    'CF Montréal': 1.0,
    'Portland Timbers': -2.1,
    'Seattle Sounders FC': 1.3,
    'Vancouver Whitecaps': 2.1,
    'Philadelphia Union': -1.1,
    'Orlando City SC': 1.1,
    'Minnesota United FC': -0.7,
    'New York City FC': -1.6,
    'FC Cincinnati': 0.7,
    'Atlanta United FC': -1.0,
    'LAFC': 0.7,
    'Nashville SC': 0.6,
    'Inter Miami CF': 1.6,
    'Austin FC': 0.3,
    'Charlotte FC': -1.3,
    'St. Louis CITY SC': 1.8,
    'San Diego FC': 1.3,
}

const getLastNightGames = async () => {
    const jsonLastNight = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard?dates=${DATE}`
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
        gameObj['completed'] = game.competitions[0].status.type.completed
        game.competitions[0].competitors.forEach(c => {
            if (c['homeAway'] === 'home') {
                gameObj['homeScore'] = parseInt(c.score);
            } else {
                gameObj['awayScore'] = parseInt(c.score);
            }
        });
        lastNightGames.push(gameObj);
    }
    return lastNightGames
}

const rounded = num => Math.round(num * 100) / 100;

const saveOldInfo = (teams) => {
    const jsonString = JSON.stringify(teams)
    fs.writeFile(`./csv/mlsDB/mls${DATE}.json`, jsonString, (err) => {
        if (err) {
            console.error(err);
        }
        console.log('JSON file has been created successfully!');
    });
    fs.writeFile(`./src/mlsData.json`, jsonString, (err) => {
        if (err) {
            console.error(err);
        }
        console.log('JSON file has been created successfully!');
    });
}

const updateInfo = async () => {
    const games = await getLastNightGames()
    const client = await pool.connect();
    const resultTeams = await pool.query('SELECT * FROM mls_teams;')
    const resultGames = await pool.query('SELECT * FROM mls_games;')
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
        if (g.completed) {
            const netScore = g.homeScore - g.awayScore
            const homeTeam = teams.find(t => t.name === g.homeTeam)
            const awayTeam = teams.find(t => t.name === g.awayTeam)
            const homeName = homeTeam.name
            const awayName = awayTeam.name
            homeTeam.rating = rounded((netScore + awayTeam.rating)*0.1 + (homeTeam.rating * 0.9))
            awayTeam.rating = rounded((netScore * -1 + homeTeam.rating)*0.1 + (awayTeam.rating * 0.9))
            homeTeam.xg = rounded((xg[homeName] + awayTeam.xg)*0.1 + (homeTeam.xg * 0.9))
            awayTeam.xg = rounded((xg[awayName] + homeTeam.xg)*0.1 + (awayTeam.xg * 0.9))
            await pool.query(`INSERT INTO mls_games (id, home_team, away_team, home_score, away_score, date)
                VALUES (${g.id}, '${g.homeTeam}', '${g.awayTeam}', ${g.homeScore}, ${g.awayScore}, '${g.date}')`)
        }
    }
    for (let team of teams) {
        await pool.query(`UPDATE mls_teams 
            SET rating = ${team.rating}, xg = ${team.xg}
            WHERE id = ${team.id};`)
    }
    client.release();
    pool.end();
} 

updateInfo()