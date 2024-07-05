/* eslint-disable quotes */
/* eslint-disable camelcase */
import { chromium, Page, BrowserContext, Browser } from 'playwright';
import * as path from 'path';
import { click, clickmmask, waiter } from '../helpers/utils';
import { locators } from './meta_page_locators';
import { expect } from 'playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

// go to trade page
export async function goto(page: Page) {
    await page.goto(locators.gotoTradePage);
    return page;
}

// go to swap page
export async function gotoSwap(page: Page) {
    await page.goto(locators.gotoSwap);
    return page;
}

// go to Chat link
export async function gotoChat(page: Page) {
    await page.goto(locators.gotoChat);
    return page;
}

// go to home page
export async function gotoHomepage(page: Page) {
    await page.goto(locators.gotoHomepage);
    return page;
}
// ---------------------------------------click-----------------------------------
// sidebar liquidity postion
export async function clickLiqPosition(page: Page) {
    await page.locator(locators.clickLiqPosition).click();
    return page;
}

// sidebar limit orders
export async function clickLimitOrder(page: Page) {
    await page.locator(locators.clickLimitOrder).click();
    return page;
}

// sidebar transactions
export async function clickTransactions(page: Page) {
    await page.locator(locators.clickTransactions).click();
    return page;
}

// id needed
// go to account page
export async function clickAccountPage(page: Page) {
    await page
        .getByTestId('page-header')
        .getByRole('link', { name: 'Account' })
        .click();
    return page;
}

// click on wallet Balances tab
export async function clickWalletBalances(page: Page) {
    await page.locator(locators.clickWalletBalances).click();
    return page;
}

// click on exchange Balances tab
export async function clickExchangeBalances(page: Page) {
    await page.locator(locators.clickExchangeBalances).click();
    return page;
}

// click on exchange Balances tab
export async function clickLiquidityTab(page: Page) {
    await page.locator(locators.clickLiquidityTab).click();
    return page;
}

// click on limits tab
export async function clickLimitTab(page: Page) {
    await page.locator(locators.clickLimitTab).click();
    return page;
}

// click on limits tab
export async function clickLimit(page: Page) {
    await page.locator(locators.clickLimit).click();
    return page;
}

// click on Pool tab
export async function clickPoolTab(page: Page) {
    await page.locator(locators.clickPoolTab).click();
    return page;
}

// click on transactions tab
export async function clickTransactionsTab(page: Page) {
    await page.locator(locators.clickTransactionsTab).click();
    return page;
}

// click on transfer tab
export async function clickTransferTab(page: Page) {
    await page.locator(locators.clickTransferTab).click();
    return page;
}

// click on change token button on account page
export async function clickChangeTokenAccount(page: Page) {
    await page.locator(locators.clickChangeTokenAccount).click();
    await page.locator(locators.clickSelectChangeToken).fill('USDC');
    await page.locator('button').filter({ hasText: 'USDC' }).click();
    return page;
}

// id needed
// click on transfer button
export async function clickTransfer(page: Page) {
    await page.locator(locators.clickTransfer).click();
    return page;
}

// click on withdraw tab
export async function clickWithdrawTab(page: Page) {
    await page.locator(locators.clickWithdrawTab).click();
    return page;
}

// click on "send to a different address" toggle
export async function clickDifferentAddress(page: Page) {
    await page.locator(locators.clickDifferentAddress).click();
    return page;
}

// click on withdarw button
export async function clickWithdraw(page: Page) {
    await page.locator(locators.clickWithdraw).click();
    return page;
}

// click on deposit
export async function clickDeposit(page: Page) {
    await page.locator(locators.clickDeposit).click();
    return page;
}

// click on Transactions tab under chart
// ID missing
export async function clickLiquidityTransactionTable(page: Page) {
    await page.getByRole('tab', { name: 'Liquidity' }).click();
    return page;
}

