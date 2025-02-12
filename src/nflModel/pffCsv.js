const fs = require('fs');
const { week } = require('../variables/nfl')

const rename = {
    SF: 'San Francisco 49ers',
    KC: 'Kansas City Chiefs',
    BLT: 'Baltimore Ravens',
    DET: 'Detroit Lions',
    BUF: 'Buffalo Bills',
    DAL: 'Dallas Cowboys',
    CIN: 'Cincinnati Bengals',
    PHI: 'Philadelphia Eagles',
    HST: 'Houston Texans',
    GB: 'Green Bay Packers',
    MIA: 'Miami Dolphins',
    NYJ: 'New York Jets',
    LA: 'Los Angeles Rams',
    CLV: 'Cleveland Browns',
    ATL: 'Atlanta Falcons',
    JAX: 'Jacksonville Jaguars',
    PIT: 'Pittsburgh Steelers',
    LAC: 'Los Angeles Chargers',
    CHI: 'Chicago Bears',
    IND: 'Indianapolis Colts',
    SEA: 'Seattle Seahawks',
    TB: 'Tampa Bay Buccaneers',
    ARZ: 'Arizona Cardinals',
    LV: 'Las Vegas Raiders',
    MIN: 'Minnesota Vikings',
    NO: 'New Orleans Saints',
    TEN: 'Tennessee Titans',
    WAS: 'Washington Commanders',
    NYG: 'New York Giants',
    DEN: 'Denver Broncos',
    NE: 'New England Patriots',
    CAR: 'Carolina Panthers',
};

fs.readFile(`./csv/pff-ratings-week${week}.csv`, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    // Split the data into rows
    const rows = data.split('\n');
    const teams = [];
    // Process the rows as needed
    for (const row of rows) {
        const values = row.split(',');
        // Do something with the values
        const abbr = values[0].replaceAll('"', '');
        if (rename[abbr]) {
            teams.push({
                team: rename[abbr],
                ranking: parseFloat(values[1].replaceAll('"', '')),
            });
        }
    }
    const jsonString = JSON.stringify(teams);
    fs.writeFile(`./csv/pffRankingsWeek${week}.json`, jsonString, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('JSON file has been created successfully!');
    });
});
