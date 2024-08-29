const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config()

const { Pool } = pkg
const password = process.env.PASSWORD
const week = 1

const pool = new Pool({
  user: 'davidholmes',
  database: 'backendgambling_development',
  password: password,
  port: 5432, // This is the default PostgreSQL port
//   ssl: {
//     rejectUnauthorized: false
//   }
});

const divisions = {
    ChicagoBears: 'nfcNorth',
    GreenBayPackers: 'nfcNorth',
    MinnesotaVikings: 'nfcNorth',
    DetroitLions: 'nfcNorth',
    PittsburghSteelers: 'afcNorth',
    BaltimoreRavens: 'afcNorth',
    ClevelandBrowns: 'afcNorth', 
    CincinnatiBengals: 'afcNorth',
    NewYorkJets: 'afcEast',
    MiamiDolphins: 'afcEast',
    NewEnglandPatriots: 'afcEast',
    BuffaloBills: 'afcEast',
    JacksonvilleJaguars: 'afcSouth',
    TennesseeTitans: 'afcSouth',
    HoustonTexans: 'afcSouth',
    IndianapolisColts: 'afcSouth',
    DenverBroncos: 'afcWest',
    LosAngelesChargers: 'afcWest',
    LasVegasRaiders: 'afcWest',
    KansasCityChiefs: 'afcWest',
    PhiladelphiaEagles: 'nfcEast',
    NewYorkGiants: 'nfcEast',
    DallasCowboys: 'nfcEast',
    WashingtonCommanders: 'nfcEast',
    TampaBayBuccaneers: 'nfcSouth',
    SeattleSeahawks: 'nfcWest',
    SanFrancisco49ers: 'nfcWest',
    ArizonaCardinals: 'nfcWest',
    AtlantaFalcons: 'nfcSouth',
    NewOrleansSaints: 'nfcSouth', 
    CarolinaPanthers: 'nfcSouth',
    LosAngelesRams: 'nfcWest',
}

const conferences = {
    ChicagoBears: 'nfc',
    GreenBayPackers: 'nfc',
    MinnesotaVikings: 'nfc',
    DetroitLions: 'nfc',
    PittsburghSteelers: 'afc',
    BaltimoreRavens: 'afc',
    ClevelandBrowns: 'afc', 
    CincinnatiBengals: 'afc',
    NewYorkJets: 'afc',
    MiamiDolphins: 'afc',
    NewEnglandPatriots: 'afc',
    BuffaloBills: 'afc',
    JacksonvilleJaguars: 'afc',
    TennesseeTitans: 'afc',
    HoustonTexans: 'afc',
    IndianapolisColts: 'afc',
    DenverBroncos: 'afc',
    LosAngelesChargers: 'afc',
    LasVegasRaiders: 'afc',
    KansasCityChiefs: 'afc',
    PhiladelphiaEagles: 'nfc',
    NewYorkGiants: 'nfc',
    DallasCowboys: 'nfc',
    WashingtonCommanders: 'nfc',
    TampaBayBuccaneers: 'nfc',
    SeattleSeahawks: 'nfc',
    SanFrancisco49ers: 'nfc',
    ArizonaCardinals: 'nfc',
    AtlantaFalcons: 'nfc',
    NewOrleansSaints: 'nfc', 
    CarolinaPanthers: 'nfc',
    LosAngelesRams: 'nfc',
}

