import pkg from 'pg';
import fs from 'fs'; 
const { week } = require('../variables/nfl');

const { Pool } = pkg
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

const getLastWeekGames = async () => {
    const jsonLastWeek = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2025&seasontype=2&week=${week}`
    );
    const lastWeekData = await jsonLastWeek.json();
    const lastWeekGames = [];
    for (const game of lastWeekData.events) {
        const gameArray = game.name.split(' at ');
        const gameObj = {};
        gameObj['homeTeam'] = gameArray[1];
        gameObj['awayTeam'] = gameArray[0];
        gameObj['date'] = game.date.split('T')[0];
        gameObj['id'] = parseInt(game.id)
        game.competitions[0].competitors.forEach(c => {
            if (c['homeAway'] === 'home') {
                gameObj['homeScore'] = parseInt(c.score);
            } else {
                gameObj['awayScore'] = parseInt(c.score);
            }
        });
        lastWeekGames.push(gameObj);
    }
    return lastWeekGames
}

const saveOldInfo = (teams) => {
    const jsonString = JSON.stringify(teams)
    fs.writeFile(`../..csv/nflDB/NFLWeek${week}.json`, jsonString, (err) => {
        if (err) {
            console.error(err);
        }
        console.log('JSON file has been created successfully!');
    });
}

const rounded = num => Math.round(num * 100) / 100;

const updateInfo = async () => { 
    const games = await getLastWeekGames()
    const client = await pool.connect();
    const resultTeams = await pool.query('SELECT * FROM football_teams;')
    const resultGames = await pool.query('SELECT * FROM nfl_games;')
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
            const netScore = g.homeScore - g.awayScore
            const homeTeam = teams.find(t => t.team === g.homeTeam)
            const awayTeam = teams.find(t => t.team === g.awayTeam)
            homeTeam.espn_api = rounded((netScore + awayTeam.espn_api)*0.1 + (homeTeam.espn_api * 0.9))
            awayTeam.espn_api = rounded((netScore * -1 + homeTeam.espn_api)*0.1 + (awayTeam.espn_api * 0.9))
            homeTeam.adjusted_dvoa = rounded((netScore + awayTeam.adjusted_dvoa)*0.1 + (homeTeam.adjusted_dvoa * 0.9))
            awayTeam.adjusted_dvoa = rounded((netScore * -1 + homeTeam.adjusted_dvoa)*0.1 + (awayTeam.adjusted_dvoa * 0.9))
            homeTeam.ffp_power = rounded((netScore + awayTeam.ffp_power)*0.1 + (homeTeam.ffp_power * 0.9))
            awayTeam.ffp_power = rounded((netScore * -1 + homeTeam.ffp_power)*0.1 + (awayTeam.ffp_power * 0.9))
            homeTeam.jeff = rounded((netScore + awayTeam.jeff)*0.1 + (homeTeam.jeff * 0.9))
            awayTeam.jeff = rounded((netScore * -1 + homeTeam.jeff)*0.1 + (awayTeam.jeff * 0.9))
            await pool.query(`INSERT INTO nfl_games (id, home_team, away_team, home_score, away_score, date, week)
                VALUES (${g.id}, '${g.homeTeam}', '${g.awayTeam}', ${g.homeScore}, ${g.awayScore}, '${g.date}', ${WEEK})`)
        }
    }
    for (let team of teams) {
        await pool.query(`UPDATE football_teams 
            SET ffp_power = ${team.ffp_power}, jeff = ${team.jeff}, adjusted_dvoa = ${team.adjusted_dvoa}, espn_api = ${team.espn_api}
            WHERE id = ${team.id};`)
    }
    client.release();
    pool.end();
}
updateInfo()