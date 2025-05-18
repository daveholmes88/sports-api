const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');

const monthsDays = {4: 30, 5: 31, 6: 30}
const months = [4, 5, 6]

const getGames = async () => {
    const games = [];
    for (const month of months) {
        let day = 1
        const year = 2015
        const target = monthsDays[month]
        while (day <= target) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const d = day < 10 ? `0${day}` : day
            const m = month < 10 ? `0${month}` : month
            const date = `${year}${m}${d}`
            const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`
            const jsonNight = await fetch(url);
            const nightData = await jsonNight.json();
            // console.log(nightData.events)
            if (nightData.events.length > 0 && nightData.events[0].season.type === 3) {
                for (const game of nightData.events) {
                    const record = game.competitions[0].competitors[0].record
                    if (record === '2-1' || record === '1-2') {
                        const gameArray = game.name.split(' at ');
                        const gameObj = {};
                        const home = gameArray[1];
                        const away = gameArray[0];
                        gameObj['date'] = game.date.split('T')[0];
                        const id = parseInt(game.id)
                        const jsonGame = await fetch(
                                `https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/events/${id}/competitions/${id}/odds`
                        );
                        const gameData = await jsonGame.json();
                        const odds =  gameData?.items[0].details || gameData?.items[1].details || 'n/a';
                        let homeScore
                        let awayScore
                        game.competitions[0].competitors.forEach(c => {
                            if (c['homeAway'] === 'home') {
                                homeScore = parseInt(c.score);
                            } else {
                                awayScore = parseInt(c.score);
                            }
                        });
                        games.push([home, homeScore, away, awayScore, odds]);    
                    }
                }
            }
            day ++
        }
    }
    const header = ['Home', 'Score', 'Away', 'Score', 'Odds'];
    const csvCheck = convertArrayToCSV(games, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/nbaGame3.csv`, csvCheck, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
}

getGames()