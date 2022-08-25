const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function screenshot() {
    let page;
    let browser;
    try {
        const options = process.env.AWS_REGION
            ? {
                  args: chrome.args,
                  executablePath: await chrome.executablePath,
                  headless: chrome.headless,
                  ignoreDefaultArgs: ['--disable-extensions'],
              }
            : {
                  headless: true,
                  args: [],
                  ignoreDefaultArgs: ['--disable-extensions'],
                  executablePath:
                      process.platform === 'win32'
                          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                          : process.platform === 'linux'
                          ? '/usr/bin/google-chrome'
                          : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
              };

        browser = await puppeteer.launch(options);
        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(
            'http://www.prociv.pt/pt-pt/SITUACAOOPERACIONAL/Paginas/default.aspx?cID=11'
        );

        try {
            await page.waitForFunction(
                () =>
                    document.querySelector('#listOcorrenciasDetails tbody')
                        .childElementCount || 0 > 0
            );
        } catch (error) {
            const screenshot = await page.screenshot({ encoding: 'base64' });
            await browser.close();
            return `data:image/jpeg;base64,${screenshot}`;
        }

        await page.evaluate(() => {
            const element = document.querySelector(
                '#listOcorrenciasDetails tbody'
            );
            if (element) {
                element.scrollIntoView();
            }
        });

        const isElementVisible = async (page, cssSelector) => {
            let visible = true;
            await page
                .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
                .catch(() => {
                    visible = false;
                });
            return visible;
        };

        let loadMoreVisible = await isElementVisible(
            page,
            '#listOcorrenciasDetails > table > tfoot > tr > th > span'
        );
        let loadMoreTries = 0;
        const loadMoreTriesMax = 8;
        try {
            while (loadMoreVisible && loadMoreTries < loadMoreTriesMax) {
                loadMoreTries += 1;
                loadMoreVisible = await isElementVisible(
                    page,
                    '#listOcorrenciasDetails > table > tfoot > tr > th > span'
                );
                if (
                    loadMoreVisible &&
                    page.$(
                        '#listOcorrenciasDetails > table > tfoot > tr > th > span'
                    ) !== null
                ) {
                    await page.click(
                        '#listOcorrenciasDetails > table > tfoot > tr > th > span'
                    );
                    await page.evaluate(() => {
                        const element = document.querySelector(
                            '#listOcorrenciasDetails > table > tfoot > tr > th > span'
                        );
                        if (element) {
                            element.scrollIntoView();
                        }
                    });
                }
            }
        } catch (error) {
            const screenshot = await page.screenshot({ encoding: 'base64' });
            await browser.close();
            return `data:image/jpeg;base64,${screenshot}`;
        }

        const screenshot = await page.screenshot({ encoding: 'base64' });
        await browser.close();
        return `data:image/jpeg;base64,${screenshot}`;
    } catch {
        const screenshot = await page.screenshot({ encoding: 'base64' });
        await browser.close();
        return `data:image/jpeg;base64,${screenshot}`;
    }
}

module.exports = screenshot;
