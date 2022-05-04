const yargs = require('yargs/yargs');
const pdf = require('./src/pdf');
const chpre = require('./src/chromium-prepare');

const CmdPaths = {
    Default: 0,
    PrintChromiumVersion: 1
};
let currentPath = CmdPaths.Default;

const args = yargs(process.argv.slice(2))
    .command({
        command: '$0 <url> <pdf output>',
        builder: (yargs) => {
            return yargs.option('remove-internal-links', {
                type: 'boolean',
                description: 'Remove links that do not leave the page',
                default: false,
                alias: 'ril'
            })
            .option('remove-external-links', {
                type: 'boolean',
                description: 'Remove links that leave the page',
                default: false,
                alias: 'rel'
            })
            .option('remove-links-containing', {
                type: 'array',
                description: 'Remove links containing this text',
                alias: 'rlc',
                default: []
            })
        }
    })
    .command({
        command: 'print-chromium-version',
        description: 'Print chromium version',
        handler: () => {
            currentPath = CmdPaths.PrintChromiumVersion;
        }
    })
    .parse();

function printStatus(message){
    console.log(message);
}

function downloadChromiumStatus(currentBytes, totalBytes){
    let progressFloat = ((currentBytes / totalBytes) * 100);
    let progress = progressFloat.toFixed(2);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Downloading chromium... (" + progress + "%)")

    if(progressFloat == 100){
        process.stdout.write("\n")
    }
}

async function main(){
    switch(currentPath){
        case CmdPaths.Default:
            pdf.convertToPDF(args.url, args.pdfoutput, args.removeInternalLinks, args.removeExternalLinks, args.removeLinksContaining, printStatus, downloadChromiumStatus);
            break;
        case CmdPaths.PrintChromiumVersion:
            console.log(await chpre.getChromiumVersion(downloadChromiumStatus));
            break;
    }
}

main();
