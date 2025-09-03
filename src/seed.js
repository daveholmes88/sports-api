const fs = require('fs');
const pkg = require('pg');

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

// const reset = (async () => {
//     console.log('started')
//     const client = await pool.connect();
//     try {
//         const result = await pool.query(`SELECT * FROM teams`);
//         // console.log('result', result.rows)
//         result.rows.forEach(team => {
//             console.log('team', team)
//             pool.query((`UPDATE teams 
//             SET off_score = ${0}, off_miss = ${0}, def_score = ${0}, def_miss = ${0}, games_played = ${0}
//             WHERE id = ${team.id}`))
//         })
//     } catch (err) {
//         console.error(err);
//     } finally {
//         client.release();
//         pool.end();
//     }
// })

// reset()

const createTable = (async () => {
    const client = await pool.connect();
    try {
        pool.query((`CREATE TABLE ncaaf_teams (
                id SERIAL PRIMARY KEY,
                name varchar(50),
                rating float
            )`
        ))
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
})

// createTable()

const updateTable = (async () => {
    const client = await pool.connect();
    try {
        pool.query((`ALTER TABLE wnba_games ADD COLUMN date varchar(20);`
        ))
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
})

// updateTable()

const seed = async () => {
    const json = fs.readFileSync('../cvs/espnNcaaf.json', 'utf8');
    const fpi = JSON.parse(json);
    const client = await pool.connect();
    const result = await pool.query('SELECT * FROM wnba_teams;')
    const teams = result.rows
    let count = 0 
    try {
        teams.forEach(async (team) => {
            count += 1
            const offensiveTeam = offense.find(t => t.team === team.team)
            const defensiveTeam = defense.find(t => t.team === team.team)
            let adjustedDvoa = (defensiveTeam.rankings + offensiveTeam.rankings)/10
            adjustedDvoa = Math.round(adjustedDvoa * 100) / 100
            const espn = fpi.find(t => t.name === team.team)
            await pool.query(`UPDATE wnba_teams 
                SET adjusted_dvoa = ${adjustedDvoa}, espn_api = ${espn.rankings}
                WHERE id = ${team.id};`)
        })
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

// seed()

const jeff = {
   San_Francisco_49ers: 26.79,
   Buffalo_Bills: 24.87,
   Detroit_Lions: 25.09,
   Kansas_City_Chiefs: 25.19,
   Houston_Texans: 24.32,
   Baltimore_Ravens: 23.62,
   Philadelphia_Eagles: 24.17,
   Miami_Dolphins: 23.66, 
   Green_Bay_Packers: 21.77, 
   Cincinnati_Bengals: 23.05,
   New_York_Jets: 22.33,
   Los_Angeles_Rams: 21.44,
   Dallas_Cowboys: 21.17,
   Jacksonville_Jaguars: 20.80,
   Pittsburgh_Steelers: 21.28,
   Cleveland_Browns: 19.35,
   Chicago_Bears: 20.55,
   Seattle_Seahawks: 20.22,
   Indianapolis_Colts: 19.77, 
   Atlanta_Falcons: 19.07,
   Minnesota_Vikings: 20.01,
   Arizona_Cardinals: 17.93,  
   Los_Angeles_Chargers: 18.32,
   Tampa_Bay_Buccaneers: 17.85,
   Tennessee_Titans: 16.73,
   New_Orleans_Saints: 17.3,
   Washington_Commanders: 14.67,
   Las_Vegas_Raiders: 14.45,
   New_England_Patriots: 15.53,
   Denver_Broncos: 14.21,
   New_York_Giants: 13.15,
   Carolina_Panthers: 10.57,
}

const getLastWeekGames = async () => {
    const jsonLastWeek = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2024&seasontype=2&week=3`
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

const updateColumn = async () => {
    // const json = fs.readFileSync('./ffpRankings.json', 'utf8');
    // const fpi = JSON.parse(json);
    await pool.connect();
    const games = await getLastWeekGames()
    // const teamsArray = Object.keys(jeff)
    try {
        // teamsArray.forEach(async (team) => {
        //     const name = team.replaceAll('_', ' ')
        //     console.log(name)
        //     const currentTeam = originalTeams.find(t => t.team === name)
        //     console.log(currentTeam) 
        //     await pool.query(`UPDATE football_teams 
        //          SET jeff = ${jeff[team]}
        //          WHERE id = ${currentTeam.id};`)
        //     })
        games.forEach(async (game) => {
            await pool.query(`UPDATE nfl_games 
                SET week = 3
                WHERE id = ${game.id};`)
        })
    } catch (err) {
        console.error(err);
    }
    // client.release();
    // pool.end();
}

// updateColumn()

const seedNba = async () => {
    const jsonTeams = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams`
    );
    const teamData = await jsonTeams.json();
    teamData.sports[0].leagues[0].teams.forEach(async (game) => {
        console.log(game.team.id)
        await pool.query(`INSERT INTO nba_teams(id, name)
            VALUES (${game.team.id}, '${game.team.displayName}');`)
    })
}

// seedNba()

const nbaRatings = (async () => {
    console.log('started')
    const client = await pool.connect();
    const json = fs.readFileSync('../csv/espnNcaaf.json', 'utf8');
    const espn = JSON.parse(json);
    console.log(espn)
    let count = 129 
    try {
        espn.forEach(t => {
            const { name, rankings } = t
            count += 1
            pool.query((`INSERT INTO ncaaf_teams (id, name, rating)
                VALUES (${count}, '${name}', ${rankings});`))
        })
    } catch (err) {
        console.error(err);
    } finally {
        // client.release();
        // pool.end();
    }
})

// nbaRatings()

const nbaFix = (async () => {
    const json = fs.readFileSync('./data/NBA20250213.json', 'utf8');
    const teams = JSON.parse(json);
    console.log(teams)
    for (let team of teams) {
        // console.log(team)
        await pool.query(`INSERT INTO nba_teams 
            SET rating = ${team.rating}
            WHERE id = ${team.id};`)
    }
})
// nbaFix()

const mlsRatings = {
'LA Galaxy': 5.82,
'Inter Miami CF': 5.70,
'Columbus Crew': 5.57,
'LAFC': 5.49,
'Seattle Sounders FC': 5.42,
'New York Red Bulls': 5.39,
'Real Salt Lake': 5.34,
'Orlando City SC': 5.26,
'FC Cincinnati': 5.26,
'Houston Dynamo FC': 5.25,
'Vancouver Whitecaps': 5.16,
'New York City FC': 5.09,
'Charlotte FC': 5.09,
'Minnesota United FC': 5.07,
'Atlanta United FC': 5.06,
'Philadelphia Union': 5.03,
'Portland Timbers': 5.00,
'Colorado Rapids': 4.90,
'Austin FC': 4.87,
'FC Dallas': 4.81,
'CF Montréal': 4.72,
'St. Louis CITY SC': 4.71,
'Nashville SC': 4.63,
'San Diego FC': 4.60,
'D.C. United': 4.58,
'Sporting Kansas City': 4.52,
'San Jose Earthquakes': 4.50,
'Toronto FC': 4.45,
'Chicago Fire FC': 4.41,
'New England Revolution': 4.31
}


const seedMls = async () => {
    const jsonTeams = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams`
    );
    const teamData = await jsonTeams.json();
    teamData.sports[0].leagues[0].teams.forEach(async (team) => {
        const { id, displayName } = team.team
        await pool.query(`INSERT INTO mls_teams(id, name, rating)
            VALUES (${id}, '${displayName}', ${mlsRatings[displayName]});`)
    })
}

// seedMls()
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

const rounded = num => Math.round(num * 100) / 100;

const mlsFix = (async () => {
    // await pool.connect();
    const json = fs.readFileSync('./mlsData.json', 'utf8');
    const teams = JSON.parse(json);
    const jsonLastNight = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard?dates=20250223`
    );
    const lastNightData = await jsonLastNight.json();
    const lastNightGames = []
    for (const game of lastNightData.events) {
        const gameArray = game.name.split(' at ');
        const gameObj = {};
        gameObj['homeTeam'] = gameArray[1];
        gameObj['awayTeam'] = gameArray[0];
        lastNightGames.push(gameObj);
    }
    for (const game of lastNightGames) {
        const homeTeam = teams.find(t => t.name === game.homeTeam)
        const awayTeam = teams.find(t => t.name === game.awayTeam)
        const homeName = homeTeam.name
        const awayName = awayTeam.name
        homeTeam.xg = rounded((xg[homeName] + awayTeam.rating)*0.1 + (homeTeam.rating * 0.9))
        awayTeam.xg = rounded((xg[awayName] + homeTeam.rating)*0.1 + (awayTeam.rating * 0.9))
    }
    console.log(teams)
    for (let team of teams) {
        if (team.xg) {
            await pool.query(`UPDATE mls_teams 
                SET xg = ${team.xg}
                WHERE id = ${team.id};`)
        }
    }
})
// mlsFix()

const clearData = async() => {
    const client = await pool.connect();
    try {
        pool.query((`DELETE FROM ;`
        ))
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

// clearData()

const nflNewYear = (async () => {
    const client = await pool.connect();
    const json = fs.readFileSync('./csv/espnNfl.json', 'utf8');
    const teams = JSON.parse(json);
    for (let team of teams) {
        console.log(team)
        const { name, rankings } = team
        await pool.query(`UPDATE football_teams 
            SET espn_api = ${rankings}
            WHERE team = '${name}';`)
    }
})
nflNewYear()