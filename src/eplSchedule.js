const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');

const handler = async () => {
    const token = process.env.FOOTBALL_DATA_TOKEN;
    console.log(token);
    const header = [['Home Team', 'HS', 'Away Team', 'AS']];
    let games = [];
    for (let i = 1; i < 39; i++) {
        await new Promise(resolve => setTimeout(resolve, 11000));
        const json = await fetch(
            `https://api.football-data.org/v4/competitions/PL/matches?status=FINISHED&season=2022&matchday=${i}`,
            {
                headers: {
                    'X-Auth-Token': token,
                },
            }
        );
        const data = await json.json();
        console.log(data);
        data.matches.forEach(d => {
            const homeTeam = d.homeTeam.name;
            const homeScore = d.score.fullTime.home;
            const awayTeam = d.awayTeam.name;
            const awayScore = d.score.fullTime.away;
            games.push([homeTeam, homeScore, awayTeam, awayScore]);
        });
    }
    const csvFromGames = convertArrayToCSV(games, {
        header,
        separator: ',',
    });
    fs.writeFile('./csv/eplSchedule.csv', csvFromGames, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
};

handler();
