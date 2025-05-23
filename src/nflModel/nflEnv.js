const homeFieldAdvantage = {
    ChicagoBears: 5,
    GreenBayPackers: 5,
    MinnesotaVikings: 2,
    DetroitLions: 3,
    PittsburghSteelers: 3,
    BaltimoreRavens: 2,
    ClevelandBrowns: 2.5,
    CincinnatiBengals: 3,
    NewYorkJets: 3,
    MiamiDolphins: 4,
    NewEnglandPatriots: 2,
    BuffaloBills: 3,
    JacksonvilleJaguars: 3,
    TennesseeTitans: 4,
    HoustonTexans: 3,
    IndianapolisColts: 3,
    DenverBroncos: 4,
    LosAngelesChargers: 2,
    LasVegasRaiders: 4,
    KansasCityChiefs: 3,
    PhiladelphiaEagles: 4,
    NewYorkGiants: 4,
    DallasCowboys: 4,
    WashingtonCommanders: 2,
    TampaBayBuccaneers: 3,
    SeattleSeahawks: 3,
    SanFrancisco49ers: 3,
    ArizonaCardinals: 2,
    AtlantaFalcons: 2,
    NewOrleansSaints: 2,
    CarolinaPanthers: 3,
    LosAngelesRams: 2,
};

const divisions = {
    ChicagoBears: 'nfcNorth',
    GreenBayPackers: 'nfcNorth',
    MinnesotaVikings: 'nfcNorth',
    DetroitLions: 'nfcNorth',
    PittsburghSteelers: 'afcNorth',
    BaltimoreRavens: 'afcNorth',
    ClevelandBrowns: 'afcNorth',
    CincinnatiBengals: 'afcNorth',
    NewYorkJets: 'afcEast',
    MiamiDolphins: 'afcEast',
    NewEnglandPatriots: 'afcEast',
    BuffaloBills: 'afcEast',
    JacksonvilleJaguars: 'afcSouth',
    TennesseeTitans: 'afcSouth',
    HoustonTexans: 'afcSouth',
    IndianapolisColts: 'afcSouth',
    DenverBroncos: 'afcWest',
    LosAngelesChargers: 'afcWest',
    LasVegasRaiders: 'afcWest',
    KansasCityChiefs: 'afcWest',
    PhiladelphiaEagles: 'nfcEast',
    NewYorkGiants: 'nfcEast',
    DallasCowboys: 'nfcEast',
    WashingtonCommanders: 'nfcEast',
    TampaBayBuccaneers: 'nfcSouth',
    SeattleSeahawks: 'nfcWest',
    SanFrancisco49ers: 'nfcWest',
    ArizonaCardinals: 'nfcWest',
    AtlantaFalcons: 'nfcSouth',
    NewOrleansSaints: 'nfcSouth',
    CarolinaPanthers: 'nfcSouth',
    LosAngelesRams: 'nfcWest',
};

const conferences = {
    ChicagoBears: 'nfc',
    GreenBayPackers: 'nfc',
    MinnesotaVikings: 'nfc',
    DetroitLions: 'nfc',
    PittsburghSteelers: 'afc',
    BaltimoreRavens: 'afc',
    ClevelandBrowns: 'afc',
    CincinnatiBengals: 'afc',
    NewYorkJets: 'afc',
    MiamiDolphins: 'afc',
    NewEnglandPatriots: 'afc',
    BuffaloBills: 'afc',
    JacksonvilleJaguars: 'afc',
    TennesseeTitans: 'afc',
    HoustonTexans: 'afc',
    IndianapolisColts: 'afc',
    DenverBroncos: 'afc',
    LosAngelesChargers: 'afc',
    LasVegasRaiders: 'afc',
    KansasCityChiefs: 'afc',
    PhiladelphiaEagles: 'nfc',
    NewYorkGiants: 'nfc',
    DallasCowboys: 'nfc',
    WashingtonCommanders: 'nfc',
    TampaBayBuccaneers: 'nfc',
    SeattleSeahawks: 'nfc',
    SanFrancisco49ers: 'nfc',
    ArizonaCardinals: 'nfc',
    AtlantaFalcons: 'nfc',
    NewOrleansSaints: 'nfc',
    CarolinaPanthers: 'nfc',
    LosAngelesRams: 'nfc',
};

