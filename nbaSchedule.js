const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');

const handler = async () => {
    const header = [['Home Team', 'HS', 'Away Team', 'AS']]
    let games = [];
    for (let i = 0; i < 15; i++) {
        const json = await fetch(`https://www.balldontlie.io/api/v1/games?start_date=%272022-10-01&end_date=2023-07-01&per_page=100&page=${i}`)
        const data = await json.json()
        data.data.forEach(d => {
            const homeTeam = d.home_team.name;
            const homeScore = d.home_team_score;
            const awayTeam = d.visitor_team.name;
            const awayScore = d.visitor_team_score;
            games.push([homeTeam, homeScore, awayTeam, awayScore])
        })
    }
    //     const gameIds = []
    //     const schedule = weekData.content.schedule
    //     // console.log(schedule)
    //     const dates = Object.keys(schedule)
    //     dates.forEach(date => {
    //         schedule[date].games.forEach(game => gameIds.push(game.id))
    //     })
    //     for (const id of gameIds) {
    //         const jsonGame = await fetch(`https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=${id}`)
    //         const gameData = await jsonGame.json()
    //         const homeTeam = gameData.__gamepackage__.homeTeam.team.name;
    //         const homeScore = gameData.__gamepackage__.homeTeam.score;
    //         const awayTeam = gameData.__gamepackage__.awayTeam.team.name;
    //         const awayScore = gameData.__gamepackage__.awayTeam.score;
    //         games.push([homeTeam, homeScore, awayTeam, awayScore])
    //         // games += `${homeTeam} ${homeScore} ${awayTeam} ${awayScore}` + "\r\n";
    //     }  
    // }
    const csvFromGames = convertArrayToCSV(games, {
        header,
        separator: ','
      });
    fs.writeFile('nbaSchedule.csv', csvFromGames, err => {
        if (err) console.log(err)
        else console.log('csv file written')
    })
}

handler()