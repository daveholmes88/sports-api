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

const rename = {
    SF: 'San Francisco 49ers',
    KC: 'Kansas City Chiefs',
    BAL: 'Baltimore Ravens',
    DET: 'Detroit Lions',
    BUF: 'Buffalo Bills',
    DAL: 'Dallas Cowboys',
    CIN: 'Cincinnati Bengals',
    PHI: 'Philadelphia Eagles',
    HOU: 'Houston Texans',
    GB: 'Green Bay Packers',
    MIA: 'Miami Dolphins',
    NYJ: 'New York Jets',
    LAR: 'Los Angeles Rams',
    CLE: 'Cleveland Browns',
    ATL: 'Atlanta Falcons',
    JAX: 'Jacksonville Jaguars',
    PIT: 'Pittsburgh Steelers',
    LAC: 'Los Angeles Chargers',
    CHI: 'Chicago Bears',
    IND: 'Indianapolis Colts',
    SEA: 'Seattle Seahawks',
    TB: 'Tampa Bay Buccaneers',
    ARI: 'Arizona Cardinals',
    LV: 'Las Vegas Raiders',
    MIN: 'Minnesota Vikings',
    NO: 'New Orleans Saints',
    TEN: 'Tennessee Titans',
    WSH: 'Washington Commanders',
    NYG: 'New York Giants',
    DEN: 'Denver Broncos',
    NE: 'New England Patriots',
    CAR: 'Carolina Panthers',
};

const streakCheck = (team, game, winners, week, type) => {
    let streak = 0
    for (let w = week-1; w > week-5; w--) {
        // console.log(team)
        // console.log(w)
        // console.log(winners[w][team])
        if (winners[w][team] === 'w') {
            streak += 1
        } else if (winners[w][team] === 'push' || !winners[w][team]) {
            streak += 0
        } else {
            break
        }
        if (streak > 2) {
            game[type+'Streak'] = 'winning'        
        }
    }
    streak = 0
    for (let w = week-1; w > week-5; w--) {
        if (winners[w][team] === 'l') {
            streak += 1
        } else if (winners[w][team] === 'push' || !winners[w][team]) {
            streak += 0
        } else {
            break
        }
        if (streak > 2) {
            game[type+'Streak'] = 'losing'
        }
    }
}

const getPreviousData = async (winners, g) => {
    const { id, home_team, away_team, home_score, away_score, week } = g
    if (!winners[week]) winners[week] = {}
    const jsonGame = await fetch(
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/odds`
    );
    const gameData = await jsonGame.json();
    const odds = gameData?.items[0].details || 'n/a';
    if (odds !== 'n/a') {
        const oddsArray = odds.split(' ')
        const favorite = rename[oddsArray[0]]
        const number = parseInt(oddsArray[1]) * -1
        if (favorite === home_team){
            if ((home_score - away_score) > number) {
                winners[week][home_team] = 'w'
                winners[week][away_team] = 'l'
            } else if (home_score - away_score === number) {
                winners[week][home_team] = 'push'
                winners[week][away_team] = 'push'
            } else {
                winners[week][home_team] = 'l'
                winners[week][away_team] = 'w'
            }
        }
        if (favorite === away_team) {
            if ((away_score - home_score) > number) {
                winners[week][away_team] = 'w'
                winners[week][home_team] = 'l'
            } else if (away_score - home_score === number) {
                winners[week][home_team] = 'push'
                winners[week][away_team] = 'push'
            } else {
                winners[week][away_team] = 'l'
                winners[week][home_team] = 'w'
            }
        }
    }
}

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
    });
    const client = await pool.connect();
    for (let game of games) {
        const sql = 'SELECT * FROM nfl_games WHERE away_team = $1';
        const allAwayGames = await client.query(sql, [game.away]);
        const recent = allAwayGames.rows.filter(
            g =>
                g.week === week - 1 ||
                g.week === week - 2 ||
                g.week === week - 3
        );
        if (recent.length > 1) game.allAway = true;
    }
    const jsonLastWeek = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2024&seasontype=2&week=${
            week - 1
        }`
    );
    const lastWeekData = await jsonLastWeek.json();
    const lastWeekGames = [];
    for (const game of lastWeekData.events) {
        const id = game.id
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
    const winners = {}
    for (let game of games) {
        const sql = 'SELECT * FROM nfl_games WHERE home_team = $1 OR away_team = $1';
        const allAwayGames = await client.query(sql, [game.away]);
        let checks = allAwayGames.rows.filter(g => g.week > (week-5))
        for (let g of checks) {
            await getPreviousData(winners, g)
        }
        const allHomeGames = await client.query(sql, [game.home]); 
        checks = allHomeGames.rows.filter(g => g.week > (week-5))
        for (let g of checks) {
            await getPreviousData(winners, g)
        }
    }
    console.log(winners[6])
    for (let game of games) {
        const { home, away } = game
        streakCheck(home, game, winners, week, 'home')
        streakCheck(away, game, winners, week, 'away')
    }
    client.release();
    pool.end();
    return { games, lastWeekGames };
};

module.exports = { handler };
