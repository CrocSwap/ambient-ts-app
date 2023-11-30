/* eslint @typescript-eslint/no-var-requires: "off" */
import fs from 'fs';
import * as path from 'path';
const superagent = require('superagent');
const admZip = require('adm-zip');

const mmaskURL =
    'https://github.com/MetaMask/metamask-extension/releases/download/v11.0.0/metamask-chrome-11.0.0.zip';
const downloadPath = path.join(__dirname, 'metamask.zip');
const extractPath = path.join(__dirname, 'metamask');

console.log('downloadPath', downloadPath);
console.log('extractPath', extractPath);

export async function downloadMMask() {
    return new Promise((resolve, reject) => {
        superagent
            .get(mmaskURL)
            .pipe(fs.createWriteStream(downloadPath))
            .on('finish', function () {
                console.log('downloaded');

                const zip = new admZip(downloadPath);
                zip.extractAllTo(extractPath, true);
                resolve(true);
            });
    });
}
