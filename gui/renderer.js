const $ = window.$;

document.getElementById('createPdfBtn').addEventListener('click', getSavePath);
document.getElementById('showHideOptionsBtn').addEventListener('click', showHideOptions);
document.getElementById('paperFormat-selection').addEventListener('change', showHideManualPaperSizeOptions);

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {Boolean}
 */
function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

/**
 * @param {Array<String>} arr
 * @returns {Array<String>}
 */
function cleanArray(arr){
    if(arraysEqual(arr, [''])){
        return [];
    }

    return arr;
}

function showHideOptions(){
    $('.options-container').toggle(500);
}

function showHideManualPaperSizeOptions(){
    if(document.getElementById('paperFormat-selection').value == 'Manual'){
        $('.manualPaperFormat-container:hidden').toggle(500);
    }else{
        $('.manualPaperFormat-container:visible').toggle(500);
    }
}

function printStatus(message){
    document.querySelector(".status").innerHTML = message;
}

function downloadChromiumStatus(currentBytes, totalBytes){
    let progress = parseFloat((currentBytes / totalBytes) * 100).toFixed(2);
    printStatus("Downloading chromium... (" + progress + "%)");
}

function createPDF(path){
    if(path){
        let url = document.getElementById('url-input').value;
        let ril = document.getElementById('ril-input').checked;
        let rel = document.getElementById('rel-input').checked;
        let rlc = cleanArray(document.getElementById('rlc-input').value.split(' '));
        let pf = document.getElementById('paperFormat-selection').value;
        let pw = document.getElementById('paperWidth-input').value;
        let ph = document.getElementById('paperHeight-input').value;
        let es = document.getElementById('es-input').checked;

        let settings = {
            removeInternalLinks: ril,
            removeExternalLinks: rel,
            removeLinksContaining: rlc,
            paperFormat: pf,
            paperWidth: pw,
            paperHeight: ph,
            emulateScreen: es
        };
    
        window.api.convertToPDF(url, path, printStatus, downloadChromiumStatus, settings);
    }
}

function getSavePath(){
    let url = document.getElementById('url-input').value;
    if(url){
        window.api.askSavePath();
    }
}

//Connect IPC callbacks
window.callbackConnect.receiveSavePath(createPDF);
