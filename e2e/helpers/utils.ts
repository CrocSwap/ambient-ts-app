import * as dotenv from 'dotenv';
import fs from 'fs';
import * as path from 'path';
import { BrowserContext, chromium, Page } from 'playwright';

dotenv.config({ path: '.env.local' });

import { downloadMMask } from './mmask-fetch';

export async function click(selector: string, page: Page) {
    await page.waitForSelector(selector);
    await page.click(selector);

    return page;
}

export async function checkAndClick(selector: string, page: Page) {
    const el = await page.$(selector);

    if (el) {
        el.click();
    }
}

export async function fill(selector: string, page: Page, value: string) {
    const el = await page.waitForSelector(selector);
    if (el) {
        await el.fill(value);
    }
}
export async function clickmmask(selector: string, page: Page) {
    return click('[data-testid="' + selector + '"]', page);
}

export async function checkAndClickMMask(selector: string, page: Page) {
    return checkAndClick('[data-testid="' + selector + '"]', page);
}

export async function fillmmask(selector: string, page: Page, value: string) {
    return fill('[data-testid="' + selector + '"]', page, value);
}
export async function waiter(delay: number) {
    return new Promise((resolve, reject) => {
        setTimeout(
            async () => {
                resolve(3);
            },
            delay ? delay * 1000 : 5000,
        );
    });
}

export async function prepareBrowser() {
    const userDataDir = path.join(__dirname, 'UserData');
    const pathToExtension = path.join(__dirname, 'metamask');

    if (!fs.existsSync(pathToExtension)) {
        await downloadMMask();
    }

    const browser = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
        ],
    });

    return browser;
}

export async function initWallet(context: BrowserContext) {
    await waiter(2);

    console.log('.............................');
    console.log('Environment variables loaded');
    console.log('.............................');

    const seedEnv = process.env.TEST_METAMASK_SEED
        ? process.env.TEST_METAMASK_SEED
        : '';
    const seed = seedEnv.split(',');

    console.log('Seed phrase loaded');

    async function processWallet(page) {
        const elementHandle = await page.$('#onboarding__terms-checkbox');
        if (elementHandle) {
            await click('#onboarding__terms-checkbox', page);

            await clickmmask('onboarding-import-wallet', page);

            await clickmmask('metametrics-i-agree', page);

            for (let i = 0; i < 12; i++) {
                await fill('#import-srp__srp-word-' + i, page, seed[i]);
            }

            await clickmmask('import-srp-confirm', page);

            await clickmmask('create-password-terms', page);

            await fillmmask('create-password-new', page, '11111111');
            await fillmmask('create-password-confirm', page, '11111111');

            await clickmmask('create-password-import', page);
            await clickmmask('onboarding-complete-done', page);
            await clickmmask('pin-extension-next', page);
            await clickmmask('pin-extension-done', page);
            await clickmmask('popover-close', page);

            await clickmmask('network-display', page);
            await checkAndClick(
                '.multichain-network-list-menu-content-wrapper .toggle-button.toggle-button--off',
                page,
            );
        } else {
            console.log('wallet already created');

            await fill('#password', page, '11111111');
            await clickmmask('unlock-submit', page);

            await checkAndClickMMask('popover-close', page);
            await checkAndClickMMask('onboarding-complete-done', page);
            await checkAndClickMMask('pin-extension-next', page);
            await checkAndClickMMask('pin-extension-done', page);

            // first time popup clicks will be added

            // await clickmmask('account-options-menu-button', page);
            // await clickmmask('global-menu-settings', page);
            // await click('.box.tab-bar__tab.pointer:nth-child(2)', page);
            // await click('[data-testid]="advanced-setting-show-testnet-conversion" ', page);

            await clickmmask('network-display', page);
            await checkAndClick(
                '.multichain-network-list-menu-content-wrapper .toggle-button.toggle-button--off',
                page,
            );
        }

        // select goerli network
        setTimeout(async () => {
            const spanElement = await page
                .locator(
                    '.multichain-network-list-menu-content-wrapper span:text("Goerli")',
                )
                .first();
            if (spanElement) {
                spanElement.click();
            }
            setTimeout(async () => {
                page.close();
            }, 300);
        }, 500);
    }

    const pages = context.pages();
    pages.map(async (page) => {
        if (
            page.url().includes('chrome-extension') &&
            page.url().includes('home.html')
        ) {
            console.log('Page found with URL:', page.url());
            await processWallet(page);
        }
    });
}

export async function checkForWalletConnection(
    page: Page,
    browser: BrowserContext,
) {
    // const el = await page.locator('button[role="button"]').nth(1);
    // const button = await page.waitForSelector(`//button[contains(text(), 'Connect Wallet')]`, {timeout: 100});
    // const button = await page.locator(`button:text("Connect Wallet")`).first();
    // Connect wallet button
    const button = await page.$('#connect_wallet_button_page_header');
    if (button) {
        button.click();
        await waiter(2);
        // Aggree button
        await checkAndClick('#agree_button_ToS', page);

        // Metamask button
        await page
            .locator(
                '#Modal_Global [class^="WalletButton_container"]:nth-child(1)',
            )
            .click();

        try {
            // browser.on('page', async (ppp) => {
            //     await clickmmask('page-container-footer-next', ppp);
            //     await clickmmask('page-container-footer-next', ppp);
            // })
            const ppp = await browser.waitForEvent('page');
            await clickmmask('page-container-footer-next', ppp);
            await clickmmask('page-container-footer-next', ppp);
        } catch (err) {
            console.log('error', err);
        }
        console.log('wallet connected to ambient');
    } else {
        console.log('already connected');
    }
}