// click on Limits tab under chart
// ID missing
export async function clickLimitsTransactionTable(page: Page) {
    await page.getByRole('tab', { name: 'Limits' }).click();
    return page;
}

// click on Transactions tab under chart
// ID missing
export async function clickTransactionsTransactionTable(page: Page) {
    await page.getByRole('tab', { name: 'Transactions' }).click();
    return page;
}

// click add liq on transaction table
export async function clickAddLiquidity(page: Page) {
    const locator = await page.getByText(locators.clickAddLiquidity).nth(1);
    const text = await locator.innerText();
    if (text == 'Add') {
        await locator.click();
        // enter amount usdc
        await page.locator(locators.enterAmountLiquidity).fill('50');
        // click on confirm
        await page.locator(locators.clickSubmit).click();
        await page.locator(locators.clickConfirm).click();
    } else {
        // fail test add does not exist
        expect(text).toContain('Add');
    }
    return page;
}

// id needed
// click remove limits on transaction table
export async function clickRemoveLimits(page: Page) {
    const locator = await page.getByText(locators.clickRemoveLimits).nth(1);
    const text = await locator.innerText();
    if (text == 'Remove') {
        await locator.click();
        // remove limit order
        await page.locator(locators.clickRemoveLimitOrder).click();
    } else {
        // fail test remove does not exist
        expect(text).toContain('Remove');
    }
    return page;
}

// click remove liq on transaction table
export async function clickRemoveLiquidity(page: Page) {
    const locator = await page.getByText(locators.clickRemoveLimits).nth(1);
    const text = await locator.innerText();
    if (text == 'Remove') {
        await locator.click();
        // enter amount usdc
        await page.locator(locators.enterAmountRemove).click();
        // click on confirm
        await page.locator(locators.clickRemoveLiq).click();
        await page.locator(locators.clickConfirm).click();
    } else {
        // fail test remove does not exist
        expect(text).toContain('Remove');
    }
    return page;
}

// id needed
// click reverse button swap page
export async function clickReverseTokenSwap(page: Page) {
    await page.getByLabel(locators.clickReverseTokenSwap).click();
    return page;
}

// click on deposit
export async function clickSettingsSwap(page: Page) {
    await page.locator(locators.clickSettingsSwap).click();
    return page;
}

// click on submit swap settings
export async function clickSubmitSlippage(page: Page) {
    await page.locator(locators.clickSubmitSlippage).click();
    return page;
}

// click on Confirm swap
export async function clickConfirmSwap(page: Page) {
    await page.locator(locators.clickConfirm).click();
    return page;
}

// click on submit swap / pool
export async function clickSubmitSwap(page: Page) {
    await page.locator(locators.clickConfirm).click();
    return page;
}

// click on confirm limit
export async function clickConfirmLimit(page: Page) {
    await page.locator(locators.clickConfirmLimit).click();
    return page;
}

// click on transactions row to open shareable chart button
export async function clickTransactionsRow(page: Page) {
    await page.locator(locators.clickTransactionsRow).click();
    return page;
}

// click on detail on shareable chart
// ID missing
export async function clickDetailsShareableChart(page: Page) {
    await page
        .getByLabel('modal', { exact: true })
        .getByRole('button', { name: 'Details' })
        .click();
    return page;
}

// click remove liq on transaction table
export async function clickClaimLimit(page: Page) {
    if ((await page.locator(locators.clickClaimLimit).innerText()) == 'Claim') {
        const locator = await page.locator(locators.clickClaimLimit).click;
        // click on claim limit order
        await page.locator(locators.clickRemoveLimitOrder).click();
    } else {
        // fail test add does not exist
        const locator = await page.locator(locators.clickClaimLimit);
        const text = await locator.innerText();
        expect(text).toContain('Claim');
    }
    return page;
}

// click on submit swap
export async function clickMyTransactions(page: Page) {
    await page.locator(locators.clickMyTransactions).click();
    return page;
}

