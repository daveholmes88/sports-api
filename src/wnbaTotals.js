const pkg = require('pg');
const fs = require('fs');

const { Pool } = pkg
const DATE = '20240518'
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

const rounded = num => Math.round(num * 100) / 100;

const updateInfo = async () => {
    const games = await getLastNightGames()
    const client = await pool.connect();
    const resultTeams = await pool.query('SELECT * FROM wnba_teams;')
    const resultGames = await pool.query('SELECT * FROM wnba_games;')
    const teams = resultTeams.rows
    const savedGames = resultGames.rows
    final = {}
    half = {}
    for (t in teams) {
        final[t.name] = []
        half[t.name] = []
    }
    for (let g of savedGames) {
        const { home_score, away_score, home_team, away_team, away_half_score, home_half_score } = g
        const total = home_score + away_score;
        const halfTotal = home_half_score + away_half_score;
        final[home_team].push(total)
        final[away_team].push(total)
        half[home_team].push(halfTotal)
        half[away_team].push(halfTotal)
    }
    for (let team of teams) {
        const {name, id} = team 
        const finals = final[team.name]
        const halves = half[team.name]
        let finalSum = 0
        let halfSum = 0
        finals.forEach(game => finalSum += game)
        halves.forEach(game => halfSum += game)
        finalSum = rounded(finalSum / finals.length)
        halfSum = rounded(halfSum / halves.length)
        await pool.query(`UPDATE wnba_teams 
            SET total = ${finalSum}, half = ${halfSum}
            WHERE id = ${team.id};`)
    }
    client.release();
    pool.end();
} 

updateInfo()