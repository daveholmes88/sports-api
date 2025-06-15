const fs = require('fs');
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

const wnbaFix = (async () => {
    const json = fs.readFileSync('./src/wnbaData.json', 'utf8');
    const teams = JSON.parse(json);
    console.log(teams)
    for (let team of teams) {
        console.log(team)
        await pool.query(`UPDATE wnba_teams 
            SET half = ${team.half}
            WHERE name = '${team.name}';`)
    }
    pool.end();
})

wnbaFix()