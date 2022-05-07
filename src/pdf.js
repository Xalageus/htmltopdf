const puppeteer = require('puppeteer-core');
const chpre = require('./chromium-prepare');

const defaults = {removeInternalLinks: false, removeExternalLinks: false, removeLinksContaining: [], paperFormat: null, paperWidth: '', paperHeight: '', emulateScreen: false};

/**
 * 
 * @param {String} url 
 * @param {String} filename 
 * @param {function} callback
 * @param {function} dcCallback
 * @param {typeof defaults} options
 */
async function convertToPDF(url, filename, callback, dcCallback, options = {}){
    let _options = {...defaults, ...options}

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
    }, _options.removeInternalLinks, _options.removeExternalLinks, _options.removeLinksContaining);

    callback("Generating PDF...");
    if(_options.emulateScreen){
        page.emulateMediaType('screen');
    }

    //Might add support for mixing these settings in the future...
    if(_options.paperFormat == 'Auto'){
        //Use print settings from page css
        await page.pdf({ path: filename, preferCSSPageSize: true });
    }else if(_options.paperFormat == 'Manual'){
        //Manually specified width and height
        await page.pdf({ path: filename, width: _options.paperWidth, height: _options.paperHeight });
    }else{
        //All other formats
        await page.pdf({ path: filename, format: _options.paperFormat });
    }

    await browser.close();
    callback("Done.");
}

module.exports = {
    convertToPDF,
    defaults
};