// click on balanced Toggle
export async function clickBalancedToggle(page: Page) {
    await page.locator(locators.clickBalancedToggle).click();
    return page;
}

// click on decrease min price
export async function clickDecreaseMinPrice(page: Page) {
    await page.locator(locators.clickDecreaseMinPrice).click();
    await page.locator(locators.clickDecreaseMinPrice).click();
    return page;
}

// click on confirm pool transaction
export async function clickConfirmPool(page: Page) {
    await page.locator(locators.clickSubmit).click();
    return page;
}

// increase limit by one click
export async function clickLimitRate(page: Page) {
    await page.locator(locators.clickLimitRate).click();
    return page;
}

// click change network
export async function clickChangeNetwork(page: Page) {
    await page.getByText('Sepolia').click();
    await page.getByText('Blast').click();
    return page;
}

// click change network ---MMask Page
export async function clickChangeWallet(page: Page) {
    await click(locators.clickChangeWallet, page);
    await page.locator(locators.clickChangeWalletSelecet).click();
    return page;
}

// id missing
export async function click_Open_Chat(page: Page) {
    await this.page.locator(locators.chatOpenTrollbox).click();
    return page;
}

export async function click_Chat_Room_Dropdown(page: Page) {
    await this.page.locator(locators.chatRoomDropdown).click();
    return page;
}

// id needed
export async function click_Select_Chat_Room(page: Page) {
    await this.page.waitForSelector(
        'div._dropdown_item_1p5ax_277[data-value="ETH / USDC"]',
        { timeout: 60000 },
    );
    const elementHandle = await this.page.$(
        'div._dropdown_item_1p5ax_277[data-value="ETH / USDC"]',
    );

    if (!elementHandle) {
        throw new Error('Element not found.');
    }

    await elementHandle.click();
    // await this.page.getByText('ETH / WBTC').click();
    return page;
}

// ---------------------------------------assert-----------------------------------

// id needed
// assert account page
export async function assertAccountPage(page: Page) {
    const locator = await page.getByRole('link', { name: 'Account' });
    await expect(locator).toBeEnabled();
    return page;
}

// assert wallet balances
export async function assertWalletBalances(page: Page) {
    const locator = await page.locator(locators.clickWalletBalances);
    await expect(locator).toBeEnabled();
    return page;
}