const bye = {
    5: ['Detroit Lions', 'Los Angeles Chargers', 'Philadelphia Eagles', 'Tennessee Titans'],
    6: ['Kansas City Chiefs', 'Los Angeles Rams', 'Miami Dolphins', 'Minnesota Vikings'],
    7: ['Chicago Bears', 'Dallas Cowboys'],
    9: ['Pittsburgh Steelers', 'San Francisco 49ers'],
    10: ['Cleveland Browns', 'Green Bay Packers', 'Las Vegas Raiders', 'Seattle Seahawks'],
    11: ['Arizona Cardinals', 'Carolina Panthers', 'New York Giants', 'Tampa Bay Buccaneers'], 
    12: ['Atlanta Falcons', 'Buffalo Bills', 'Cincinnati Bengals', 'Jacksonville Jaguars', 'New Orleans Saints', 'New York Jets'],
    14: ['Baltimore Ravens', 'Denver Broncos', 'Houston Texans', 'Indianapolis Colts', 'New England Patriots', 'Washington Commanders']
}
const longDistance = {
    SeattleSeahawks: ['Detroit Lions', 'Philadelphia Eagles', 'Tennessee Titans', 'Miami Dolphins', 'Chicago Bears', 'Dallas Cowboys', 'Pittsburgh Steelers', 'Cleveland Browns', 'Carolina Panthers', 'New York Giants', 'Tampa Bay Buccaneers', 'Atlanta Falcons', 'Buffalo Bills', 'Cincinnati Bengals', 'Jacksonville Jaguars', 'New Orleans Saints', 'New York Jets', 'Baltimore Ravens', 'Houston Texans', 'Indianapolis Colts', 'New England Patriots', 'Washington Commanders'],
    SanFrancisco49ers: ['Detroit Lions', 'Philadelphia Eagles', 'Tennessee Titans', 'Miami Dolphins', 'Chicago Bears', 'Pittsburgh Steelers', 'Cleveland Browns', 'Carolina Panthers', 'New York Giants', 'Tampa Bay Buccaneers', 'Atlanta Falcons', 'Buffalo Bills', 'Cincinnati Bengals', 'Jacksonville Jaguars', 'New Orleans Saints', 'New York Jets', 'Baltimore Ravens', 'Indianapolis Colts', 'New England Patriots', 'Washington Commanders', 'Green Bay Packers'],
    LosAngelesChargers: ['Detroit Lions', 'Philadelphia Eagles', 'Tennessee Titans', 'Miami Dolphins', 'Chicago Bears', 'Pittsburgh Steelers', 'Cleveland Browns', 'Carolina Panthers', 'New York Giants', 'Tampa Bay Buccaneers', 'Atlanta Falcons', 'Buffalo Bills', 'Cincinnati Bengals', 'Jacksonville Jaguars', 'New Orleans Saints', 'New York Jets', 'Baltimore Ravens', 'Indianapolis Colts', 'New England Patriots', 'Washington Commanders', 'Green Bay Packers'],
    LosAngelesRams: ['Detroit Lions', 'Philadelphia Eagles', 'Tennessee Titans', 'Miami Dolphins', 'Chicago Bears', 'Pittsburgh Steelers', 'Cleveland Browns', 'Carolina Panthers', 'New York Giants', 'Tampa Bay Buccaneers', 'Atlanta Falcons', 'Buffalo Bills', 'Cincinnati Bengals', 'Jacksonville Jaguars', 'New Orleans Saints', 'New York Jets', 'Baltimore Ravens', 'Indianapolis Colts', 'New England Patriots', 'Washington Commanders', 'Green Bay Packers'],
    ArizonaCardinals: ['Philadelphia Eagles', 'Miami Dolphins', 'Pittsburgh Steelers', 'Cleveland Browns', 'Carolina Panthers', 'New York Giants', 'Tampa Bay Buccaneers', 'Buffalo Bills', 'Jacksonville Jaguars', 'New York Jets', 'Baltimore Ravens', 'New England Patriots', 'Washington Commanders'],
    LasVegasRaiders: ['Detroit Lions', 'Philadelphia Eagles', 'Miami Dolphins', 'Pittsburgh Steelers', 'Cleveland Browns', 'Carolina Panthers', 'New York Giants', 'Tampa Bay Buccaneers', 'Buffalo Bills', 'Jacksonville Jaguars', 'New York Jets', 'Baltimore Ravens', 'New England Patriots', 'Washington Commanders'],
    DenverBroncos: ['Miami Dolphins'],
    DallasCowboys: ['Seattle Seahawks'],
    HoustonTexans: ['Seattle Seahawks'],
    DetroitLions: ['Seattle Seahawks', 'San Francisco 49ers', 'Los Angeles Chargers', 'Los Angeles Rams', 'Las Vegas Raiders'],
    ChicagoBears: ['Seattle Seahawks', 'San Francisco 49ers', 'Los Angeles Chargers', 'Los Angeles Rams'],
    GreenBayPackers: ['Seattle Seahawks', 'San Francisco 49ers', 'Los Angeles Chargers', 'Los Angeles Rams', 'Las Vegas Raiders'],
    MinnesotaVikings: [], 
    PittsburghSteelers: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    BaltimoreRavens: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    ClevelandBrowns: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    CincinnatiBengals: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    NewYorkJets: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    MiamiDolphins: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals', 'Denver Broncos'],
    NewEnglandPatriots: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    BuffaloBills: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    JacksonvilleJaguars: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    TennesseeTitans: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Seattle Seahawks'],
    IndianapolisColts: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Seattle Seahawks'],
    KansisCityChiefs: [],
    PhiladelphiaEagles: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    NewYorkGiants: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    WashingtonCommanders: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    TampaBayBuccaneers: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    AtlantaFalcons: ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks', 'Arizona Cardinals'],
    NewOrleansSaints: ['Seattle Seahawks', 'San Francisco 49ers', 'Los Angeles Chargers', 'Los Angeles Rams'],
    CarolinaPanthers: ['Seattle Seahawks', 'San Francisco 49ers', 'Los Angeles Chargers', 'Los Angeles Rams', 'Las Vegas Raiders'],
}

