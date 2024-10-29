const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
require('dotenv').config();

const favorites = async () => {
    let week = 17;
    // let week = 1
    const check = [];
    while (week > 0) {
        const jsonWeek = await fetch(
            `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2018&seasontype=2&week=${week}`
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
                const awayScore = parseInt(away.score);
                const homeScore = parseInt(home.score);
                console.log(id)
                const jsonGame = await fetch(
                    `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/odds`
                );
                const fullGame = await jsonGame.json();
                const odds = fullGame?.items[0].details || fullGame?.items[1].details || 'n/a';
                console.log(odds)
                const number = parseInt(odds.split(' ')[1])
                const margin = homeScore - awayScore
                const loss = margin < 10 && margin > -10 ? 'L' : '' 
                if (number > 9 || number < -9) {
                    check.push([
                        homeTeam,
                        homeScore,
                        awayTeam,
                        awayScore,
                        odds,
                        loss
                    ]);
                }
            }
        }
        week--;
    }
    const header = [
        'Home',
        'Home Score',
        'Away',
        'Away Score',
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

favorites();