import { test, expect } from './helpers/fixtures.ts';
import {
    click,
    checkAndClick,
    fill,
    clickmmask,
    initWallet,
    waiter,
    checkForWalletConnection,
} from './helpers/utils';

test('popup page', async ({ page, extensionId }) => {
    // await clickmmask('page-container-footer-cancel', ppp);
    // console.log('clicked');
    await waiter(10);
    // await expect(page.locator('body')).toHaveText('my-extension popup');
    await page.goto(
        'http://localhost:3000/trade/market/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
    );
    waiter(10);
});