const thursday = {
    0: [],
    1: ['Kansas City Chiefs', 'Baltimore Ravens', 'Green Bay Packers', 'Philadelphia Eagles'],
    2: ['Buffalo Bills', 'Miami Dolphins'], 
    3: ['New England Patriots', 'New York Jets'], 
    4: ['Dallas Cowboys', 'New York Giants'], 
    5: ['Tampa Bay Buccaneers', 'Atlanta Falcons'],
    6: ['San Francisco 49ers', 'Seattle Seahawks'],
    7: ['Denver Broncos', 'New Orleans Saints'], 
    8: ['Minnesota Vikings', 'Los Angeles Rams'],
    9: ['Houston Texans', 'New York Jets'], 
    10: ['Cincinnati Bengals', 'Baltimore Ravens'], 
    11: ['Washington Commanders', 'Philadelphia Eagles'],
    12: ['Pittsburgh Steelers', 'Cleveland Browns'],
    13: ['Chicago Bears', 'Detroit Lions', 'New York Giants', 'Dallas Cowboys', 'Miami Dolphins', 'Green Bay Packers', 'Las Vegas Raiders', 'Kansas City Chiefs'],
    14: ['Green Bay Packers', 'Detroit Lions'], 
    15: ['Los Angeles Rams', 'San Francisco 49ers'],
    16: ['Cleveland Browns', 'Cincinnati Bengals'], 
    17: ['Kansas City Chiefs', 'Pittsburgh Steelers', 'Baltimore Ravens', 'Houston Texans', 'Seattle Seahawks', 'Chicago Bears']
}

const friday = {
    1: ['Green Bay Packers', 'Philadelphia Eagles'],
    13: ['Las Vegas Raiders', 'Kansas City Chiefs']
}

const monday = {
    0: [{away: '', home: ''}], 
    1: [{away: 'New York Jets', home: 'San Francisco 49ers'}], 
    2: [{away: 'Atlanta Falcons', home: 'Philadelphia Eagles'}], 
    3: [{away: 'Jacksonville Jaguars', home: 'Buffalo Bills'}, {away: 'Washington Commanders', home: 'Cincinnati Bengals'}],
    4: [{away: 'Tennessee Titans', home: 'Miami Dolphins'}, {away: 'Seattle Seahawks', home: 'Detroit Pistons'}],
    5: [{away: 'New Orleans Saints', home: 'Kansas City Chiefs'}],
    6: [{away: 'Buffalo Bills', home: 'New York Jets'}],
    7: [{away: 'Baltimore Ravens', home:'Tampa Bay Buccaneers'}, {away: 'Los Angeles Chargers', home: 'Arizona Cardinals'}], 
    8: [{away: 'New York Giants', home: 'Pittsburgh Steelers'}],
    9: [{away: 'Tampa Bay Buccaneers', home: 'Kansas City Chiefs'}], 
    10: [{away: 'Miami Dolphins', home: 'Los Angeles Rams'}],
    11: [{away: 'Houston Texans', home: 'Dallas Cowboys'}],
    12: [{away: 'Baltimore Ravens', home: 'Los Angeles Chargers'}],
    13: [{away: 'Cleveland Browns', home: 'Denver Broncos'}],
    14: [{away: 'Cincinnati Bengals', home: 'Dallas Cowboys'}],
    15: [{away: 'Chicago Bears', home: 'Minnesota Vikings'}, {away: 'Atlanta Falcons', home: 'Las Vegas Raiders'}],
    16: [{away: 'New Orleans Saints', home: 'Green Bay Packers'}],
    17: [{away: 'Detroit Lions', home: 'San Francisco 49ers'}]
}

