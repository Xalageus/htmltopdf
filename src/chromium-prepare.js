/** @type {puppeteer.PuppeteerNode} puppeteer */
const puppeteer = require('puppeteer-core');
//Use older got until electron supports ES6 modules
const got = require('got');

const browserFetcher = puppeteer.createBrowserFetcher({path: './.local-chromium'});

const MAX_REVISION_CHECK = 50;

async function getLatestStableChromiumRevision(){
    let res = await got('https://chromiumdash.appspot.com/fetch_milestones?only_branched=true', {responseType: 'json'});
    //Guessing that second pos is always stable?
    let pos = res.body[1].chromium_main_branch_position

    for(let i = 0; i < res.body.length; i++){
        if(res.body[i].schedule_active && res.body[i].schedule_phase == 'stable'){
            pos = res.body[i].chromium_main_branch_position;
        }
    }

    return pos;
}

async function downloadChrome(callback){
    let revision = parseInt(await getLatestStableChromiumRevision());
    let maxRevision = revision + MAX_REVISION_CHECK;

    //Find the artifact for the given revision
    console.log("[chromium-prepare] Checking chromium revisions starting at %d", revision);
    while((!await browserFetcher.canDownload(revision.toString())) && revision < maxRevision){
        console.log("[chromium-prepare] Chromium revision %d not available", revision);
        revision += 1;
    }

    if(revision >= maxRevision){
        throw("[chromium-prepare] Failed to find an available chromium revision for your os");
    }

    console.log("[chromium-prepare] Downloading chromium revision (%d)...", revision);
    return await browserFetcher.download(revision.toString(), callback);
}

async function checkChrome(callback){
    let revisions = await browserFetcher.localRevisions();
    if(revisions.length == 0){
        return await downloadChrome(callback);
    }

    return browserFetcher.revisionInfo(revisions[0]);
}

async function getChromiumVersion(callback){
    const browser = await puppeteer.launch({executablePath: (await checkChrome(callback)).executablePath});
    let version = browser.version();
    browser.close();
    return version;
}

module.exports = {
    checkChrome,
    downloadChrome,
    getChromiumVersion
};
