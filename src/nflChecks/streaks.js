const rename = {
    SF: 'San Francisco 49ers',
    KC: 'Kansas City Chiefs',
    BAL: 'Baltimore Ravens',
    DET: 'Detroit Lions',
    BUF: 'Buffalo Bills',
    DAL: 'Dallas Cowboys',
    CIN: 'Cincinnati Bengals',
    PHI: 'Philadelphia Eagles',
    HOU: 'Houston Texans',
    GB: 'Green Bay Packers',
    MIA: 'Miami Dolphins',
    NYJ: 'New York Jets',
    LAR: 'Los Angeles Rams',
    CLE: 'Cleveland Browns',
    ATL: 'Atlanta Falcons',
    JAX: 'Jacksonville Jaguars',
    PIT: 'Pittsburgh Steelers',
    LAC: 'Los Angeles Chargers',
    CHI: 'Chicago Bears',
    IND: 'Indianapolis Colts',
    SEA: 'Seattle Seahawks',
    TB: 'Tampa Bay Buccaneers',
    ARI: 'Arizona Cardinals',
    LV: 'Las Vegas Raiders',
    MIN: 'Minnesota Vikings',
    NO: 'New Orleans Saints',
    TEN: 'Tennessee Titans',
    WSH: 'Washington Commanders',
    NYG: 'New York Giants',
    DEN: 'Denver Broncos',
    NE: 'New England Patriots',
    CAR: 'Carolina Panthers',
};

const streaks = async () => {
    let week = 5
    const winners = {}
    while (week > 0) {
    const jsonWeek = await fetch(
        `https://cdn.espn.com/core/nfl/schedule?xhr=1&year=2024&seasontype=2&week=${week}`
    );
    const weekData = await jsonWeek.json();
    const schedule = weekData.content.schedule;
    const dates = Object.keys(schedule);
    winners[week] = {}
    for (let date of dates) {
        for (let game of schedule[date].games) {
            const id = game.id;
            const away = game.competitions[0].competitors.find(
                g => g.homeAway === 'away'
            );
            const home = game.competitions[0].competitors.find(
                g => g.homeAway === 'home'
            );
            const awayTeam = away.team.displayName;
            const homeTeam = home.team.displayName;
            const awayScore = parseInt(away.score);
            const homeScore = parseInt(home.score);
            const jsonGame = await fetch(
                `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/odds`
            );
            const gameData = await jsonGame.json();
            const odds = gameData?.items[0].details || 'n/a';
            if (odds !== 'n/a') {
                const oddsArray = odds.split(' ')
                const favorite = rename[oddsArray[0]]
                const number = parseInt(oddsArray[1]) * -1
                if (favorite === homeTeam){
                    if ((homeScore - awayScore) > number) {
                        winners[week][homeTeam] = true
                        winners[week][awayTeam] = false
                    } else if (homeScore - awayScore === number) {
                        winners[week][homeTeam] = 'push'
                        winners[week][awayTeam] = 'push'
                    } else {
                        winners[week][homeTeam] = false
                        winners[week][awayTeam] = true
                    }
                }
                if (favorite === awayTeam) {
                    if ((awayScore - homeScore) > number) {
                        winners[week][awayTeam] = true
                        winners[week][homeTeam] = false
                    } else if (awayScore - homeScore === number) {
                        winners[week][homeTeam] = 'push'
                        winners[week][awayTeam] = 'push'
                    } else {
                        winners[week][awayTeam] = false
                        winners[week][homeTeam] = true
                    }
                }
            }
        }
    }
    week --
    }
}

streaks()