const pacific = ['Los Angeles Chargers', 'Los Angeles Rams', 'San Francisco 49ers', 'Las Vegas Raiders', 'Seattle Seahawks']
const mountain = ['Arizona Cardinals', 'Denver Broncos']
const central = ['Detroit Lions', 'Tennessee Titans', 'Kansas City Chiefs', 'Minnesota Vikings', 'Chicago Bears', 'Dallas Cowboys', 'Green Bay Packers', 'New Orleans Saints', 'Houston Texans']
const eastern = ['Philadelphia Eagles', 'Miami Dolphins', 'Pittsburgh Steelers', 'Cleveland Browns', 'Carolina Panthers', 'New York Giants', 'Tampa Bay Buccaneers', 'Atlanta Falcons', 'Buffalo Bills', 'Cincinnati Bengals', 'Jacksonville Jaguars', 'New York Jets', 'Baltimore Ravens', 'Indianapolis Colts', 'New England Patriots', 'Washington Commanders']

const overtimeLastWeek = [
    {away: '', home: ''}
]

const playoffs = {
    HoustonTexans: 'Baltimore Ravens',
    GreenBayPackers: 'San Francisco 49ers',
    TampaBayBuccaneers: 'Detroit Lions', 
    BuffaloBills: 'Kansas City Chiefs', 
    ClevelandBrowns: 'Houston Texans',
    MiamiDolphins: 'Kansas City Chiefs',
    DallasCowboys: 'Green Bay Packers',
    LosAngelesRams: 'Detroit Lions',
    PittsburghSteelers: 'Buffalo Bills',
    PhiladelphiaEagles: 'Tampa Bay Buccaneers',
    BaltimoreRavens: 'Kansas City Chiefs',
    DetroitLions: 'San Francisco 49ers',
    SanFrancisco49ers: 'Kansas City Chiefs', 
}


const sameDivision = (away, home) => {
    let impact = 0
    if (divisions[away.replaceAll(' ', '')] === divisions[home.replaceAll(' ', '')]) impact = -1
    return impact 
}

const differentConference = (away, home) => {
    let impact = 0
    if (conferences[away.replaceAll(' ', '')] !== conferences[home.replaceAll(' ', '')]) impact = 1
    return impact
}

const checkBlowouts = (away, home, lastWeekGames) => {
    let impact = 0
    ag = lastWeekGames.find(g => g.homeTeam === away || g.awayTeam === away)
    const awayMargin = ag.homeTeam === away ? ag.homeScore - ag.awayScore : ag.awayScore - ag.homeScore
    hg = lastWeekGames.find(g => g.homeTeam === home || g.awayTeam === home)
    const homeMargin = hg.homeTeam === away ? hg.homeScore - hg.awayScore : hg.awayScore - hg.homeScore
    if (awayMargin < -18) impact -= 2
    if (awayMargin < -28) impact -= 2
    if (homeMargin < -18) impact += 2
    if (homeMargin < -28) impact += 2
    return impact
}

const byeLastWeek = (home, away) => {
    let impact = 0
    const byeLastWeek = bye[week-1]
    if (byeLastWeek) {
        if (byeLastWeek.find(team => team === home.team)) {
            const { ranking } = home
            if (ranking < -2) impact += 4
            if (ranking >= -2 && ranking < 2) impact += 5
            if (ranking >= 2) impact += 7
        }
        if (byeLastWeek.find(team => team === away.team)) {
            const { ranking } = away
            if (ranking < -2) impact -= 5
            if (ranking >= -2 && ranking < 2) impact -= 6
            if (ranking >= 2) impact -= 8
        }
    }
    return impact
}

