const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config()

const { Pool } = pkg
const password = process.env.PASSWORD

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

const sameDivision = (away, home) => {
    return divisions[away.split(' ').join('')] === divisions[home.split(' ').join('')] 
}

const differentConference = (away, home) => {
    return conferences[away.split(' ').join('')] !== conferences[home.split(' ').join('')]
}

const handler = async () => {
    const header = [['Home Team', 'Rank', 'Away Team', 'Rank', 'Same Division', 'Different Conference', 'Spread']];
    const games = [];
    const end = []
    const week = 1
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
                    home: gameArray[1]
                })
            });
        });
        // console.log(games)
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