import { test, expect, BrowserContext } from 'playwright/test';
console.log('init wallet test file');

import {
    click,
    checkAndClick,
    initWallet,
    fill,
    clickmmask,
    checkAndClickMMask,
    fillmmask,
    prepareBrowser,
    waiter,
    checkForWalletConnection,
} from './helpers/utils';

// test('init wallet', async () => {
//   await initWalletFunc();

//   console.log('first test done !!!!!!!!!!!')
// })

export async function initWalletFunc(browser: BrowserContext) {
    await initWallet(browser);
}
