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
    KansisCityChiefs: 'afcWest',
    PhiladelphiaEagles: 'nfcEast',
    NewYorkGiants: 'nfcEast',
    DallasCowboys: 'nfcEast',
    WashingtonCommanders: 'nfcEast',
    TampaBayBuccaneers: 'nfcWest',
    SeattleSeahawks: 'nfcWest',
    SanFrancisco49ers: 'nfcWest',
    ArizonaCardinals: 'nfcWest',
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
    KansisCityChiefs: 'afc',
    PhiladelphiaEagles: 'nfc',
    NewYorkGiants: 'nfc',
    DallasCowboys: 'nfc',
    WashingtonCommanders: 'nfc',
    TampaBayBuccaneers: 'nfc',
    SeattleSeahawks: 'nfc',
    SanFrancisco49ers: 'nfc',
    ArizonaCardinals: 'nfc',
}

const bye = {
    5: ['Detroit Lions', 'San Diego Chargers', 'Philadelphia Eagles', 'Tennessee Titans'],
    6: ['Kansas City Chiefs', 'Los Angeles Rams', 'Miami Dolphins', 'Minnesota Vikings'],
    7: ['Chicago Bears', 'Dallas Cowboys'],
    9: ['Pittsburgh Steelers', 'San Francisco 49ers'],
    10: ['Cleveland Browns', 'Green Bay Packers', 'Oakland Raiders', 'Seattle Seahawks'],
    11: ['Arizona Cardinals', 'Carolina Panthers', 'New York Giants', 'Tampa Bay Buccaneers'], 
    12: ['Atlanta Falcons', 'Buffalo Bills', 'Cincinnati Bengals', 'Jacksonville Jaguars', 'New Orleans Saints', 'New York Jets'],
    14: ['Baltimore Ravens', 'Denver Broncos', 'Houston Texans', 'Indianapolis Colts', 'New England Patriots', 'Washington Commanders']
}

const sameDivision = (away, home) => {
    return divisions[away.split(' ').join('')] === divisions[home.split(' ').join('')] 
}

const differentConference = (away, home) => {
    return conferences[away.split(' ').join('')] !== conferences[home.split(' ').join('')]
}

const checkBlowouts = (away, home, lastWeekGames, spread) => {
    ag = lastWeekGames.find(g => g.homeTeam === away || g.awayTeam === away)
    const awayMargin = ag.homeTeam === away ? ag.homeScore - ag.awayScore : ag.awayScore - ag.homeScore
    hg = lastWeekGames.find(g => g.homeTeam === home || g.awayTeam === home)
    const homeMargin = hg.homeTeam === away ? hg.homeScore - hg.awayScore : hg.awayScore - hg.homeScore
    if (awayMargin < -18) spread -= 2
    if (awayMargin < -28) spread -= 2
    if (homeMargin < -18) spread += 2
    if (homeMargin < -28) spread += 2
    return spread
}

const byeLastWeek = (home, away, spread) => {
    const byeLastWeek = bye[week-1]
    if (byeLastWeek) {
        if (byeLastWeek.find(team => team === home.team)) {
            const { ranking } = home
            if (ranking < -2) spread += 4
            if (ranking >= -2 && ranking < 2) spread += 5
            if (ranking >= 2) spread += 7
        }
        if (byeLastWeek.find(team => team === away.team)) {
            const { ranking } = away
            if (ranking < -2) spread -= 5
            if (ranking >= -2 && ranking < 2) spread -= 6
            if (ranking >= 2) spread -= 8
        }
    }
    return spread
}

const handler = async () => {
    const header = [['Home Team', 'Rank', 'Away Team', 'Rank', 'Same Division', 'Different Conference', 'Spread']];
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
            `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2023&seasontype=2&week=18`
        );
        const lastWeekData = await jsonLastWeek.json();
        const lastWeekGames = []
        for (const game of lastWeekData.events) {
            const gameArray = game.name.split(' at ')
            const gameObj = {}
            gameObj['homeTeam'] = gameArray[1]
            gameObj['awayTeam'] = gameArray[0]
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
            if (division) spread -= 1
            const conference = differentConference(awayTeam, homeTeam)
            if (conference) spread += 1 
            spread = byeLastWeek(home, away, spread)
            // spread = checkBlowouts(awayTeam, homeTeam, lastWeekGames, spread)
            end.push([home.team, home.ranking, away.team, away.ranking, division, conference, Math.round(spread * 100) / 100])
        })
        client.release();
        pool.end();
    const csvFromGames = convertArrayToCSV(end, {
        header,
        separator: ',',
    });
    fs.writeFile('../csv/nflModel.csv', csvFromGames, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
};

handler();