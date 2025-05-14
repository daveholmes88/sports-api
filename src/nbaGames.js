
const monthsDays = {10: 31, 11: 30, 12: 31, 1: 31, 2: 28, 3: 31, 4: 14}
const months = [10, 11, 12, 1, 2, 3, 4, 5]

const getGames = async () => {
    const games = [];
    for (const month of months) {
        const year = month > 9 ? 2024 : 2025
        let day = month === 10 ? 24 : 1
        const target = monthsDays[month]
        while (day <= target) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const d = day < 10 ? `0${day}` : day
            const m = month < 10 ? `0${month}` : month
            const date = `${year}${m}${d}`
            const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`
            const jsonNight = await fetch(url);
            const nightData = await jsonNight.json();
            if (nightData.events.length > 0) {
                for (const game of nightData.events) {
                    const gameArray = game.name.split(' at ');
                    const gameObj = {};
                    gameObj['homeTeam'] = gameArray[1];
                    gameObj['awayTeam'] = gameArray[0];
                    gameObj['date'] = game.date.split('T')[0];
                    gameObj['id'] = parseInt(game.id)
                    game.competitions[0].competitors.forEach(c => {
                        if (c['homeAway'] === 'home') {
                            gameObj['homeScore'] = parseInt(c.score);
                            gameObj['homeRecord'] = c.records ? c.records[0]?.summary : 'nba cup'
                        } else {
                            gameObj['awayScore'] = parseInt(c.score);
                            gameObj['awayRecord'] = c.records ? c.records[0]?.summary : 'nba cup'
                        }
                    console.log(day, gameObj)
                    games.push(gameObj);
                    });
                }
            }
            day ++
        }
        console.log(games.length)
    }
    
}

getGames()