const timezones = {
    ChicagoBears: 'central',
    GreenBayPackers: 'central',
    MinnesotaVikings: 'central',
    DetroitLions: 'east',
    PittsburghSteelers: 'east',
    BaltimoreRavens: 'east',
    ClevelandBrowns: 'east',
    CincinnatiBengals: 'east',
    NewYorkJets: 'east',
    MiamiDolphins: 'east',
    NewEnglandPatriots: 'east',
    BuffaloBills: 'east',
    JacksonvilleJaguars: 'east',
    TennesseeTitans: 'east',
    HoustonTexans: 'central',
    IndianapolisColts: 'east',
    DenverBroncos: 'mountain',
    LosAngelesChargers: 'pacific',
    LasVegasRaiders: 'pacific',
    KansasCityChiefs: 'central',
    PhiladelphiaEagles: 'east',
    NewYorkGiants: 'east',
    DallasCowboys: 'central',
    WashingtonCommanders: 'east',
    TampaBayBuccaneers: 'east',
    SeattleSeahawks: 'pacific',
    SanFrancisco49ers: 'pacific',
    ArizonaCardinals: 'pacific',
    AtlantaFalcons: 'east',
    NewOrleansSaints: 'east',
    CarolinaPanthers: 'east',
    LosAngelesRams: 'pacific',
};

const bye = {};

