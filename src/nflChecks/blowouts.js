const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
require('dotenv').config();

const getGameData = async id => {
    const jsonGame = await fetch(
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/odds`
    );
    const gameData = await jsonGame.json();
    return gameData?.items[0].details || gameData?.items[1].details || 'n/a';
};

const blowouts = async () => {
    let week = 1;
    const blowouts = {};
    const games = [];
    while (week < 18) {
        const jsonWeek = await fetch(
            `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2017&seasontype=2&week=${week}`
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
                const margin = homeScore - awayScore;
                if (margin > 16) {
                    if (blowouts[awayTeam]) {
                        blowouts[awayTeam].push(week);
                    } else {
                        blowouts[awayTeam] = [week];
                    }
                }
                if (margin < -16) {
                    if (blowouts[homeTeam]) {
                        blowouts[homeTeam].push(week);
                    } else {
                        blowouts[homeTeam] = [week];
                    }
                }
                if (
                    blowouts[homeTeam] &&
                    blowouts[homeTeam].includes(week - 1) &&
                    blowouts[homeTeam].includes(week - 2)
                ) {
                    const odds = await getGameData(id);
                    games.push([
                        homeTeam,
                        homeScore,
                        awayTeam,
                        awayScore,
                        odds,
                    ]);
                }
                if (
                    blowouts[awayTeam] &&
                    blowouts[awayTeam].includes(week - 1) &&
                    blowouts[awayTeam].includes(week - 2)
                ) {
                    const odds = await getGameData(id);
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
        week++;
    }
    const header = ['Blownout Team', 'Score', 'Other Team', 'Score', 'Odds'];
    const csvCheck = convertArrayToCSV(games, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/blowouts.csv`, csvCheck, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
};

blowouts();
