const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
require('dotenv').config();

const followingTeams = async baseTeam => {
    let week = 2;
    const games = [];
    while (week < 19) {
        const jsonLastWeek = await fetch(
            `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2021&seasontype=2&week=${
                week - 1
            }`
        );
        const lastWeekData = await jsonLastWeek.json();
        const lastSchedule = lastWeekData.content.schedule;
        const lastDates = Object.keys(lastSchedule);
        let team;
        for (let date of lastDates) {
            for (let game of lastSchedule[date].games) {
                const away = game.competitions[0].competitors.find(
                    g => g.homeAway === 'away'
                );
                const home = game.competitions[0].competitors.find(
                    g => g.homeAway === 'home'
                );
                const awayTeam = away.team.displayName;
                const homeTeam = home.team.displayName;
                if (homeTeam === baseTeam) team = awayTeam;
                if (awayTeam === baseTeam) team = homeTeam;
            }
        }
        if (team) {
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
                    const awayScore = parseInt(away.score);
                    const homeScore = parseInt(home.score);
                    if (awayTeam === team || homeTeam === team) {
                        const jsonGame = await fetch(
                            `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/odds`
                        );
                        const gameData = await jsonGame.json();
                        if (gameData?.items.length > 0) {
                            const odds =
                                gameData?.items[0].details ||
                                gameData?.items[1].details ||
                                'n/a';
                            console.log(odds);
                            if (odds !== 'n/a') {
                                if (homeTeam === team) {
                                    games.push([
                                        homeTeam,
                                        homeScore,
                                        awayTeam,
                                        awayScore,
                                        odds,
                                    ]);
                                } else {
                                    games.push([
                                        awayTeam,
                                        awayScore,
                                        homeTeam,
                                        homeScore,
                                        odds,
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
        }
        week++;
    }
    const header = [
        'Target Team',
        'Target Score',
        'Other Team',
        'Other Score',
        'Odds',
        'Result',
    ];
    const csvCheck = convertArrayToCSV(games, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/check.csv`, csvCheck, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
};

followingTeams('Detroit Lions');
