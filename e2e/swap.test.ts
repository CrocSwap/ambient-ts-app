import { BrowserContext, Page } from 'playwright';
import { test } from 'playwright/test';

import {
    checkAndClick,
    checkForWalletConnection,
    click,
    clickmmask,
    fill,
    initWallet,
    prepareBrowser,
    waiter,
} from './helpers/utils';

let browser: BrowserContext;

test.beforeEach(async () => {
    if (browser) {
        return browser;
    }
    browser = await prepareBrowser();
});

async function testMeta(browser: BrowserContext) {
    const context: BrowserContext = browser;

    await waiter(2);
    const page: Page = await context.newPage();

    await page.goto(
        'http://localhost:3000/trade/market/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
    );

    try {
        await checkForWalletConnection(page, browser);
        await fill('#swap_sell_qty', page, '.007');

        // confirm swap button
        await waiter(5);
        await checkAndClick('#confirm_swap_button', page);
        await waiter(1);

        // submit swap button
        await click('#set_skip_confirmation_button', page);
        const ppp = await browser.waitForEvent('page');
        await clickmmask('page-container-footer-next', ppp);

        // await clickmmask('page-container-footer-cancel', ppp);
        console.log('clicked');

        await waiter(10);
    } catch (err) {
        console.log('error', err);
    }
}

async function initWalletTest(browser: BrowserContext) {
    await waiter(2);
    await initWallet(browser);
    await waiter(5);
}

test.setTimeout(90000);

test('init wallet', async () => {
    await initWalletTest(browser);
});

test('Make swap', async () => {
    await testMeta(browser);
});
