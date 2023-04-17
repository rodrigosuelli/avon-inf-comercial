const { chromium } = require('playwright');
require('dotenv').config();

async function downloadInfComercial() {
  try {
    const avonLoginPageUrl =
      'https://www.avoncomigo.avon.com.br/widget/avonwg2/#/login';
    const avonPedidosPageUrl =
      'https://www.avoncomigo.avon.com.br/webapp/wcs/stores/servlet/AvonOrderSearchView?catalogId=3074457345616682769&langId=-6&storeId=10660';

    // Create a browser instance
    const browser = await chromium.launch();
    // Create a new page
    const page = await browser.newPage();
    // Open URL in current page
    await page.goto(avonLoginPageUrl);

    // Fills in login fields, page.type simulates human typing
    await page.type('#userName', process.env.AVON_REGISTRO);
    await page.type('#pwd', process.env.AVON_SENHA);
    await page.click('#loginBtn');
    await page.waitForURL(
      'https://www.avoncomigo.avon.com.br/webapp/wcs/stores/servlet/pt/**'
    );

    await page.goto(avonPedidosPageUrl);
    await page.waitForSelector(
      '.order-list ul:last-child .cel-options .actionsContainer a.submitButton'
    );
    const campanhaPedido = await page.$eval(
      '.order-list ul:last-child .cel-campaign span:first-child',
      (el) => el.innerText
    );
    // Open popup
    await page.click(
      '.order-list ul:last-child .cel-options .actionsContainer a.submitButton'
    );
    // Wait for download button
    await page.waitForSelector('.avonwg-row.more_btns.printRemove');

    // Start waiting for download before clicking. Note no await.
    const downloadPromise = page.waitForEvent('download');
    await page.click('button.download_btn');
    const download = await downloadPromise;

    // Wait for the download process to complete.
    console.log(await download.path());
    // Save downloaded file somewhere
    await download.saveAs(`./temp/C${campanhaPedido} Pedido Avon.pdf`);

    // Close the browser instance
    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

module.exports = downloadInfComercial;
