const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const pkg = require('pg');
require('dotenv').config();

const { Pool } = pkg;
const PASSWORD = process.env.PASSWORD;
const MEDIAN = 233.41;

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
    ChicagoBulls: 5,
    MilwaukeeBucks: 8,
    MinnesotaTimberwolves: 3,
    DetroitPistons: 2,
    ClevelandCavaliers: 8,
    BrooklynNets: 4,
    NewYorkKnicks: 5,
    MiamiHeat: 5,
    BostonCeltics: 5,
    OrlandoMagic: 7,
    MemphisGrizzlies: 5,
    PortlandTrailBlazers: 3,
    HoustonRockets: 6,
    IndianaPacers: 5,
    DenverNuggets: 8,
    LosAngelesLakers: 5,
    UtahJazz: 7,
    Philadelphia76ers: 3,
    DallasMavericks: 5,
    WashingtonWizards: 3,
    SanAntonioSpurs: 5,
    GoldenStateWarriors: 8,
    PhoenixSuns: 5,
    AtlantaHawks: 5,
    TorontoRaptors: 5,
    CharlotteHornets: 3,
    LAClippers: 3,
    OklahomaCityThunder: 8,
    NewOrleansPelicans: 5,
    SacramentoKings: 3,
};

const division = {
    ChicagoBulls: 'central',
    MilwaukeeBucks: 'central',
    MinnesotaTimberwolves: 'northwest',
    DetroitPistons: 'central',
    ClevelandCavaliers: 'central',
    BrooklynNets: 'atlantic',
    NewYorkKnicks: 'atlantic',
    MiamiHeat: 'southeast',
    BostonCeltics: 'atlantic',
    OrlandoMagic: 'southeast',
    MemphisGrizzlies: 'southwest',
    PortlandTrailBlazers: 'northeast',
    HoustonRockets: 'southwest',
    IndianaPacers: 'central',
    DenverNuggets: 'northwest',
    LosAngelesLakers: 'pacific',
    UtahJazz: 'northwest',
    Philadelphia76ers: 'pacific',
    DallasMavericks: 'southwest',
    WashingtonWizards: 'southeast',
    SanAntonioSpurs: 'southwest',
    GoldenStateWarriors: 'pacific',
    PhoenixSuns: 'pacific',
    AtlantaHawks: 'southeast',
    TorontoRaptors: 'atlantic',
    CharlotteHornets: 'southeast',
    LAClippers: 'pacific',
    OklahomaCityThunder: 'northwest',
    NewOrleansPelicans: 'southwest',
    SacramentoKings: 'pacific',
};

const checkHomeField = game => {
    const { neutral, home } = game;
    if (neutral) return 0;
    return homeFieldAdvantage[home.replaceAll(' ', '')];
};

const sameDivision = game => {
    const { neutral, away, home } = game;
    let impact = 0;
    if (neutral) return impact;
    if (
        division[home.replaceAll(' ', '')] ===
        division[away.replaceAll(' ', '')]
    )
        impact = -1;
    return impact;
};

const rounding = num => Math.round(num * 100) / 100;

const getDateGameInfo = async (date, lastWeek, daysAgo) => {
    date.setDate(date.getDate() - 1);
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const newDate = `${year}${month}${day}`;
    const jsonGames = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${newDate}`
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
    if (awayPlayed) impact = 7;
    if (homePlayed) impact = -7;
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
            if (awayPlayed > 1) impact += 3;
            if (homePlayed > 1) impact -= 3;
        }
        if (i === 5) {
            if (awayPlayed > 3) impact += 3;
            if (homePlayed > 3) impact -= 3;
        }
    }
    if (awayPlayed > 4) impact += 3;
    if (homePlayed > 4) impact -= 3;
    return impact;
};

const handler = async () => {
    const d = new Date();
    const date = d.toISOString().slice(0, 10).replace(/-/g, '');
    // const date = '20251111'
    const client = await pool.connect();
    const result = await pool.query(`SELECT * FROM nba_teams`);
    const teams = result.rows;
    client.release();
    pool.end();
    const jsonGames = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`
    );
    const games = await jsonGames.json();
    lastWeek = {};
    for (let i = 1; i < 7; i++) {
        await getDateGameInfo(d, lastWeek, i);
    }
    const todayGames = [];
    games.events.forEach(game => {
        let odds = 'n/a';
        let total = 'n/a';
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
            total,
        });
    });
    const json = fs.readFileSync('./csv/espnNba.json', 'utf8');
    const fpi = JSON.parse(json);
    const final = todayGames.map(game => {
        const { odds, home, away, total } = game;
        const awayTeam = teams.find(team => away === team.name);
        const homeTeam = teams.find(team => home === team.name);
        const awayFpi = fpi.find(team => game.away === team.name);
        const homeFpi = fpi.find(team => game.home === team.name);
        const awayEspnRating = awayFpi ? awayFpi.rankings : 0
        const homeEspnRating = homeFpi ? homeFpi.rankings : 0
        const dbRating = homeTeam.rating - awayTeam.rating;
        let spread = 0;
        const homeField = checkHomeField(game);
        spread += homeField;
        const division = sameDivision(game);
        spread += division;
        const yesterdayCheck = checkPlayedYesterday(game, lastWeek[1]);
        spread += yesterdayCheck;
        const lastWeekGames = checkPlayedLastWeek(game, lastWeek);
        spread += lastWeekGames;
        spread = spread / 5;
        let homeSpread = rounding(dbRating + spread) * -1;
        homeSpread = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        let espn = rounding(homeEspnRating - awayEspnRating + spread) * -1;
        espn = espn > 0 ? `+${espn}` : espn;
        const totalRating = rounding(homeTeam.total + awayTeam.total + MEDIAN)
        return [
            home,
            homeTeam.rating,
            homeTeam.total,
            away,
            awayTeam.rating,
            awayTeam.total,
            spread,
            `${home} ${homeSpread}`,
            `${home} ${espn}`,
            odds,
            totalRating,
            total,
        ];
    });
    const header = [
        'Home Team',
        'Home DB Rating',
        'Home Total Rating',
        'Away Team',
        'Away DB Rating',
        "Away Total Rating",
        'Environmental Factors',
        'DB Spread',
        'ESPN Spread',
        'Game Spread',
        'Total DB',
        'Total'
    ];
    const csvFromGames = convertArrayToCSV(final, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/nbaModel/nbaModel${date}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('model csv file written');
    });
};

handler();
