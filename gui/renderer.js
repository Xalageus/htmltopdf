const $ = window.$;

document.getElementById('createPdfBtn').addEventListener('click', getSavePath);
document.getElementById('showHideOptionsBtn').addEventListener('click', showHideOptions);

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

function printStatus(message){
    document.querySelector(".status").innerHTML = message;
}

function downloadChromiumStatus(currentBytes, totalBytes){
    let progress = parseFloat((currentBytes / totalBytes) * 100).toFixed(2);
    printStatus("Downloading chromium... (" + progress + "%)");
}

function createPdf(path){
    if(path){
        let url = document.getElementById('url-input').value;
        let ril = document.getElementById('ril-input').checked;
        let rel = document.getElementById('rel-input').checked;
        let rlc = cleanArray(document.getElementById('rlc-input').value.split(' '));
    
        window.api.convertToPDF(url, path, ril, rel, rlc, printStatus, downloadChromiumStatus);
    }
}

function getSavePath(){
    let url = document.getElementById('url-input').value;
    if(url){
        window.api.askSavePath();
    }
}

//Connect IPC callbacks
window.callbackConnect.receiveSavePath(createPdf);