const longDistance = {
    SeattleSeahawks: [
        'Detroit Lions',
        'Philadelphia Eagles',
        'Tennessee Titans',
        'Miami Dolphins',
        'Chicago Bears',
        'Dallas Cowboys',
        'Pittsburgh Steelers',
        'Cleveland Browns',
        'Carolina Panthers',
        'New York Giants',
        'Tampa Bay Buccaneers',
        'Atlanta Falcons',
        'Buffalo Bills',
        'Cincinnati Bengals',
        'Jacksonville Jaguars',
        'New Orleans Saints',
        'New York Jets',
        'Baltimore Ravens',
        'Houston Texans',
        'Indianapolis Colts',
        'New England Patriots',
        'Washington Commanders',
    ],
    SanFrancisco49ers: [
        'Detroit Lions',
        'Philadelphia Eagles',
        'Tennessee Titans',
        'Miami Dolphins',
        'Chicago Bears',
        'Pittsburgh Steelers',
        'Cleveland Browns',
        'Carolina Panthers',
        'New York Giants',
        'Tampa Bay Buccaneers',
        'Atlanta Falcons',
        'Buffalo Bills',
        'Cincinnati Bengals',
        'Jacksonville Jaguars',
        'New Orleans Saints',
        'New York Jets',
        'Baltimore Ravens',
        'Indianapolis Colts',
        'New England Patriots',
        'Washington Commanders',
        'Green Bay Packers',
    ],
    LosAngelesChargers: [
        'Detroit Lions',
        'Philadelphia Eagles',
        'Tennessee Titans',
        'Miami Dolphins',
        'Chicago Bears',
        'Pittsburgh Steelers',
        'Cleveland Browns',
        'Carolina Panthers',
        'New York Giants',
        'Tampa Bay Buccaneers',
        'Atlanta Falcons',
        'Buffalo Bills',
        'Cincinnati Bengals',
        'Jacksonville Jaguars',
        'New Orleans Saints',
        'New York Jets',
        'Baltimore Ravens',
        'Indianapolis Colts',
        'New England Patriots',
        'Washington Commanders',
        'Green Bay Packers',
    ],
    LosAngelesRams: [
        'Detroit Lions',
        'Philadelphia Eagles',
        'Tennessee Titans',
        'Miami Dolphins',
        'Chicago Bears',
        'Pittsburgh Steelers',
        'Cleveland Browns',
        'Carolina Panthers',
        'New York Giants',
        'Tampa Bay Buccaneers',
        'Atlanta Falcons',
        'Buffalo Bills',
        'Cincinnati Bengals',
        'Jacksonville Jaguars',
        'New Orleans Saints',
        'New York Jets',
        'Baltimore Ravens',
        'Indianapolis Colts',
        'New England Patriots',
        'Washington Commanders',
        'Green Bay Packers',
    ],
    ArizonaCardinals: [
        'Philadelphia Eagles',
        'Miami Dolphins',
        'Pittsburgh Steelers',
        'Cleveland Browns',
        'Carolina Panthers',
        'New York Giants',
        'Tampa Bay Buccaneers',
        'Buffalo Bills',
        'Jacksonville Jaguars',
        'New York Jets',
        'Baltimore Ravens',
        'New England Patriots',
        'Washington Commanders',
    ],
    LasVegasRaiders: [
        'Detroit Lions',
        'Philadelphia Eagles',
        'Miami Dolphins',
        'Pittsburgh Steelers',
        'Cleveland Browns',
        'Carolina Panthers',
        'New York Giants',
        'Tampa Bay Buccaneers',
        'Buffalo Bills',
        'Jacksonville Jaguars',
        'New York Jets',
        'Baltimore Ravens',
        'New England Patriots',
        'Washington Commanders',
    ],
    DenverBroncos: ['Miami Dolphins'],
    DallasCowboys: ['Seattle Seahawks'],
    HoustonTexans: ['Seattle Seahawks'],
    DetroitLions: [
        'Seattle Seahawks',
        'San Francisco 49ers',
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'Las Vegas Raiders',
    ],
    ChicagoBears: [
        'Seattle Seahawks',
        'San Francisco 49ers',
        'Los Angeles Chargers',
        'Los Angeles Rams',
    ],
    GreenBayPackers: [
        'Seattle Seahawks',
        'San Francisco 49ers',
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'Las Vegas Raiders',
    ],
    MinnesotaVikings: [],
    PittsburghSteelers: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    BaltimoreRavens: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    ClevelandBrowns: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    CincinnatiBengals: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    NewYorkJets: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    MiamiDolphins: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
        'Denver Broncos',
    ],
    NewEnglandPatriots: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    BuffaloBills: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    JacksonvilleJaguars: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    TennesseeTitans: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Seattle Seahawks',
    ],
    IndianapolisColts: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Seattle Seahawks',
    ],
    KansasCityChiefs: [],
    PhiladelphiaEagles: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    NewYorkGiants: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    WashingtonCommanders: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    TampaBayBuccaneers: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    AtlantaFalcons: [
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'San Francisco 49ers',
        'Las Vegas Raiders',
        'Seattle Seahawks',
        'Arizona Cardinals',
    ],
    NewOrleansSaints: [
        'Seattle Seahawks',
        'San Francisco 49ers',
        'Los Angeles Chargers',
        'Los Angeles Rams',
    ],
    CarolinaPanthers: [
        'Seattle Seahawks',
        'San Francisco 49ers',
        'Los Angeles Chargers',
        'Los Angeles Rams',
        'Las Vegas Raiders',
    ],
};

const thursday = {};

const friday = {};

const monday = {};

const pacific = [
    'Los Angeles Chargers',
    'Los Angeles Rams',
    'San Francisco 49ers',
    'Las Vegas Raiders',
    'Seattle Seahawks',
];
const mountain = ['Arizona Cardinals', 'Denver Broncos'];
const central = [
    'Detroit Lions',
    'Tennessee Titans',
    'Kansas City Chiefs',
    'Minnesota Vikings',
    'Chicago Bears',
    'Dallas Cowboys',
    'Green Bay Packers',
    'New Orleans Saints',
    'Houston Texans',
];
const eastern = [
    'Philadelphia Eagles',
    'Miami Dolphins',
    'Pittsburgh Steelers',
    'Cleveland Browns',
    'Carolina Panthers',
    'New York Giants',
    'Tampa Bay Buccaneers',
    'Atlanta Falcons',
    'Buffalo Bills',
    'Cincinnati Bengals',
    'Jacksonville Jaguars',
    'New York Jets',
    'Baltimore Ravens',
    'Indianapolis Colts',
    'New England Patriots',
    'Washington Commanders',
];

const overtimeLastWeek = [{ away: '', home: '' }];

