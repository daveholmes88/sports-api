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
    LosAngelesClippers: 3,
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
    LosAngelesClippers: 'pacific',
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

const handler = async () => {
    const date = '20241022';
    const client = await pool.connect();
    const result = await pool.query(`SELECT * FROM nba_teams`);
    const teams = result.rows;
    client.release();
    pool.end();
    const jsonGames = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`
    );
    const games = await jsonGames.json();
    const todayGames = [];
    games.events.forEach(game => {
        let odds = 'n/a';
        if (game.competitions[0]?.odds) {
            odds = game.competitions[0]?.odds[0].details;
        }
        const gameArray = game.name.split(' at ');
        todayGames.push({
            away: gameArray[0],
            home: gameArray[1],
            odds,
            neutral: game.competitions[0].neutralSite,
            id: game.id,
        });
    });
    const final = todayGames.map(game => {
        const { odds, home, away } = game;
        const awayTeam = teams.find(team => away === team.name);
        const homeTeam = teams.find(team => home === team.name);
        const dbRating = homeTeam.rating - awayTeam.rating;
        let spread = 0;
        const homeField = checkHomeField(game);
        spread += homeField;
        const division = sameDivision(game);
        spread += division;
        spread = spread / 5;
        let homeSpread = rounding(dbRating + spread) * -1;
        homeSpread = homeSpread > 0 ? `+${homeSpread}` : homeSpread;
        return [
            home,
            homeTeam.rating,
            away,
            awayTeam.rating,
            spread,
            `${home} ${homeSpread}`,
            odds,
        ];
    });
    const header = [
        'Home Team',
        'Home DB Rating',
        'Away Team',
        'Away DB Rating',
        'Environmental Factors',
        'DB Spread',
        'ESPN Spread',
    ];
    const csvFromGames = convertArrayToCSV(final, {
        header,
        separator: ',',
    });
    fs.writeFile(`./csv/nbaModel${date}.csv`, csvFromGames, err => {
        if (err) console.log(err);
        else console.log('model csv file written');
    });
};

handler();