const checkNightGames = (date) => {
    let impact = 0 
    if (date.includes('Thu') || date.includes('Wed')) {
        impact = 2
    }
    if (date.includes('Mon')) {
        impact = 2
    }
    if (date.includes('Fri')) {
        impact = 2
    }
    if (date.includes('Sun') && date.includes('8:20')) {
        impact = 4
    }
    return impact
}

const superBowlCheck = (away, home) => {
    let impact = 0
    if (home === 'Kansas City Chiefs') impact += 2
    if (away === 'Kansas City Chiefs') impact -= 2
    if (home === 'San Francisco 49ers') impact -= 2
    if (away === 'San Francisco 49ers') impact += 2
    return impact
}

const checkLongDistance = (away, home) => {
    let impact = 0 
    if (longDistance[away.replaceAll(' ', '')].find(t => t === home)) impact = 1
    return impact
}

const shortDistances = [
    ['Tampa Bay Buccaneers', 'Jacksonville Jaguars', 'Miami Dolphins'],
    ['Dallas Cowboys', 'Houston Texans'],
    ['Atlanta Falcons', 'Carolina Panthers'],
    ['Los Angeles Rams', 'Los Angeles Chargers', 'Las Vegas Raiders'],
    ['Indianapolis Colts', 'Cincinnati Bengals'],
    ['Philadlphia Eagles', 'New York Giants', 'New York Jets', 'Washington Commanders', 'New England Patriots', 'Baltimore Ravens', 'Buffalo Bills'],
    ['Chicago Bears', 'Green Bay Packers']
]

const noDistance = [
    ['New York Jets', 'New York Giants'],
    ['Los Angeles Rams', 'Los Angeles Chargers'],
    ['Washington Commanders', 'Baltimore Ravens']
]

const checkShortDistance = (away, home) => {
    let impact = 0
    const awayIncluded = shortDistances.find(a => a.includes(away))
    if (awayIncluded){
        if (awayIncluded.includes(home)) impact = -1
    }
    return impact
}

const checkNoDistance = (away, home) => {
    impact = 0
    const awayIncluded = noDistance.find(a => a.includes(away))
    if (awayIncluded) {
        if (awayIncluded.includes(home)) impact = -1
    }
    return impact
}

const thursdayCheck = (awayTeam, homeTeam) => {
    let impact = 0
    if (thursday[week-1].find(t => t === awayTeam)) {
        impact -= 1
    }
    if (thursday[week-1].find(t => t === homeTeam)) {
        impact += 1
    }
    return impact
}

const mondayCheck = (awayTeam, homeTeam) => {
    let impact = 0
    monday[week-1].forEach(m => {
        if (m.home === awayTeam) {
            impact -= 4
        }
        if (m.away === homeTeam) {
            impact -= 6
        }
        if (m.away === awayTeam) {
            impact += 8 
        } 
    })
    return impact
}

const overtimeCheck = (awayTeam, homeTeam) => {
    let impact = 0
    overtimeLastWeek.forEach(g => {
        if (awayTeam === g.home) {
            impact += 4
        }
        if (awayTeam === g.away) {
            impact += 2
        }
        if (homeTeam === g.home) {
            impact -= 4
        }
        if (homeTeam === g.away) {
            impact -= 2
        }
    })
    return impact
}

const timeZoneCheck = (game) => {
    const { away, home, date } = game
    let impact = 0
    const hour = parseInt(date.split(' at ')[1].split(':')[0])
    if (hour === 1) {
        if (pacific.find(team => team === away)) {
            impact += 2
        }
        if (mountain.find(team => team === away)) {
            impact += 1
        }
        if (pacific.find(team => team === home)) {
            impact -= 2
        }
        if (mountain.find(team => team === home)) {
            impact -= 1
        }
    }
    if (hour > 6) {
        if (eastern.find(team => team === away)) {
            impact += 6
        }
        if (central.find(team => team === away)) {
            impact += 3
        }
        if (mountain.find(team => team === away)) {
            impact += 1
        }
        if (eastern.find(team => team === home)) {
            impact -= 6
        }
        if (central.find(team => team === home)) {
            impact -= 3
        }
        if (mountain.find(team => team === home)) {
            impact -= 1
        }
    }
    return impact
} 

const awayCheck = (away, lastWeekGames) => {
    let check = false
    const alsoLastWeek = lastWeekGames.find(game => game.awayTeam === away)
    if (alsoLastWeek) {
        check = true
    }
    return check
}

