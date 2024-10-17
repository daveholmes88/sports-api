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
