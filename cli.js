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
            .option('paper-format', {
                type: 'string',
                description: 'Output PDF paper size',
                alias: 'pf',
                choices: ['Auto', 'Letter', 'Legal', 'Tabloid', 'Ledger', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
                default: 'Letter'
            })
            .option('width', {
                type: 'string',
                description: 'Output PDF paper width (Overrides paper format option)',
                alias: 'w'
            })
            .option('height', {
                type: 'string',
                description: 'Output PDF paper height (Overrides paper format option)',
                alias: 'h'
            })
            .option('emulate-screen', {
                type: 'boolean',
                description: 'Ignores printer modifications',
                alias: 'es'
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
            var settings = {
                removeInternalLinks: args.removeInternalLinks,
                removeExternalLinks: args.removeExternalLinks,
                removeLinksContaining: args.removeLinksContaining,
                paperFormat: args.paperFormat,
                paperWidth: args.width,
                paperHeight: args.height,
                emulateScreen: args.emulateScreen
            };

            if(args.width || args.height){
                settings.paperFormat = 'Manual'
            }
            pdf.convertToPDF(args.url, args.pdfoutput, printStatus, downloadChromiumStatus, settings);
            break;
        case CmdPaths.PrintChromiumVersion:
            console.log(await chpre.getChromiumVersion(downloadChromiumStatus));
            break;
    }
}

main();