const sameDivision = (away, home, neutral) => {
    if (neutral) return 0;
    if (
        divisions[away.replaceAll(' ', '')] ===
        divisions[home.replaceAll(' ', '')]
    )
        return -1;
    return 0;
};

const differentConference = (away, home, neutral) => {
    if (neutral) return 0;
    if (
        conferences[away.replaceAll(' ', '')] !==
        conferences[home.replaceAll(' ', '')]
    )
        return 1;
    return 0;
};

const checkBlowouts = (away, home, lastWeekGames, week) => {
    let impact = 0;
    if (week === 1) return 0;
    const ag = lastWeekGames.find(
        g => g.homeTeam === away || g.awayTeam === away
    );
    const hg = lastWeekGames.find(
        g => g.homeTeam === home || g.awayTeam === home
    );
    let awayMargin = 0;
    let homeMargin = 0;
    if (ag)
        awayMargin =
            ag.homeTeam === away
                ? ag.homeScore - ag.awayScore
                : ag.awayScore - ag.homeScore;
    if (hg)
        homeMargin =
            hg.homeTeam === home
                ? hg.homeScore - hg.awayScore
                : hg.awayScore - hg.homeScore;
    if (awayMargin < -16) impact -= 2;
    if (awayMargin < -23) impact -= 2;
    if (awayMargin < -27) impact -= 2;
    if (homeMargin < -16) impact += 2;
    if (homeMargin < -23) impact += 2;
    if (awayMargin < -27) impact += 2;
    return impact;
};

const byeLastWeek = (home, away, week) => {
    let impact = 0;
    const byeLastWeek = bye[week - 1];
    if (byeLastWeek) {
        if (byeLastWeek.find(team => team === home.team)) {
            const ranking = home.ffp_power;
            if (ranking < -2) impact += 4;
            if (ranking >= -2 && ranking < 2) impact += 5;
            if (ranking >= 2) impact += 7;
        }
        if (byeLastWeek.find(team => team === away.team)) {
            const ranking = away.ffp_power;
            if (ranking < -2) impact -= 5;
            if (ranking >= -2 && ranking < 2) impact -= 6;
            if (ranking >= 2) impact -= 8;
        }
    }
    return impact;
};

const checkNightGames = game => {
    const { date, neutral } = game;
    if (neutral) return 0;
    if (
        date.includes('Thu') ||
        date.includes('Wed') ||
        date.includes('Fri') ||
        date.includes('Mon')
    ) {
        return 2;
    }
    if (date.includes('Sun') && date.includes('8:20')) {
        return 4;
    }
    return 0;
};

const superBowlCheck = (away, home, week) => {
    if (week > 4) return 0;
    let impact = 0;
    if (home === 'Philadelphia Eagles') {
        impact += week === 1 ? 4 : 2;
    }
    if (away === 'Philadelphia Eagles') {
        impact -= week === 1 ? 4 : 2;
    }
    if (home === 'Kansas City Chiefs') {
        impact -= week === 1 ? 4 : 2;
    }
    if (away === 'Kansas City Chiefs') {
        impact += week === 1 ? 4 : 2;
    }
    return impact;
};

const checkLongDistance = (away, home, neutral) => {
    if (neutral) return 0;
    if (longDistance[away.replaceAll(' ', '')].find(t => t === home)) return 1;
    return 0;
};

const shortDistances = [
    ['Tampa Bay Buccaneers', 'Jacksonville Jaguars', 'Miami Dolphins'],
    ['Dallas Cowboys', 'Houston Texans'],
    ['Atlanta Falcons', 'Carolina Panthers'],
    ['Los Angeles Rams', 'Los Angeles Chargers', 'Las Vegas Raiders'],
    ['Indianapolis Colts', 'Cincinnati Bengals'],
    [
        'Philadlphia Eagles',
        'New York Giants',
        'New York Jets',
        'Washington Commanders',
        'New England Patriots',
        'Baltimore Ravens',
        'Buffalo Bills',
    ],
    ['Chicago Bears', 'Green Bay Packers'],
];

const noDistance = [
    ['New York Jets', 'New York Giants'],
    ['Los Angeles Rams', 'Los Angeles Chargers'],
    ['Washington Commanders', 'Baltimore Ravens'],
];

