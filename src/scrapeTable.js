
const fs = require('fs');
const puppeteer = require('puppeteer');


const url = 'https://www.nba.com/stats/teams/advanced?dir=A&sort=TEAM_NAME';

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
    await page.waitForSelector('.Crom_table__p1iZz');
    const tableData = await page.evaluate(() => {
        const table = document.querySelector('.Crom_table__p1iZz')
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

    fs.writeFileSync('../csv/nba_advanced.csv', tableData.join('\n'));

    console.log('Table data saved.');
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

scrapeTableData();
    