// assert exchange balances
export async function assertExchangeBalances(page: Page) {
    const locator = await page.locator(locators.clickExchangeBalances);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Liq tab
export async function assertLiquidityTab(page: Page) {
    const locator = await page.locator(locators.clickLiquidityTab);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Limit tab
export async function assertLimitTab(page: Page) {
    const locator = await page.locator(locators.clickLimitTab);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Transactions tab
export async function assertTransactionsTab(page: Page) {
    const locator = await page.locator(locators.clickTransactionsTab);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Transaction complete ----ERRRORRR
export async function assertTransaction(page: Page) {
    const locator = await page.locator(
        'div > div > div > div.MuiAlert-message.css-1xsto0d',
    );
    const text = await locator.innerText();
    expect(text).toContain('successfully');
    return page;
}

// id missing
// assert Transaction complete Swap page
export async function assertTransactionSwap(page: Page) {
    const locator = await page.locator(locators.assertTransactionSwap);
    // Wait until the text contains "Transaction Confirmed"
    await page.waitForSelector('text=Transaction Confirmed');

    // Get the updated text
    const text = await locator.innerText();

    // Check if the updated text contains "Transaction Confirmed"
    expect(text).toContain('Transaction Confirmed');
    return page;
}

// id missing
// assert wallet id shareable chart
export async function assertIdShareableChart(page: Page, text: string) {
    const locator = await page.locator(locators.assertIdShareableChart);

    // Get id
    const id = await locator.innerText();

    // Remove the dots from the idText
    // const cleanedIdText = text.replace(/\./g, '');

    // Check if the updated text contains "Transaction Confirmed"
    expect(id).toContain(text);
    return page;
}

// id missing
// assert wallet id shareable chart
export async function assertValLimitPriceShareableChart(
    page: Page,
    text: string,
) {
    const locator = await page.locator(
        locators.assertValLimitPriceShareableChart,
    );
    // Get val
    const val = await locator.innerText();
    // Check if the updated text contains "Transaction Confirmed"
    expect(val).toContain(text);
    return page;
}

// id missing
// assert Transaction complete Swap page
export async function assertTransactionsTransactionTab(page: Page) {
    const locator = await page.locator(
        locators.assertTransactionsTransactionTab,
    );
    // Get the text
    const text = await locator.innerText();
    // Check if the updated text contains "Transaction Confirmed"
    expect(text).toContain('you');
    return page;
}

// id missing
// assert change of network
export async function assertChangeNetwork(page: Page) {
    await page.waitForSelector('#hero > div > div > img');
    const locator = await page.locator(locators.assertChangeNetwork);
    // Get the text
    const text = await locator.innerText();
    // Check if the updated text contains "Blast"
    expect(text).toContain('Blast');
    return page;
}

// assert Balanced Toggel active
export async function assertBalancedToggle(page: Page) {
    const locator = await page.locator(locators.clickBalancedToggle);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Wallet conectivity SawpPage
export async function assertWalletonnectivity(page: Page) {
    const locator = await page.locator(locators.getWalletConnectivity);
    await expect(locator).toBeEnabled();
    return page;
}

// ---------------------------------------fill-----------------------------------

// fill in address on transfer tab
export async function fillTransferTab(page: Page) {
    await page
        .locator(locators.fillTransferTab)
        .fill('0x849C8e8Ee487424475D9e8f44244275599790B16');
    return page;
}

// fill in address on withdraw tab
export async function fillWithdrawTab(page: Page) {
    await page
        .locator(locators.fillWithdrawTab)
        .fill('0x849C8e8Ee487424475D9e8f44244275599790B16');
    return page;
}

// fill 5 usdc account transfer/withdraw
export async function fillTransferUSDC(page: Page) {
    await page.locator(locators.fillTransferUSDC).fill('5');
    return page;
}

// fill slippage tolerance swap settings
export async function fillSwapPageSlippage(page: Page) {
    await page.locator(locators.fillTransferUSDC).fill('0.2');
    return page;
}

// fill Pool value
export async function fillPool(page: Page, num: number) {
    await page.locator(locators.fillPool).fill(num.toString());
    return page;
}

// fill Limit value
export async function fillLimit(page: Page, num: number) {
    await page.locator(locators.fillLimit).fill(num.toString());
    return page;
}

// fill Swap value
export async function fillSwap(page: Page, num: number) {
    await page.locator(locators.fillSwap).fill(num.toString());
    return page;
}

// fill set pool balance percentage
export async function fillPoolBar(page: Page, num: number) {
    await page.locator(locators.fillPoolBar).fill(num.toString());
    return page;
}

// ---------------------------------------confirm-----------------------------------

// confirm transaction on metamask
export async function confirmMeta(page: Page) {
    await clickmmask(locators.confirmMeta, page);
    return page;
}

// confirm transaction on metamask
export async function confirmNetworkChange(page: Page) {
    await page.getByText(locators.confirmNetworkChange).click();
    return page;
}

// ---------------------------------------get-----------------------------------

// id needed
// get id on liquidity tab transactions
export async function getIdLiquidity(page: Page) {
    const locator = await page.locator(locators.getIdLiquidity);
    // Get text of id
    const text = await locator.innerText();
    return text;
}

// get the value of the limit price
export async function getValLimitPrice(page: Page) {
    const locator = await page.locator(locators.getValLimitPrice);
    // Get text of limit value
    const text = await locator.innerText();
    return text;
}
