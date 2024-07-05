/* eslint-disable quotes */
/* eslint-disable camelcase */
import { chromium, Page, BrowserContext, Browser } from 'playwright';
import { test, expect } from 'playwright/test';
import {
    assertAccountPage,
    assertBalancedToggle,
    assertChangeNetwork,
    assertExchangeBalances,
    assertIdShareableChart,
    assertLimitTab,
    assertLiquidityTab,
    assertTransaction,
    assertTransactionSwap,
    assertTransactionsTab,
    assertTransactionsTransactionTab,
    assertValLimitPriceShareableChart,
    assertWalletBalances,
    assertWalletonnectivity,
    clickAccountPage,
    clickAddLiquidity,
    clickBalancedToggle,
    clickChangeNetwork,
    clickChangeTokenAccount,
    clickChangeWallet,
    clickClaimLimit,
    clickConfirmLimit,
    clickConfirmPool,
    clickConfirmSwap,
    clickDecreaseMinPrice,
    clickDeposit,
    clickDetailsShareableChart,
    clickDifferentAddress,
    clickExchangeBalances,
    clickLimit,
    clickLimitOrder,
    clickLimitRate,
    clickLimitTab,
    clickLimitsTransactionTable,
    clickLiqPosition,
    clickLiquidityTab,
    clickLiquidityTransactionTable,
    clickMyTransactions,
    clickPoolTab,
    clickRemoveLimits,
    clickRemoveLiquidity,
    clickReverseTokenSwap,
    clickSettingsSwap,
    clickSubmitSlippage,
    clickSubmitSwap,
    clickTransactions,
    clickTransactionsRow,
    clickTransactionsTab,
    clickTransactionsTransactionTable,
    clickTransfer,
    clickTransferTab,
    clickWalletBalances,
    clickWithdraw,
    clickWithdrawTab,
    confirmMeta,
    confirmNetworkChange,
    fillLimit,
    fillPool,
    fillPoolBar,
    fillSwap,
    fillSwapPageSlippage,
    fillTransferTab,
    fillTransferUSDC,
    fillWithdrawTab,
    getIdLiquidity,
    getValLimitPrice,
    goto,
    gotoHomepage,
    gotoSwap,
    click_Open_Chat,
    click_Chat_Room_Dropdown,
    click_Select_Chat_Room,
    gotoChat,
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
// no more in scope, interface changed
/*
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
*/
// no more in scope, interface changed
/*
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
*/
// no more in scope, interface changed
/*
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
*/
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
    await fillSwap(page, 10);
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

test('test_CS_748_Limit_Remove', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // click on Limits tab under chart
    await clickLimitsTransactionTable(page);
    // click add liq. --> assertin inside function
    await clickRemoveLimits(page);
    const metaPage = await browser.waitForEvent('page');
    // confirm metamask transaction
    await confirmMeta(metaPage);
    // assert transaction
    await assertTransactionSwap(page);
});

test('test_CS_692_Ranges_Detail', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // click on Liquidity tab under chart
    await clickLiquidityTransactionTable(page);
    // get the value of the transaction wallet id
    const text = await getIdLiquidity(page);
    // click on transaction to open shareable chart
    await clickTransactionsRow(page);
    // click on details button on shareable chart
    await clickDetailsShareableChart(page);
    // click on details button on shareable chart
    await assertIdShareableChart(page, text);
});

test('test_CS_691_Limit_Detail', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // click on Limits tab under chart
    await clickLimitsTransactionTable(page);
    // get the value of the limit price
    const text = await getValLimitPrice(page);
    // click on transaction to open shareable chart
    await clickTransactionsRow(page);
    // click on details button on shareable chart
    await assertValLimitPriceShareableChart(page, text);
});

test('test_CS_641_Claim', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // click on Limits tab under chart
    await clickLimitsTransactionTable(page);
    // click on claim on the transactions list
    await clickClaimLimit(page);
    const metaPage = await browser.waitForEvent('page');
    // confirm metamask transaction
    await confirmMeta(metaPage);
    // assert transaction
    await assertTransactionSwap(page);
});

test('test_CS_216_Recent_Transactions', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // click on Limits tab under chart
    await clickTransactionsTransactionTable(page);
    // click on "my transactions"
    await clickMyTransactions(page);
    // assert transactions tab is visible
    await assertTransactionsTransactionTab(page);
});

test('test_CS_217_Pool_Advanced', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // click on Pool tab
    await clickPoolTab(page);
    // fill 0.001 ETH Pool tab
    await fillPool(page, 0.001);
    // click on balanced Toggle
    await clickBalancedToggle(page);
    // click on decrease min price
    await clickDecreaseMinPrice(page);
    // click on confirm pool
    await clickConfirmPool(page);
    // click on submit pool
    await clickSubmitSwap(page);
    const metaPage = await browser.waitForEvent('page');
    // confirm metamask transaction
    await confirmMeta(metaPage);
    // assert transaction
    await assertTransactionSwap(page);
});

