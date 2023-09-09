const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');

const handler = async () => {
    const header = [['Home Team', 'HS', 'Away Team', 'AS']]
    let games = [];
    for (let i = 1; i < 19; i++) {
        const jsonWeek = await fetch(`https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2022&week=${i}`)
        const weekData = await jsonWeek.json()
        const gameIds = []
        const schedule = weekData.content.schedule
        // console.log(schedule)
        const dates = Object.keys(schedule)
        dates.forEach(date => {
            schedule[date].games.forEach(game => gameIds.push(game.id))
        })
        for (const id of gameIds) {
            const jsonGame = await fetch(`https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=${id}`)
            const gameData = await jsonGame.json()
            const homeTeam = gameData.__gamepackage__.homeTeam.team.name;
            const homeScore = gameData.__gamepackage__.homeTeam.score;
            const awayTeam = gameData.__gamepackage__.awayTeam.team.name;
            const awayScore = gameData.__gamepackage__.awayTeam.score;
            games.push([homeTeam, homeScore, awayTeam, awayScore])
            // games += `${homeTeam} ${homeScore} ${awayTeam} ${awayScore}` + "\r\n";
        }  
    }
    const csvFromGames = convertArrayToCSV(games, {
        header,
        separator: ','
      });
    fs.writeFile('nflSchedule.csv', csvFromGames, err => {
        if (err) console.log(err)
        else console.log('csv file written')
    })
}

handler()