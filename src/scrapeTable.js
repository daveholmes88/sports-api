const fs = require('fs');
const puppeteer = require('puppeteer');

// NBA advanced stats
// const url = 'https://www.nba.com/stats/teams/advanced?dir=A&sort=TEAM_NAME';
// const table = '.Crom_table__p1iZz'
// const fileName = 'nba_advanced'

 // EPL advanced stats
 const url = 'https://fbref.com/en/comps/9/2022-2023/stats/2022-2023-Premier-League-Stats';
 const tableSelector = '#stats_squads_standard_for';
 const fileName = 'epl_advanced'

async function scrapeTableData() {
  try {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: "domcontentloaded",
      });
    await page.waitForSelector(tableSelector);
    const tableData = await page.evaluate(() => {
        const tableSelector = '#stats_squads_standard_for';
        const table = document.querySelector(tableSelector)
        const rows = table.querySelectorAll('tr');
        const data = [];

        rows.forEach((row) => {
            const rowData = [];
            const columns = row.querySelectorAll('td, th');
            columns.forEach((column) => {
              rowData.push(column.textContent.trim());
            });
            data.push(rowData.join(','));
          });
      
        return data;
    });

    fs.writeFileSync(`./csv/${fileName}.csv`, tableData.join('\n'));

    console.log('Table data saved.');
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

scrapeTableData();
    