const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
require('dotenv').config();

// 2023
// const playoffs = {
//     HoustonTexans: 'Baltimore Ravens',
//     GreenBayPackers: 'San Francisco 49ers',
//     TampaBayBuccaneers: 'Detroit Lions',
//     BuffaloBills: 'Kansas City Chiefs',
//     ClevelandBrowns: 'Houston Texans',
//     MiamiDolphins: 'Kansas City Chiefs',
//     DallasCowboys: 'Green Bay Packers',
//     LosAngelesRams: 'Detroit Lions',
//     PittsburghSteelers: 'Buffalo Bills',
//     PhiladelphiaEagles: 'Tampa Bay Buccaneers',
//     BaltimoreRavens: 'Kansas City Chiefs',
//     DetroitLions: 'San Francisco 49ers',
//     SanFrancisco49ers: 'Kansas City Chiefs',
// };

// 2022
// const playoffs = {
//     LosAngelesChargers: 'Jacksonville Jaguars',
//     BaltimoreRavens: 'Cincinnati Bengals',
//     BuffaloBills: 'Kansas City Chiefs',
//     CincinnatiBengals: 'Buffalo Bills',
//     MiamiDolphins: 'Buffalo Bills',
//     JacksonvilleJaguars: 'Kansas City Chiefs',
//     SeattleSeahawks: 'San Francisco 49ers',
//     MinnesotaVikings: 'New York Giants',
//     NewYorkGiants: 'Philadelphia Eagles',
//     DallasCowboys: 'San Francisco 49ers',
//     PhiladelphiaEagles: 'Kansas City Chiefs',
//     TampaBayBuccaneers: 'Dallas Cowboys',
//     SanFrancisco49ers: 'Philadelphia Eagles'
// }

// 2021
// const playoffs = {
//     CincinnatiBengals: 'Los Angeles Rams',
//     TennesseeTitans: 'Cincinnati Bengals',
//     BuffaloBills: 'Kansas City Chiefs',
//     KansasCityChiefs: 'Cincinnati Bengals',
//     OaklandRaiders: 'Cincinnati Bengals',
//     PittsburghSteelers: 'Kansas City Chiefs',
//     NewEnglandPatriots: 'Buffalo Bills',
//     PhiladelphiaEagles: 'Tampa Bay Buccaneers',
//     TampaBayBuccaneers: 'Los Angeles Rams',
//     SanFrancisco49ers: 'Los Angeles Rams',
//     DallasCowboys: 'San Francisco 49ers',
//     ArizonaCardinals: 'Los Angeles Rams',
//     GreenBayPackers: 'San Francisco 49ers',
// }

// 2020
const playoffs = {
    TennesseeTitans: 'Baltimore Ravens',
    IndianapolisColts: 'Buffalo Bills',
    PittsburghSteelers: 'Cleveland Browns',
    BaltimoreRavens: 'Buffalo Bills',
    ClevelandBrowns: 'Kansas City Chiefs',
    BuffaloBills: 'Kansas City Chiefs',
    KansasCityChiefs: 'Tampa Bay Buccaneers',
    WashingtonCommanders: 'Tampa Bay Buccaneers',
    ChicagoBears: 'New Orleans Saints',
    SeattleSeahawks: 'Los Angeles Rams',
    NewOrleansSaints: 'Tampa Bay Buccaneers',
    LosAngelesRams: 'Green Bay Packers',
    GreenBayPackers: 'Tampa Bay Buccaneers',
};

const rematch = async () => {
    let week = 18;
    // let week = 6
    const check = [];
    while (week > 0) {
        const jsonWeek = await fetch(
            `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2021&seasontype=2&week=${week}`
        );
        const weekData = await jsonWeek.json();
        const schedule = weekData.content.schedule;
        const dates = Object.keys(schedule);
        for (let date of dates) {
            for (let game of schedule[date].games) {
                const id = game.id;
                const away = game.competitions[0].competitors.find(
                    g => g.homeAway === 'away'
                );
                const home = game.competitions[0].competitors.find(
                    g => g.homeAway === 'home'
                );
                const homeName = home.team.displayName;
                const awayName = away.team.displayName;
                let revenge;
                let winner;
                if (playoffs[awayName.replaceAll(' ', '')] === homeName) {
                    revenge = away;

                    winner = home;
                }
                if (playoffs[homeName.replaceAll(' ', '')] === awayName) {
                    revenge = home;
                    winner = away;
                }
                if (revenge) {
                    const revengeName = revenge.team.displayName;
                    const winnerName = winner.team.displayName;
                    const revengeScore = parseInt(revenge.score);
                    const winnerScore = parseInt(winner.score);
                    const jsonGame = await fetch(
                        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/odds`
                    );
                    const game = await jsonGame.json();
                    const odds = game?.items[0].details || 'n/a';
                    check.push([
                        revengeName,
                        revengeScore,
                        winnerName,
                        winnerScore,
                        odds,
                    ]);
                }
            }
        }
        week--;
    }
    const header = [
        'Revenge',
        'Revenge Score',
        'Winner',
        'Winner Score',
        'Odds',
    ];
    const csvCheck = convertArrayToCSV(check, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/playoffRevengeCheck.csv`, csvCheck, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
};

rematch();
