const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();

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

const homeFieldAdvantage = {
    AtlantaDream: 10,
    ChicagoSky: 10, 
    ConnecticutSun: 10,
    DallasWings: 10,
    GoldenStateValkyries: 10,
    IndianaFever: 10,
    LasVegasAces: 10,
    LosAngelesSparks: 10,
    MinnesotaLynx: 10,
    NewYorkLiberty: 10,
    PhoenixMercury:10,
    SeattleStorm: 10,
    WashingtonMystics: 10,
};

const checkHomeField = game => {
    const { neutral, home } = game;
    if (neutral) return 0;
    return homeFieldAdvantage[home.replaceAll(' ', '')];
};

const rounding = num => Math.round(num * 100) / 100;

const getDateGameInfo = async (date, lastWeek, daysAgo) => {
    date.setDate(date.getDate() - 1);
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const newDate = `${year}${month}${day}`;
    const jsonGames = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates=${newDate}`
    );
    played = [];
    const games = await jsonGames.json();
    if (games.events.length > 0) {
        games.events.forEach(g => {
            const gameArray = g.name.split(' at ');
            const home = gameArray[1];
            const away = gameArray[0];
            const overtime = g.competitions[0].status.period === 5;
            played.push({ home, away, overtime });
        });
    }
    lastWeek[daysAgo] = played;
};

const checkPlayedYesterday = (game, yesterdayGames) => {
    const { away, home } = game;
    let impact = 0;
    const awayPlayed = yesterdayGames.find(
        y => y.home === away || y.away === away
    );
    const homePlayed = yesterdayGames.find(
        y => y.home === home || y.away === home
    );
    if (awayPlayed) impact = 10;
    if (homePlayed) impact = -10;
    return impact;
};
const checkPlayedLastWeek = (game, lastWeek) => {
    const { away, home } = game;
    let impact = 0;
    let awayPlayed = 0;
    let homePlayed = 0;
    for (let i = 1; i < 7; i++) {
        const filteredAway = lastWeek[i].find(
            y => y.home === away || y.away === away
        );
        const filteredHome = lastWeek[i].find(
            y => y.home === home || y.away === home
        );
        if (filteredAway) awayPlayed += 1;
        if (filteredHome) homePlayed += 1;
        if (i === 3) {
            if (awayPlayed > 1) impact += 5;
            if (homePlayed > 1) impact -= 5;
        }
        if (i === 5) {
            if (awayPlayed > 3) impact += 5;
            if (homePlayed > 3) impact -= 5;
        }
    }
    if (awayPlayed > 4) impact += 5;
    if (homePlayed > 4) impact -= 5;
    return impact;
};

const handler = async () => {
    const d = new Date();
    const date = d.toISOString().slice(0, 10).replace(/-/g, '');
    // const date = '20250516'
    const client = await pool.connect();
    const result = await pool.query(`SELECT * FROM wnba_teams`);
    const teams = result.rows;
    client.release();
    pool.end();
    const jsonGames = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates=${date}`
    );
    const games = await jsonGames.json();
    lastWeek = {};
    for (let i = 1; i < 7; i++) {
        await getDateGameInfo(d, lastWeek, i);
    }
    const todayGames = [];
    games.events.forEach(game => {
        let odds = 'n/a';
        let total = 'n/a'
        if (game.competitions[0]?.odds) {
            odds = game.competitions[0]?.odds[0].details;
            total = game.competitions[0]?.odds[0].overUnder;
        }
        const gameArray = game.name.split(' at ');
        todayGames.push({
            away: gameArray[0],
            home: gameArray[1],
            odds,
            neutral: game.competitions[0].neutralSite,
            id: game.id,
            total
        });
    });
    const final = todayGames.map(game => {
        const { odds, home, away, total } = game;
        const awayTeam = teams.find(team => away === team.name);
        const homeTeam = teams.find(team => home === team.name);
        const dbRating = homeTeam.rating - awayTeam.rating;
        const halfRating = homeTeam.half - awayTeam.half;
        let spread = 0;
        const homeField = checkHomeField(game);
        spread += homeField;
        const yesterdayCheck = checkPlayedYesterday(game, lastWeek[1]);
        spread += yesterdayCheck;
        const lastWeekGames = checkPlayedLastWeek(game, lastWeek);
        spread += lastWeekGames;
        spread = spread / 5;
        let homeSpread = rounding(dbRating + spread) * -1;
        homeSpread = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        let halfSpread = rounding(halfRating + spread/2) * -1;
        halfSpread = halfSpread > 0? `+${halfSpread}` : halfSpread;
        const totalRating = homeTeam.total ? rounding((homeTeam.total + awayTeam.total) / 2) : 'n/a'
        const halfTotal = homeTeam.half_total ? rounding((homeTeam.half_total + awayTeam.half_total)) / 2 : 'n/a'
        return [
            home,
            homeTeam.rating,
            away,
            awayTeam.rating,
            spread,
            `${home} ${homeSpread}`,
            odds,
            totalRating,
            total,
            `${home} ${halfSpread}`,
            'half odds coming', 
            halfTotal,
            'half total coming'
        ];
    });
    const header = [
        'Home Team',
        'Home DB Rating',
        'Away Team',
        'Away DB Rating',
        'Environmental Factors',
        'DB Spread',
        'Spread',
        'Total',
        'Over/Under',
        'DB Half Spread',
        'Half Spread', 
        'Half Total', 
        'Half Over/Under'
    ];
    const csvFromGames = convertArrayToCSV(final, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/wnbaModel/wnbaModel${date}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('model csv file written');
    });
};

handler();