const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();
const env = require('./nflEnv');
const nflGames = require('./nflGames')

const { Pool } = pkg;
const PASSWORD = process.env.PASSWORD;
const WEEK = 2;

const pool = new Pool({
    user: 'davidholmes',
    database: 'backendgambling_development',
    password: PASSWORD,
    port: 5432, // This is the default PostgreSQL port
    //   ssl: {
    //     rejectUnauthorized: false
    //   }
});

const rounding = num => Math.round(num * 100) / 100;

const handler = async () => {
    let header;
    // const games = [];
    const end = [];
    const envFactors = [];
    const weekData = await nflGames.handler(WEEK)
    const { games, lastWeekGames } = weekData
    // const jsonWeek = await fetch(
    //     `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2024&seasontype=2&week=${WEEK}`
    // );
    // const weekData = await jsonWeek.json();
    // const schedule = weekData.content.schedule;
    // const dates = Object.keys(schedule);
    // dates.forEach(date => {
    //     schedule[date].games.forEach(game => {
    //         const gameArray = game.name.split(' at ');
    //         games.push({
    //             away: gameArray[0],
    //             home: gameArray[1],
    //             date: game.status.type.detail,
    //             id: game.id,
    //             neutral: game.competitions[0].neutralSite,
    //             espnOdds: game.competitions[0].odds[0].details,
    //             abbreviation:
    //                 game.competitions[0].odds[0].homeTeamOdds.team.abbreviation,
    //         });
    //     });
    // });
    // const jsonLastWeek = await fetch(
    //     `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2024&seasontype=2&week=${WEEK - 1}`
    // );
    // const lastWeekData = await jsonLastWeek.json();
    // const lastWeekGames = [];
    // for (const game of lastWeekData.events) {
    //     const gameArray = game.name.split(' at ');
    //     const gameObj = {};
    //     gameObj['homeTeam'] = gameArray[1];
    //     gameObj['awayTeam'] = gameArray[0];
    //     gameObj['date'] = game.date.split('T')[0];
    //     game.competitions[0].competitors.forEach(c => {
    //         if (c['homeAway'] === 'home') {
    //             gameObj['homeScore'] = parseInt(c.score);
    //         } else {
    //             gameObj['awayScore'] = parseInt(c.score);
    //         }
    //     });
    //     lastWeekGames.push(gameObj);
    // }
    const client = await pool.connect();
    const result = await pool.query(`SELECT * FROM football_teams`);
    const teams = result.rows;
    games.forEach(game => {
        const awayTeam = game.away;
        const homeTeam = game.home;
        const away = teams.find(team => awayTeam === team.team);
        const home = teams.find(team => homeTeam === team.team);
        let espn = home.espn_api - away.espn_api;
        const spread = env.handler(game, WEEK, lastWeekGames, away, home, envFactors)
        let homeSpread = rounding(spread + espn) * -1;
        const homeEspn = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        const dvoa = home.adjusted_dvoa - away.adjusted_dvoa;
        homeSpread = rounding(spread + dvoa) * -1;
        const homeDvoa = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        const jeff = home.jeff - away.jeff;
        homeSpread = rounding(spread + jeff) * -1;
        const homeJeff = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        const ffp = home.ffp_power - away.ffp_power;
        homeSpread = rounding(spread + ffp) * -1;
        const homeffp = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        end.push([
            home.team,
            home.espn_api,
            home.adjusted_dvoa,
            home.jeff,
            home.ffp_power,
            away.team,
            away.espn_api,
            away.adjusted_dvoa,
            away.jeff,
            away.ffp_power,
            rounding(spread),
            `${homeTeam} ${homeEspn}`,
            `${homeTeam} ${homeDvoa}`,
            `${homeTeam} ${homeJeff}`,
            `${homeTeam} ${homeffp}`,
            game.espnOdds,
        ]);
    });
    header = [
        'Home Team',
        'Home FPI',
        'Home DVOA',
        'Home Jeff',
        'Home FFP',
        'Away Team',
        'Away FPI',
        'Away DVOA',
        'Away Jeff',
        'Away FFP',
        'Environmental Factors',
        'FPI Spread',
        'Adjusted DVOA Spread',
        'Jeff Spread',
        'FFP Spread',
        'ESPN Spread',
    ];
    const csvFromGames = convertArrayToCSV(end, {
        header,
        separator: ',',
    });
    fs.writeFile(`../csv/nflModelWeek${WEEK}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
    header = [
        'Home Team',
        'Away Team',
        'Home Field Advantage',
        'Same Division',
        'Different Conference',
        'Night Game',
        'Long Distance',
        'Short Distance',
        'Thurs Night Last Week',
        'Mon Night Game Last Week',
        'Overtime Game Last Week',
        'Playoff Rematch',
        'Timezone Factors',
        'Super Bowl Impact',
        'Bye Week',
        'Last Week Blowout Factor',
        'Back to Back Away',
        'Environmental Factors',
    ];
    const csvEnvFactors = convertArrayToCSV(envFactors, {
        header,
        separator: ',',
    });
    fs.writeFile(`../csv/envFactorsWeek${WEEK}.csv`, csvEnvFactors, err => {
        if (err) console.log(err);
        else console.log('csv file written');
    });
    client.release();
    pool.end();
};

handler();