test('test_CS_206_Pool_Order', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // first denom so that it is usdc/eth
    await clickReverseTokenSwap(page);
    // click on Pool tab
    await clickPoolTab(page);
    // fill 300 usdc Pool tab
    await fillPool(page, 300);
    // check if balanced is activated
    await assertBalancedToggle(page);
    // set the bar to 24%
    await fillPoolBar(page, 24);
    // click on confirm pool
    await clickConfirmPool(page);
    // click on submit pool
    await clickSubmitSwap(page);
    const metaPage = await browser.waitForEvent('page');
    // confirm metamask transaction
    await confirmMeta(metaPage);
    // assert transaction
    await assertTransactionSwap(page);
});

test('test_CS_205_Limit_Order', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // first denom so that it is usdc/eth
    await clickReverseTokenSwap(page);
    // click on limit tab
    await clickLimit(page);
    // fill 300 usdc Limit tab
    await fillLimit(page, 300);
    // increase limit by one click
    await clickLimitRate(page);
    // confirm limit
    await clickConfirmLimit(page);
    // click on submit limit
    await clickSubmitSwap(page);
    const metaPage = await browser.waitForEvent('page');
    // confirm metamask transaction
    await confirmMeta(metaPage);
    // assert transaction
    await assertTransactionSwap(page);
});

test('test_CS_200_Swap_Order', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // first denom so that it is usdc/eth
    await clickReverseTokenSwap(page);
    // fill 300 usdc Swap tab
    await fillSwap(page, 300);
    // confirm Sawp
    await clickConfirmSwap(page);
    // click on submit Swap
    await clickSubmitSwap(page);
    const metaPage = await browser.waitForEvent('page');
    // confirm metamask transaction
    await confirmMeta(metaPage);
    // assert transaction
    await assertTransactionSwap(page);
});

test('test_CS_181_Homepage_Wallet', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await gotoHomepage(page);
});

test('test_CS_172_Swap_Transaction', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await gotoSwap(page);
    await page.bringToFront();
    // first denom so that it is usdc/eth
    await clickReverseTokenSwap(page);
    // fill 20 usdc Swap tab
    await fillSwap(page, 20);
    // confirm Sawp
    await clickConfirmSwap(page);
    // click on submit Swap
    await clickSubmitSwap(page);
    const metaPage = await browser.waitForEvent('page');
    // confirm metamask transaction
    await confirmMeta(metaPage);
    // assert transaction
    await assertTransactionSwap(page);
});

test('test_CS_1304_Switch_Connection', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await gotoHomepage(page);
    // change Network
    await clickChangeNetwork(page);
    const metaPage = await browser.waitForEvent('page');
    // confirm Network Change
    await confirmNetworkChange(metaPage);
    // assert change network
    await assertChangeNetwork(page);
});

// not complete
/*
test('test_CS_1309_Change_Wallet', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    const metaPage = await browser.waitForEvent('page'); 
    // change Wallet
    await clickChangeWallet(metaPage);  
    // confirm Network Change
    //await confirmNetworkChange(metaPage);

});
*/

test('test_CS_1124_Swap_Wallet', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await gotoSwap(page);
    await page.bringToFront();
    // assert if wallet is connected
    await assertWalletonnectivity(page);
});

test('test_CS_199_Trade_Wallet', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();
    // assert if wallet is connected
    await assertWalletonnectivity(page);
});

test('test_CS_1659_Scroll_to_Bottom', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    test.setTimeout(9000000);
    await gotoChat(page);
    await page.bringToFront();
    // open chat panel
    await click_Open_Chat(page);

    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });

    // Add a delay to ensure the page has time to load additional content if needed
    await page.waitForTimeout(2000);

    // Scroll back up to the top of the page
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });

    // Add a delay to ensure the page has time to settle after scrolling
    await page.waitForTimeout(2000);
});

test('test_deneme', async () => {
    const context: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page: Page = await context.newPage();
    await goto(page);
    await page.bringToFront();

    const context2: BrowserContext = browser;
    // connect to metamask
    await initWallet(browser);
    // open ambient finance page
    const page2: Page = await context2.newPage();
});

test('test_deneme2', async () => {
    const context1 = await prepareBrowser('context1');
    const page1: Page = await context1.newPage();

    await initWallet(context1);
    await page1.goto('https://ambient.finance');
    await page1.bringToFront();

    const context2 = await prepareBrowser('context2');
    const page2: Page = await context2.newPage();

    await initWallet(context2);
    await page2.goto('https://ambient.finance');
    await page2.bringToFront();

    // await page2.waitForTimeout(10000);

    await click('#trade_button', page2);
    await click('#chat_room_dropdown', page2);
    await click('#select_chat_room', page2);

    await context1.close();
    await context2.close();
});
