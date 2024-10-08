const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
require('dotenv').config();

// coaches 2024
// const good = [
//     'Kansas City Chiefs',
//     'Los Angeles Rams',
//     'Baltimore Ravens',
//     'Detroit Lions',
//     'San Francisco 49ers',
//     'Green Bay Packers',
//     'Pittsburgh Steelers',
//     'Minnesota Vikings',
//     'Denver Broncos'
// ]

// const bad = [
//     'Philadelphia Eagles',
//     'Jacksonville Jaguars',
//     'New York Jets',
//     'Chicago Bears',
//     'Indianapolis Colts',
//     'Tennessee Titans',
//     'Cleveland Browns',
//     'Carolina Panthers',
// ]

// const handler = async () => {
//     let week = process.env.WEEK - 1;
//     // let week = 1
//     const check = []
//     while (week > 0) {
//         const jsonWeek = await fetch(
//             `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2024&seasontype=2&week=${week}`
//         );
//         const weekData = await jsonWeek.json();
//         const schedule = weekData.content.schedule;
//         const dates = Object.keys(schedule);
//         for (let date of dates) {
//             console.log('date', date)
//             console.log(schedule[date])
//             for (let game of schedule[date].games) {
//                 const id = game.id
//                 const away = game.competitions[0].competitors.find(g => g.homeAway === 'away');
//                 const home = game.competitions[0].competitors.find(g => g.homeAway === 'home');
//                 const awayTeam = away.team.displayName;
//                 const homeTeam = home.team.displayName;
//                 const awayScore = away.score;
//                 const homeScore = home.score;
//                 const goodTeam = good.find(t => t === homeTeam || t === awayTeam)
//                 const badTeam = bad.find(t => t === homeTeam || t === awayTeam)
//                 if (goodTeam && badTeam) {
//                     console.log('+++++++++++')
//                     const jsonGame = await fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/odds`)
//                     const game = await jsonGame.json()
//                     const odds = game?.items[0]?.details || 'n/a'
//                     check.push([homeTeam, homeScore, awayTeam, awayScore, odds])
//                 }
//             }
//         }
//         week --
//     }
//     const header = ['Home', 'Home Score', 'Away', 'Away Score', 'Odds']
//     console.log(check)
//     const csvCheck = convertArrayToCSV(check, {
//         header,
//         separator: ',',
//     });
//     fs.writeFile(`./csv/check.csv`, csvCheck, err => {
//         if (err) console.log(err);
//         else console.log('csv file written');
//     });
// }

// handler()

// playoffs 2023
// const afc = ['Houston Texans', 'Baltimore Ravens', 'Kansas City Chiefs', 'Buffalo Bills', 'Cleveland Browns', 'Miami Dolphins', 'Pittsburgh Steelers']

// const nfc = ['Green Bay Packers', 'Dallas Cowboys', 'Los Angeles Rams', 'Detroit Lions', 'Philadelphia Eagles', 'Tampa Bay Buccaneers', 'San Francisco 49ers']

// playoffs 2022
// const afc = ['Los Angeles Chargers', 'Baltimore Ravens', 'Kansas City Chiefs', 'Buffalo Bills', 'Cincinnati Bengals', 'Miami Dolphins', 'Jacksonville Jaguars']

// const nfc = ['Seattle Seahawks', 'Minnesota Vikings', 'New York Giants', 'Dallas Cowboys', 'Philadelphia Eagles', 'Tampa Bay Buccaneers', 'San Francisco 49ers']

// playoffs 2021
const afc = [
    'Cincinnati Bengals',
    'Tennessee Titans',
    'Buffalo Bills',
    'Kansas City Chiefs',
    'Oakland Raiders',
    'Pittsburgh Steelers',
    'New England Patriots',
];

const nfc = [
    'Philadelphia Eagles',
    'Tampa Bay Buccaneers',
    'San Francisco 49ers',
    'Dallas Cowboys',
    'Arizona Cardinals',
    'Los Angeles Rams',
    'Green Bay Packers',
];
const playoffs = async () => {
    let week = 18;
    // let week = 1
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
                const awayTeam = away.team.displayName;
                const homeTeam = home.team.displayName;
                let homeRecord = home.records[0].summary;
                let awayRecord = away.records[0].summary;
                const awayScore = parseInt(away.score);
                const homeScore = parseInt(home.score);
                const teamOneAfc = afc.find(t => t === homeTeam);
                const teamTwoAfc = afc.find(t => t === awayTeam);
                const teamOneNfc = nfc.find(t => t === awayTeam);
                const teamTwoNfc = nfc.find(t => t === homeTeam);
                if ((teamOneAfc && teamTwoAfc) || (teamOneNfc && teamTwoNfc)) {
                    if (homeScore > awayScore) {
                        let homeArray = homeRecord.split('-');
                        homeArray[0] = parseInt(homeArray[0]) - 1;
                        homeRecord = homeArray.join(', ');
                        const awayArray = awayRecord.split('-');
                        awayArray[1] = parseInt(awayArray[1]) - 1;
                        awayRecord = awayArray.join(', ');
                    }
                    if (awayScore > homeScore) {
                        let homeArray = homeRecord.split('-');
                        homeArray[1] = parseInt(homeArray[1]) - 1;
                        homeRecord = homeArray.join(', ');
                        const awayArray = awayRecord.split('-');
                        awayArray[0] = parseInt(awayArray[0]) - 1;
                        awayRecord = awayArray.join(', ');
                    }
                    const jsonGame = await fetch(
                        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/odds`
                    );
                    const game = await jsonGame.json();
                    const odds = game?.items.pop().details || 'n/a';
                    if (homeRecord !== awayRecord) {
                        check.push([
                            homeTeam,
                            homeScore,
                            homeRecord,
                            awayTeam,
                            awayScore,
                            awayRecord,
                            odds,
                        ]);
                    }
                }
            }
        }
        week--;
    }
    const header = [
        'Home',
        'Home Score',
        'Home Record',
        'Away',
        'Away Score',
        'Away Record',
        'Odds',
    ];
    console.log(check);
    const csvCheck = convertArrayToCSV(check, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/check.csv`, csvCheck, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
};

playoffs();
