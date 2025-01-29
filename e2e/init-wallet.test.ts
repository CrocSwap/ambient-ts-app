import { BrowserContext } from 'playwright/test';
console.log('init wallet test file');

import { initWallet } from './helpers/utils';

// test('init wallet', async () => {
//   await initWalletFunc();

//   console.log('first test done !!!!!!!!!!!')
// })

export async function initWalletFunc(browser: BrowserContext) {
    await initWallet(browser);
}
