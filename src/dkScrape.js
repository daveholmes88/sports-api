const puppeteer = require('puppeteer');

async function scrapeTableData() {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
        });
        const page = await browser.newPage();

        await page.goto(
            'https://sportsbook.draftkings.com/leagues/soccer/euro-2024-qualifying',
            {
                waitUntil: 'domcontentloaded',
            }
        );
        // await page.waitForSelector('#login-username-input');
        // await page.type('#login-username-input', 'phoenix1988@gmail.com');
        // await page.type('#login-password-input', 'Yodajams11!');
        // await page.click('#login-submit');
        // await page.goto('https://sportsbook.draftkings.com/mybets', {
        //     waitUntil: 'domcontentloaded',
        // });
        await page.waitForSelector('.sportsbook-event-accordion__wrapper');
        await page.evaluate(async () => {
            const selector = '.sportsbook-event-accordion__wrapper';
            const games = document.querySelectorAll(selector);
            // const rows = table.querySelectorAll('tr');
            console.log(games);
            games.forEach(async game => {
                console.log(
                    game.querySelector('.sportsbook-event-accordion__title')
                );
                const button = game.querySelector(
                    '.sportsbook-event-accordion__title'
                );
                button.click();
                await new Promise(function (resolve) {
                    setTimeout(resolve, 5000);
                });
                console.log('+++++++++++++++');
                const moneylineDiv = document.querySelector(
                    '[aria-label="Event Accordion for Draw No Bet (Regular Time)"]'
                );
                console.log(moneylineDiv);
            });

            // rows.forEach(row => {
            //     const rowData = [];
            //     const columns = row.querySelectorAll('td, th');
            //     columns.forEach(column => {
            //         rowData.push(column.textContent.trim());
            //     });
            //     data.push(rowData.join(','));
            // });
        });
        // await browser.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

scrapeTableData();
