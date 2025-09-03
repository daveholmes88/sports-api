const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();
const env = require('./nflEnv');
const nflGames = require('./nflGames');
const { week } = require('../variables/nfl');

const { Pool } = pkg;
const PASSWORD = process.env.PASSWORD;

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

const getEspnData = game => {
    const json = fs.readFileSync('./csv/espnNfl.json', 'utf8');
    const fpi = JSON.parse(json);
    const awayFpi = fpi.find(team => game.away === team.name).rankings;
    const homeFpi = fpi.find(team => game.home === team.name).rankings;
    return homeFpi - awayFpi;
};

const getPffWebsiteData = game => {
    const json = fs.readFileSync(`./csv/pffRankingsWeek${week}.json`, 'utf8');
    const pff = JSON.parse(json);
    const awayPff = pff.find(team => game.away === team.team).ranking;
    const homePff = pff.find(team => game.home === team.team).ranking;
    return homePff - awayPff;
};

const handler = async () => {
    const date = new Date();
    const day = date.getDay();
    let header;
    const end = [];
    const envFactors = [];
    const weekData = await nflGames.handler(week);
    const { games, lastWeekGames } = weekData;
    const client = await pool.connect();
    const result = await pool.query(`SELECT * FROM football_teams`);
    const teams = result.rows;
    client.release();
    pool.end();
    games.forEach(game => {
        const awayTeam = game.away;
        const homeTeam = game.home;
        const away = teams.find(team => awayTeam === team.team);
        const home = teams.find(team => homeTeam === team.team);
        let espn = home.espn_api - away.espn_api;
        const spread = env.handler(
            game,
            week,
            lastWeekGames,
            away,
            home,
            envFactors
        );
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
        if (day > 1) {
            const espnWebsite = getEspnData(game, week);
            homeSpread = rounding(spread + espnWebsite) * -1;
            const homeEspnWebsite =
                homeSpread > 0 ? `+${homeSpread}` : homeSpread;
            end.push([
                home.team,
                home.espn_api,
                away.team,
                away.espn_api,
                rounding(spread),
                `${homeTeam} ${homeEspn}`,
                `${homeTeam} ${homeEspnWebsite}`,
                game.espnOdds,
            ]);
        } else {
            end.push([
                home.team,
                home.espn_api,
                away.team,
                away.espn_api,
                rounding(spread),
                `${homeTeam} ${homeEspn}`,
                `${homeTeam} ${homeDvoa}`,
                `${homeTeam} ${homeJeff}`,
                `${homeTeam} ${homeffp}`,
                game.espnOdds,
            ]);
        }
    });
    if (day < 2) {
        header = [
            'Home Team',
            'Home Ranking',
            'Away Team',
            'Away Ranking',
            'Environmental Factors',
            'Database Spread',
            'ESPN Spread',
        ];
    } else {
        header = [
            'Home Team',
            'Home Ranking',
            'Away Team',
            'Away Ranking',
            'Environmental Factors',
            'Database Spread',
            'ESPN FPI Website',
            'ESPN Spread',
        ];
    }
    const csvFromGames = convertArrayToCSV(end, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/nflModelWeek${week}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('model csv file written');
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
        'Timezone Factors',
        'Super Bowl Impact',
        'Bye Week',
        'Last Week Blowout Factor',
        'Back to Back Away',
        'Three Of Four Away',
        'Worse Record',
        'Streak',
        'Environmental Factors',
    ];
    const csvEnvFactors = convertArrayToCSV(envFactors, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/envFactorsWeek${week}.csv`, csvEnvFactors, err => {
        if (err) console.log(err);
        else console.log('env csv file written');
    });
};

handler();
