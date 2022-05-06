const puppeteer = require('puppeteer-core');
const chpre = require('./chromium-prepare');

/**
 * 
 * @param {String} url 
 * @param {String} filename 
 * @param {Boolean} ril 
 * @param {Boolean} rel 
 * @param {Array<String>} rlc 
 * @param {function} callback
 * @param {function} dcCallback
 * @param {String} paperFormat
 */
async function convertToPDF(url, filename, ril, rel, rlc, callback, dcCallback, paperFormat){
    callback("Loading chromium...");
    let chrome = await chpre.checkChrome(dcCallback);

    callback("Loading page...")
    let browser = await puppeteer.launch({executablePath: chrome.executablePath});
    let page = await browser.newPage();

    try{
        await page.goto(url, {
            waitUntil: 'networkidle0',
        });
    }catch(e){
        callback(e);
        await browser.close();
        return;
    }
    
    await page.evaluate( ( /** @type {Boolean} */ ril, /** @type {Boolean} */ rel, /** @type {Array<String>} */ rlc) => {
        //Remove internal links
        if(ril){
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.removeAttribute('href');
        });
        }

        //Remove external links
        if(rel){
        document.querySelectorAll('a[href]:not([href^="#"])').forEach(a => {
            a.removeAttribute('href');
        });
        }

        //Remove links containing
        for(let i = 0; i < rlc.length; i++){
        document.querySelectorAll(`a[href*="${rlc[i]}"]`).forEach(a => {
            a.removeAttribute('href');
        });
        }
    }, ril, rel, rlc);

    callback("Generating PDF...");
    await page.pdf({ path: filename, format: paperFormat });

    await browser.close();
    callback("Done.");
}

module.exports = {
    convertToPDF
};
