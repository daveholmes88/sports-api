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

const handler = async week => {
    const games = [];
    const jsonWeek = await fetch(
        `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2024&seasontype=2&week=${week}`
    );
    const weekData = await jsonWeek.json();
    const schedule = weekData.content.schedule;
    const dates = Object.keys(schedule);
    dates.forEach(date => {
        schedule[date].games.forEach(game => {
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
            });
        });
    });
    const client = await pool.connect();
    for (let game of games) {
        const sql = "SELECT * FROM nfl_games WHERE away_team = $1";
        const allAwayGames = await client.query(sql, [game.away]);
        const recent = allAwayGames.rows.filter(g => g.week === week-1 || g.week === week-2 || g.week === week-3)
        if (recent.length > 1) game.allAway = true
    }
    const jsonLastWeek = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2024&seasontype=2&week=${
            week - 1
        }`
    );
    const lastWeekData = await jsonLastWeek.json();
    const lastWeekGames = [];
    for (const game of lastWeekData.events) {
        const gameArray = game.name.split(' at ');
        const gameObj = {};
        gameObj['homeTeam'] = gameArray[1];
        gameObj['awayTeam'] = gameArray[0];
        gameObj['date'] = game.date.split('T')[0];
        game.competitions[0].competitors.forEach(c => {
            if (c['homeAway'] === 'home') {
                gameObj['homeScore'] = parseInt(c.score);
            } else {
                gameObj['awayScore'] = parseInt(c.score);
            }
        });
        lastWeekGames.push(gameObj);
    }
    client.release();
    pool.end();
    return { games, lastWeekGames };
};

module.exports = { handler };
