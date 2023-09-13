const fs = require("fs");
const { convertArrayToCSV } = require("convert-array-to-csv");

const handler = async () => {
  const header = [["Home Team", "HS", "Away Team", "AS"]];
  let games = [];
  for (let i = 0; i < 15; i++) {
    const json = await fetch(
      `https://www.balldontlie.io/api/v1/games?start_date=%272022-10-01&end_date=2023-07-01&per_page=100&page=${i}`,
    );
    const data = await json.json();
    data.data.forEach((d) => {
      const homeTeam = d.home_team.full_name;
      const homeScore = d.home_team_score;
      const awayTeam = d.visitor_team.full_name;
      const awayScore = d.visitor_team_score;
      games.push([homeTeam, homeScore, awayTeam, awayScore]);
    });
  }
  const csvFromGames = convertArrayToCSV(games, {
    header,
    separator: ",",
  });
  fs.writeFile("./csv/nbaSchedule.csv", csvFromGames, (err) => {
    if (err) console.log(err);
    else console.log("csv file written");
  });
};

handler();