const playoffCheck = (away, home) => {
    let impact = 0
    if (playoffs[away.replaceAll(' ', '')] === home) {
        impact -= 3
    }
    if (playoffs[home.replaceAll(' ', '')] === away) {
        impact += 3
    }
    return impact
}

const handler = async () => {
    const header = [['Home Team', 'Rank', 'Away Team', 'Rank', 'Same Division', 'Different Conference', 'Night Game', 'Long Distance', 'Short Distance', 'Thurs Night Last Week', 'Mon Night Game Last Week', 'Overtime Game Last Week', 'Playoff Rematch', 'Timezone Factors', 'Super Bowl Impact', 'Bye Week', 'Spread', 'Back to Back Away',]];
    const games = [];
    const end = []
    // for (let i = 1; i < 19; i++) {
        const jsonWeek = await fetch(
            `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2024&seasontype=2&week=${week}`
        );
        const weekData = await jsonWeek.json();
        const schedule = weekData.content.schedule;
        const dates = Object.keys(schedule);
        dates.forEach(date => {
            schedule[date].games.forEach(game => {
                const gameArray = game.name.split(' at ')
                games.push({ 
                    away: gameArray[0],
                    home: gameArray[1],
                    date: game.status.type.detail,
                    id: game.id
                })
            });
        });
        const jsonLastWeek = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2023&seasontype=2&week=17`
        );
        const lastWeekData = await jsonLastWeek.json();
        const lastWeekGames = []
        for (const game of lastWeekData.events) {
            const gameArray = game.name.split(' at ')
            const gameObj = {}
            gameObj['homeTeam'] = gameArray[1]
            gameObj['awayTeam'] = gameArray[0]
            gameObj['date'] = game.date.split('T')[0]
            game.competitions[0].competitors.forEach(c => {
                if (c["homeAway"] === 'home') {
                    gameObj['homeScore'] = parseInt(c.score)
                } else {
                    gameObj['awayScore'] = parseInt(c.score)
                }
            })
            lastWeekGames.push(gameObj)
        }
        const client = await pool.connect();
        const result = await pool.query(`SELECT * FROM football_teams`);
        const teams = result.rows
        games.forEach((game) => {
            const awayTeam = game.away
            const homeTeam = game.home
            const away = teams.find(team => awayTeam === team.team)
            const home = teams.find(team => homeTeam === team.team)
            let spread = home.ranking - away.ranking
            const division = sameDivision(awayTeam, homeTeam)
            spread += division
            const conference = differentConference(awayTeam, homeTeam)
            spread += conference
            const bye = byeLastWeek(home, away, spread)
            spread += bye
            let backToBackAway = false
            const blowouts = checkBlowouts(awayTeam, homeTeam, lastWeekGames)
            spread += blowouts
            // backToBackAway = awayCheck(awayTeam, lastWeekGames)
            // spread += backToBackAway
            const nightGame = checkNightGames(game.date)
            spread += nightGame 
            const superBowl = superBowlCheck(awayTeam, homeTeam)
            spread += superBowl
            const longDistance = checkLongDistance(awayTeam, homeTeam)
            spread += longDistance
            const shortDistance = checkShortDistance(awayTeam, homeTeam)
            spread += shortDistance
            const noDistance = checkNoDistance(awayTeam, homeTeam)
            spread += noDistance
            const thursday = thursdayCheck(awayTeam, homeTeam)
            spread += thursday
            const monday = mondayCheck(awayTeam, homeTeam)
            spread += monday
            const overtime = overtimeCheck(awayTeam, homeTeam)
            spread += overtime
            const timeZone =  timeZoneCheck(game)
            spread += timeZone
            const playoffRematch = playoffCheck(awayTeam, homeTeam)
            spread += playoffRematch
            end.push([home.team, home.ranking, away.team, away.ranking, division, conference, nightGame, longDistance, shortDistance, thursday, monday, overtime, playoffRematch, timeZone, superBowl, bye, Math.round(spread * 100) / 100, backToBackAway])
        })
        client.release();
        pool.end();
    const csvFromGames = convertArrayToCSV(end, {
        header,
        separator: ',',
    });
    fs.writeFile(`../csv/nflModelWeek${week}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
};

handler();