const checkShortDistance = (away, home, neutral) => {
    if (neutral) return 0;
    const awayIncluded = shortDistances.find(a => a.includes(away));
    if (awayIncluded) {
        if (awayIncluded.includes(home)) return -1;
    }
    return 0;
};

const checkNoDistance = (away, home, neutral) => {
    if (neutral) return 0;
    const awayIncluded = noDistance.find(a => a.includes(away));
    if (awayIncluded) {
        if (awayIncluded.includes(home)) return -1;
    }
    return 0;
};

const thursdayCheck = (awayTeam, homeTeam, week) => {
    let impact = 0;
    if (thursday[week - 1]) {
        thursday[week - 1].find(t => t === awayTeam) ? (impact -= 2) : null;
        thursday[week - 1].find(t => t === homeTeam) ? (impact += 2) : null;
    }
    if (friday[week - 1]) {
        friday[week - 1].find(t => t === awayTeam) ? (impact -= 2) : null;
        friday[week - 1].find(t => t === homeTeam) ? (impact += 2) : null;
    }
    return impact;
};

const mondayCheck = (awayTeam, homeTeam, week) => {
    let impact = 0;
    monday[week - 1].forEach(m => {
        if (m.home === awayTeam) {
            impact -= 4;
        }
        if (m.away === homeTeam) {
            impact -= 6;
        }
        if (m.away === awayTeam) {
            impact += 8;
        }
    });
    return impact;
};

const overtimeCheck = (awayTeam, homeTeam) => {
    let impact = 0;
    overtimeLastWeek.forEach(g => {
        if (awayTeam === g.home) {
            impact += 2;
        }
        if (awayTeam === g.away) {
            impact += 1;
        }
        if (homeTeam === g.home) {
            impact -= 2;
        }
        if (homeTeam === g.away) {
            impact -= 1;
        }
    });
    return impact;
};

const timeZoneCheck = game => {
    const { away, home, date, neutral } = game;
    if (neutral) return 0;
    let impact = 0;
    if (date !== 'Final') {
        const hour = parseInt(date.split(' at ')[1].split(':')[0]);
        if (hour === 1) {
            if (pacific.find(team => team === away)) {
                impact += 2;
            }
            if (mountain.find(team => team === away)) {
                impact += 1;
            }
            if (pacific.find(team => team === home)) {
                impact -= 2;
            }
            if (mountain.find(team => team === home)) {
                impact -= 1;
            }
        }
        if (hour > 6) {
            if (eastern.find(team => team === away)) {
                impact += 6;
            }
            if (central.find(team => team === away)) {
                impact += 3;
            }
            if (mountain.find(team => team === away)) {
                impact += 1;
            }
            if (eastern.find(team => team === home)) {
                impact -= 6;
            }
            if (central.find(team => team === home)) {
                impact -= 3;
            }
            if (mountain.find(team => team === home)) {
                impact -= 1;
            }
        }
    }
    return impact;
};

const awayCheck = (away, lastWeekGames, home, week) => {
    let impact = 0;
    if (week === 1) return impact;
    const alw = lastWeekGames.find(game => game.awayTeam === away);
    if (alw) {
        const { homeTeam } = alw;
        if (
            timezones[away.replaceAll(' ', '')] === 'pacific' &&
            (timezones[home.replaceAll(' ', '')] === 'east' ||
                timezones[home.replaceAll(' ', '')] === 'central')
        ) {
            timezones[homeTeam.replaceAll(' ', '')] === 'east' ||
            timezones[homeTeam.replaceAll(' ', '')] === 'central'
                ? (impact = 2)
                : null;
        }
        if (
            timezones[away.replaceAll(' ', '')] === 'mountain' &&
            timezones[home.replaceAll(' ', '')] === 'east'
        ) {
            timezones[homeTeam.replaceAll(' ', '')] === 'east'
                ? (impact = 2)
                : null;
        }
        if (
            timezones[away.replaceAll(' ', '')] === 'central' &&
            timezones[home.replaceAll(' ', '')] === 'pacific'
        ) {
            timezones[homeTeam.replaceAll(' ', '')] === 'mountain'
                ? (impact = 2)
                : null;
        }
        if (
            timezones[away.replaceAll(' ', '')] === 'east' &&
            (timezones[home.replaceAll(' ', '')] === 'pacific' ||
                timezones[home.replaceAll(' ', '')] === 'mountain')
        ) {
            timezones[homeTeam.replaceAll(' ', '')] === 'mountain' ||
            timezones[homeTeam.replaceAll(' ', '')] === 'pacific'
                ? (impact = 2)
                : null;
        }
    }
    return impact;
};

