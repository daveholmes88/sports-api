const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();
const env = require('./nflEnv');
const nflGames = require('./nflGames');

const { Pool } = pkg;
const PASSWORD = process.env.PASSWORD;
const WEEK = process.env.WEEK;

const pool = new Pool({
    user: 'davidholmes',
    database: 'backendgambling_development',
    password: PASSWORD,
    port: 5432, // This is the default PostgreSQL port
    //   ssl: {
    //     rejectUnauthorized: false
    //   }
});

const jeffData = {
    San_Francisco_49ers: 24.11,
    Buffalo_Bills: 26.52,
    Detroit_Lions: 27.94,
    Kansas_City_Chiefs: 26.18,
    Houston_Texans: 23.91,
    Baltimore_Ravens: 24.05,
    Philadelphia_Eagles: 24.24,
    Miami_Dolphins: 17.7,
    Green_Bay_Packers: 24.75,
    Cincinnati_Bengals: 19.75,
    New_York_Jets: 19.12,
    Los_Angeles_Rams: 20.46,
    Dallas_Cowboys: 18.56,
    Jacksonville_Jaguars: 18.08,
    Pittsburgh_Steelers: 23.53,
    Cleveland_Browns: 17.02,
    Chicago_Bears: 21.98,
    Seattle_Seahawks: 19.55,
    Indianapolis_Colts: 20.62,
    Atlanta_Falcons: 20.01,
    Minnesota_Vikings: 23.09,
    Arizona_Cardinals: 18.68,
    Los_Angeles_Chargers: 20.44,
    Tampa_Bay_Buccaneers: 20.01,
    Tennessee_Titans: 14.66,
    New_Orleans_Saints: 15.0,
    Washington_Commanders: 21.08,
    Las_Vegas_Raiders: 13.6,
    New_England_Patriots: 13.03,
    Denver_Broncos: 19.26,
    New_York_Giants: 14.25,
    Carolina_Panthers: 8.84,
};

const rounding = num => Math.round(num * 100) / 100;

const getEspnData = game => {
    const json = fs.readFileSync('./csv/espn.json', 'utf8');
    const fpi = JSON.parse(json);
    const awayFpi = fpi.find(team => game.away === team.name).rankings;
    const homeFpi = fpi.find(team => game.home === team.name).rankings;
    return homeFpi - awayFpi;
};

const getPffWebsiteData = game => {
    const json = fs.readFileSync(`./csv/pffRankingsWeek${WEEK}.json`, 'utf8');
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
    const weekData = await nflGames.handler(WEEK);
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
            WEEK,
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
        if (day > 2) {
            const espnWebsite = getEspnData(game, WEEK);
            homeSpread = rounding(spread + espnWebsite) * -1;
            const homeEspnWebsite =
                homeSpread > 0 ? `+${homeSpread}` : homeSpread;
            const awayJeffWeb = jeffData[awayTeam.replaceAll(' ', '_')];
            const homeJeffWeb = jeffData[homeTeam.replaceAll(' ', '_')];
            homeSpread = rounding(homeJeffWeb - awayJeffWeb + spread) * -1;
            const jeffSpreadWeb =
                homeSpread > 0 ? `+${homeSpread}` : homeSpread;
            const pffWeb = getPffWebsiteData(game);
            homeSpread = rounding(pffWeb + spread) * -1;
            const pffSpreadWeb = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
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
                `${homeTeam} ${homeEspnWebsite}`,
                `${homeTeam} ${homeDvoa}`,
                `${homeTeam} ${homeJeff}`,
                `${homeTeam} ${jeffSpreadWeb}`,
                `${homeTeam} ${homeffp}`,
                `${homeTeam} ${pffSpreadWeb}`,
                game.espnOdds,
            ]);
        } else {
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
        }
    });
    if (day < 3) {
        header = [
            'Home Team',
            'Home FPI',
            'Home DVOA',
            'Home Jeff',
            'Home FPF',
            'Away Team',
            'Away FPI',
            'Away DVOA',
            'Away Jeff',
            'Away PFF',
            'Environmental Factors',
            'ESPN FPI Spread',
            'Adjusted DVOA Spread',
            'Jeff Spread',
            'PFF Spread',
            'ESPN Spread',
        ];
    } else {
        header = [
            'Home Team',
            'Home FPI',
            'Home DVOA',
            'Home Jeff',
            'Home FPF',
            'Away Team',
            'Away FPI',
            'Away DVOA',
            'Away Jeff',
            'Away PFF',
            'Environmental Factors',
            'ESPN FPI DB Spread',
            'ESPN FPI Website',
            'Adjusted DVOA Spread',
            'Jeff DB Spread',
            'Jeff Website',
            'PFF DB Spread',
            'PFF Website',
            'ESPN Spread',
        ];
    }
    const csvFromGames = convertArrayToCSV(end, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/nflModelWeek${WEEK}.csv`, csvFromGames, err => {
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
        'Playoff Rematch',
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
    fs.writeFile(`./csv/envFactorsWeek${WEEK}.csv`, csvEnvFactors, err => {
        if (err) console.log(err);
        else console.log('env csv file written');
    });
};

handler();
