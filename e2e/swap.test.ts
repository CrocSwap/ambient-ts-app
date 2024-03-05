import { chromium, Page, BrowserContext, Browser } from 'playwright';
import { test, expect } from 'playwright/test';
import {
    assertAccountPage,
    assertExchangeBalances,
    assertLimitTab,
    assertLiquidityTab,
    assertTransaction,
    assertTransactionSwap,
    assertTransactionsTab,
    assertWalletBalances,
    clickAccountPage,
    clickAddLiquidity,
    clickChangeTokenAccount,
    clickConfirmSwap,
    clickDeposit,
    clickDifferentAddress,
    clickExchangeBalances,
    clickLimitOrder,
    clickLimitTab,
    clickLiqPosition,
    clickLiquidityTab,
    clickLiquidityTransactionTable,
    clickRemoveLiquidity,
    clickReverseTokenSwap,
    clickSettingsSwap,
    clickSubmitSlippage,
    clickSubmitSwap,
    clickTransactions,
    clickTransactionsTab,
    clickTransfer,
    clickTransferTab,
    clickWalletBalances,
    clickWithdraw,
    clickWithdrawTab,
    confirmMeta,
    fillSwapPageSlippage,
    fillSwapPageUSDC,
    fillTransferTab,
    fillTransferUSDC,
    fillWithdrawTab,
    goto,
    gotoSwap,
} from './pages/meta_page';

import {
    click,
    checkAndClick,
    fill,
    clickmmask,
    initWallet,
    checkAndClickMMask,
    fillmmask,
    prepareBrowser,
    waiter,
    checkForWalletConnection,
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
test.setTimeout(90000);

test('test_CS_1132_Swap_Wallet', async () => {
    await initWallet(browser);
});

test('Make swap', async () => {
    await testMeta(browser);
});

test('test_CS_1300_Sidebar_Liq_Position', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // open sidebar for liquidity postion
    await clickLiqPosition(page);
    // need to add open transaction problem on görli not visible at the moment
});

test('test_CS_1299_Sidebar_Limit_Order', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // open sidebar for Limit Order
    await clickLimitOrder(page);
    // need to add open transaction problem on görli not visible at the moment
});

test('test_CS_1293_Sidebar_Transaction', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // open sidebar for Limit Order
    await clickTransactions(page);
    // need to add open transaction problem on görli not visible at the moment
});

test('test_CS_1042_Account', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // go to account page
    await clickAccountPage(page);
    // assert if account page is visible
    await assertAccountPage(page);
});

test('test_CS_915_Account_Wallet_Bal', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // go to account page
    await clickAccountPage(page);
    // click on wallet balances
    await clickWalletBalances(page);
    // assert if account page is visible
    await assertWalletBalances(page);
});

test('test_CS_914_Account_Exchange_Balance', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // go to account page
    await clickAccountPage(page);
    // click on exchange balances
    await clickExchangeBalances(page);
    // assert if tab is enabled
    await assertExchangeBalances(page);
});

test('test_CS_913_Account_Ranges', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // go to account page
    await clickAccountPage(page);
    // click on Liq tab
    await clickLiquidityTab(page);
    // assert if account page is visible
    await assertLiquidityTab(page);
});

test('test_CS_912_Account_Limit', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // go to account page
    await clickAccountPage(page);
    // click on Limit tab
    await clickLimitTab(page);
    // assert if account page is visible
    await assertLimitTab(page);
});

test('test_CS_911_Account_Transaction', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // go to account page
    await clickAccountPage(page);
    // click on Limit tab
    await clickTransactionsTab(page);
    // assert if account page is visible
    await assertTransactionsTab(page);
});

test('test_CS_909_Account_Transfer', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // go to account page
    await clickAccountPage(page);
    // click on Transfer
    await clickTransferTab(page);
    // fill in address
    await fillTransferTab(page);
    // change token to usdc
    await clickChangeTokenAccount(page);
    // enter 5 usdc
    await fillTransferUSDC(page);
    // click transfer button
    await clickTransfer(page);
    // assert if transaction is made
    await assertTransaction(page);
});

test('test_CS_908_Account_Withdraw', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // go to account page
    await clickAccountPage(page);
    // click on Withdraw
    await clickWithdrawTab(page);
    // click on "send to a different address" toggle
    await clickDifferentAddress(page);
    // change token to usdc
    await clickChangeTokenAccount(page);
    // enter 5 usdc
    await fillTransferUSDC(page);
    // fill in address
    await fillWithdrawTab(page);
    // click withdraw button
    await clickWithdraw(page);
    // assert if transaction is made
    await assertTransaction(page);
});

test('test_CS_907_Account_Deposit', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // go to account page
    await clickAccountPage(page);
    // change token to usdc
    await clickChangeTokenAccount(page);
    // enter 5 usdc
    await fillTransferUSDC(page);
    // click Deposit button
    await clickDeposit(page);
    // assert if transaction is made
    // ERROR IN ASSERTION!!!!!!
    await assertTransaction(page);
});

test('test_CS_772_Pool_Add', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // click on Liquidity tab under chart
    await clickLiquidityTransactionTable(page);
    // click add liq. --> assertin inside function
    await clickAddLiquidity(page);
});

test('test_CS_771_Pool_Remove', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // click on Liquidity tab under chart
    await clickLiquidityTransactionTable(page);
    // click add liq. --> assertin inside function
    await clickRemoveLiquidity(page);
});

test('test_CS_767_Slippage', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    // go to swap page
    await gotoSwap(page);
    await page.bringToFront();
    // reverse token so that usdc is on top
    await clickReverseTokenSwap(page);
    // fill in 10 usdc on swap page
    await fillSwapPageUSDC(page);
    // click on setting on swap page
    await clickSettingsSwap(page);
    // change slippage amount on settings page
    await fillSwapPageSlippage(page);
    // click on submit swap settings page
    await clickSubmitSlippage(page);
    // click on Confirm swap page
    await clickConfirmSwap(page);
    // click on Submit swap page
    await clickSubmitSwap(page);
    const metaPage = await browser.waitForEvent('page');
    // confirm metamask transaction
    await confirmMeta(metaPage);
    // assert transaction
    await assertTransactionSwap(page);
});
