const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
require('dotenv').config();

// 2023
// const teamsWithRookies = {
//     'New York Giants': 10, // not 17
//     'Las Vegas Raiders': 11,
//     'Houston Texans': 10, // not 16, 17
//     'Carolina Panthers': 10,
//     'Cincinnati Bengals': 10,
// };

// 2022
// const teamsWithRookies = {
//     'Pittsburgh Steelers': 10, // not 15
// };

// 2021
const teamsWithRookies = {
    'Chicago Bears': 10, // not 12, 13, 16, 17, 18
    'New England Patriots': 10,
    'Jacksonville Jaguars': 10,
    'Houston Texans': 13,
    'New York Jets': 11,
};

const rookies = async () => {
    let week = 10;
    // let week = 1
    const check = [];
    while (week < 19) {
        const jsonWeek = await fetch(
            `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2022&seasontype=2&week=${week}`
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
                if (teamsWithRookies[awayTeam] <= week) {
                    const homeTeam = home.team.displayName;
                    const awayScore = parseInt(away.score);
                    const homeScore = parseInt(home.score);
                    const jsonGame = await fetch(
                        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/odds`
                    );
                    const game = await jsonGame.json();
                    const odds = game?.items.pop().details || 'n/a';
                    check.push([
                        awayTeam,
                        awayScore,
                        homeTeam,
                        homeScore,
                        odds,
                        week,
                    ]);
                }
            }
        }
        week++;
    }
    const header = ['Away', 'Away Score', 'Home', 'Home Score', 'Odds', 'Week'];
    console.log(check);
    const csvCheck = convertArrayToCSV(check, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/rookieQBs.csv`, csvCheck, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
};

rookies();