const playoffCheck = (away, home) => {
    if (playoffs[away.replaceAll(' ', '')] === home) {
        return -6;
    }
    if (playoffs[home.replaceAll(' ', '')] === away) {
        return 6;
    }
    return 0;
};

const checkHomeField = game => {
    const { neutral, home } = game;
    if (neutral) return 0;
    return homeFieldAdvantage[home.replaceAll(' ', '')];
};

const threeOfFour = game => {
    if (game.neutral) return 0;
    let spread = 0;
    if (game.allAway) {
        spread = 2;
    }
    return spread;
};

const worseRecord = (game, home, away) => {
    const { homeRecord, awayRecord } = game;
    if (
        conferences[game.away.replaceAll(' ', '')] !==
        conferences[game.home.replaceAll(' ', '')]
    )
        return 0;
    const homeWins = parseInt(homeRecord.split('-'));
    const awayWins = parseInt(awayRecord.split('-'));
    if (homeWins > awayWins) {
        if (away.espn_api > 1) return -5;
    }
    if (awayWins > homeWins) {
        if (home.espn_api > 1) return 5;
    }
    return 0;
};

const checkStreak = game => {
    let impact = 0;
    if (game.awayStreak === 'winning') impact += 3;
    if (game.awayStreak === 'losing') impact -= 3;
    if (game.homeStreak === 'winning') impact -= 3;
    if (game.homeStreak === 'losing') impact += 3;
    return impact;
};

const rounding = num => Math.round(num * 100) / 100;

const handler = (game, week, lastWeekGames, away, home, envFactors = []) => {
    const { neutral } = game;
    const awayTeam = game.away;
    const homeTeam = game.home;
    let spread = 0;
    const homeField = checkHomeField(game);
    spread += homeField;
    const division = sameDivision(awayTeam, homeTeam, neutral);
    spread += division;
    const conference = differentConference(awayTeam, homeTeam, neutral);
    spread += conference;
    const bye = byeLastWeek(home, away, week);
    spread += bye;
    const blowouts = checkBlowouts(awayTeam, homeTeam, lastWeekGames);
    spread += blowouts;
    const backToBackAway = awayCheck(awayTeam, lastWeekGames, homeTeam, week);
    spread += backToBackAway;
    const nightGame = checkNightGames(game);
    spread += nightGame;
    const superBowl = superBowlCheck(awayTeam, homeTeam, week);
    spread += superBowl;
    const longDistance = checkLongDistance(awayTeam, homeTeam, neutral);
    spread += longDistance;
    const shortDistance = checkShortDistance(awayTeam, homeTeam, neutral);
    spread += shortDistance;
    const noDistance = checkNoDistance(awayTeam, homeTeam);
    spread += noDistance;
    const thursday = thursdayCheck(awayTeam, homeTeam, week);
    spread += thursday;
    const monday = mondayCheck(awayTeam, homeTeam, week);
    spread += monday;
    const overtime = overtimeCheck(awayTeam, homeTeam);
    spread += overtime;
    const timeZone = timeZoneCheck(game);
    spread += timeZone;
    const threeOfFourAway = threeOfFour(game);
    spread += threeOfFourAway;
    const record = worseRecord(game, home, away);
    spread += record;
    const streak = checkStreak(game);
    spread += streak;
    spread = spread / 5;
    envFactors.push([
        homeTeam,
        awayTeam,
        homeField,
        division,
        conference,
        nightGame,
        longDistance,
        shortDistance,
        thursday,
        monday,
        overtime,
        timeZone,
        superBowl,
        bye,
        blowouts,
        backToBackAway,
        threeOfFourAway,
        record,
        streak,
        rounding(spread),
    ]);
    return spread;
};

module.exports = { handler };
