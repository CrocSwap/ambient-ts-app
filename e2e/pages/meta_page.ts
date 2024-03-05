import { chromium, Page, BrowserContext, Browser } from 'playwright';
import * as path from 'path';
import { expect } from 'playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
// import { downloadMMask } from './helpers/mmask-fetch';
dotenv.config({ path: '.env.local' });
import { clickmmask, waiter } from '../helpers/utils';

// go to trade page
export async function goto(page: Page) {
    await page.goto(
        'http://localhost:3000/trade/market/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
    );
    return page;
}

// go to swap page
export async function gotoSwap(page: Page) {
    await page.goto(
        'http://localhost:3000/swap/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
    );
    return page;
}
// ---------------------------------------click-----------------------------------
// sidebar liquidity postion
export async function clickLiqPosition(page: Page) {
    await page.locator('[id=\'sidebar_header_liquidity_positions\']').click();
    return page;
}

// sidebar limit orders
export async function clickLimitOrder(page: Page) {
    await page.locator('[id=\'sidebar_header_limit_orders\']').click();
    return page;
}

// sidebar transactions
export async function clickTransactions(page: Page) {
    await page.locator('[id=\'sidebar_header_transactions\']').click();
    return page;
}

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
    await page.locator('[id=\'wallet_balances_tab_clickable\']').click();
    return page;
}

// click on exchange Balances tab
export async function clickExchangeBalances(page: Page) {
    await page.locator('[id=\'exchange_balances_tab_clickable\']').click();
    return page;
}

// click on exchange Balances tab
export async function clickLiquidityTab(page: Page) {
    await page.locator('[id=\'liquidity_tab_clickable\']').click();
    return page;
}

// click on limits tab
export async function clickLimitTab(page: Page) {
    await page.locator('[id=\'limits_tab_clickable\']').click();
    return page;
}

// click on transactions tab
export async function clickTransactionsTab(page: Page) {
    await page.locator('[id=\'transactions_tab_clickable\']').click();
    return page;
}

// click on transfer tab
export async function clickTransferTab(page: Page) {
    await page.locator('[id=\'transfer_tab_clickable\']').click();
    return page;
}

// click on transfer tab
export async function clickChangeTokenAccount(page: Page) {
    await page.locator('[id=\'exchangeBalance_token_selector\']').click();
    await page.locator('[id=\'token_select_input_field\']').fill('USDC');
    await page.locator('button').filter({ hasText: 'USDCUSDCoin' }).click();
    return page;
}

// click on transactions tab
export async function clickTransfer(page: Page) {
    await page
        .locator(
            '#subcont > div > div.TabComponent_tab_window__3P7DO > div > div > div > button',
        )
        .click();
    return page;
}

// click on withdraw tab
export async function clickWithdrawTab(page: Page) {
    await page.locator('[id=\'withdraw_tab_clickable\']').click();
    return page;
}

// click on "send to a different address" toggle
export async function clickDifferentAddress(page: Page) {
    await page.locator('[id=\'withdraw_to_different_addressswitch\']').click();
    return page;
}

// click on withdarw button
export async function clickWithdraw(page: Page) {
    await page
        .locator(
            '#subcont > div > div.TabComponent_tab_window__3P7DO > div > div > div > button',
        )
        .click();
    return page;
}

// click on deposit
export async function clickDeposit(page: Page) {
    await page.locator('#deposit_tokens_button').click();
    return page;
}

// click on deposit
// ID missing
export async function clickLiquidityTransactionTable(page: Page) {
    await page.getByRole('tab', { name: 'Liquidity' }).click();
    return page;
}

// click add liq on transaction table
export async function clickAddLiquidity(page: Page) {
    const locator = await page.locator(
        '[id=\'add_liquidity_position_pos_853ed8b2017c165ae15f284e53c4119ef7d5d39055b2ffc15ef2d305efbb5f18\']',
    );
    const text = await locator.innerText();
    if (text == 'Add') {
        await locator.click();
        // enter amount usdc
        await page.locator('[id=\'range_B_qty\']').fill('50');
        // click on confirm
        await page.locator('[id=\'submit_range_position_button\']').click();
        await page.locator('[id=\'set_skip_confirmation_button\']').click();
    } else {
        // fail test add does not exist
        expect(text).toContain('Add');
    }
    return page;
}

// click remove liq on transaction table
export async function clickRemoveLiquidity(page: Page) {
    // const locator = await page.locator("[id='remove_position_pos_853ed8b2017c165ae15f284e53c4119ef7d5d39055b2ffc15ef2d305efbb5f18']")
    // const text = await locator.innerText();
    if (
        (await page
            .locator(
                '[id=\'remove_position_pos_853ed8b2017c165ae15f284e53c4119ef7d5d39055b2ffc15ef2d305efbb5f18\']',
            )
            .innerText()) == 'Remove'
    ) {
        const locator = await page.locator(
            '[id=\'remove_position_pos_853ed8b2017c165ae15f284e53c4119ef7d5d39055b2ffc15ef2d305efbb5f18\']',
        );
        await locator.click();
        // enter amount usdc
        await page.locator('[id=\'range_B_qty\']').fill('50');
        // click on confirm
        await page.locator('[id=\'submit_range_position_button\']').click();
        await page.locator('[id=\'set_skip_confirmation_button\']').click();
    } else {
        // fail test add does not exist
        const locator = await page.locator(
            '[id=\'remove_position_pos_853ed8b2017c165ae15f284e53c4119ef7d5d39055b2ffc15ef2d305efbb5f18\']',
        );
        const text = await locator.innerText();
        expect(text).toContain('Add');
    }
    return page;
}

// click reverse button swap page
export async function clickReverseTokenSwap(page: Page) {
    await page.getByLabel('Reverse tokens').click();
    return page;
}

// click on deposit
export async function clickSettingsSwap(page: Page) {
    await page.locator('[id=\'settings_button\']').click();
    return page;
}

// click on submit swap settings
export async function clickSubmitSlippage(page: Page) {
    await page.locator('[id=\'update_settings_button\']').click();
    return page;
}

// click on Confirm swap
export async function clickConfirmSwap(page: Page) {
    await page.locator('[id=\'confirm_swap_button\']').click();
    return page;
}

// click on submit swap
export async function clickSubmitSwap(page: Page) {
    await page.locator('[id=\'set_skip_confirmation_button\']').click();
    return page;
}

// ---------------------------------------assert-----------------------------------

// assert account page
export async function assertAccountPage(page: Page) {
    const locator = await page.getByRole('link', { name: 'Account' });
    await expect(locator).toBeEnabled();
    return page;
}

// assert wallet balances
export async function assertWalletBalances(page: Page) {
    const locator = await page.locator('[id=\'wallet_balances_tab_clickable\']');
    await expect(locator).toBeEnabled();
    return page;
}

// assert exchange balances
export async function assertExchangeBalances(page: Page) {
    const locator = await page.locator(
        '[id=\'exchange_balances_tab_clickable\']',
    );
    await expect(locator).toBeEnabled();
    return page;
}

// assert Liq tab
export async function assertLiquidityTab(page: Page) {
    const locator = await page.locator('[id=\'liquidity_tab_clickable\']');
    await expect(locator).toBeEnabled();
    return page;
}

// assert Limit tab
export async function assertLimitTab(page: Page) {
    const locator = await page.locator('[id=\'limits_tab_clickable\']');
    await expect(locator).toBeEnabled();
    return page;
}

// assert Transactions tab
export async function assertTransactionsTab(page: Page) {
    const locator = await page.locator('[id=\'transactions_tab_clickable\']');
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
    const locator = await page.locator(
        'xpath=//*[@id="Modal_Global"]/div/div/section/div/footer/div/button/div[2]',
    );
    // Wait until the text contains "Transaction Confirmed"
    await page.waitForSelector('text=Transaction Confirmed');

    // Get the updated text
    const text = await locator.innerText();

    // Check if the updated text contains "Transaction Confirmed"
    expect(text).toContain('Transaction Confirmed');
    return page;
}

// ---------------------------------------fill-----------------------------------

// fill in address on transfer tab
export async function fillTransferTab(page: Page) {
    await page
        .locator(
            '[id=\'exchange-balance-transfer-address-exchange-balance-transfer-quantity\']',
        )
        .fill('0x849C8e8Ee487424475D9e8f44244275599790B16');
    return page;
}

// fill in address on withdraw tab
export async function fillWithdrawTab(page: Page) {
    await page
        .locator(
            '[id=\'exchange-balance-withdraw-address-exchange-balance-transfer-quantity\']',
        )
        .fill('0x849C8e8Ee487424475D9e8f44244275599790B16');
    return page;
}

// fill 5 usdc account transfer/withdraw
export async function fillTransferUSDC(page: Page) {
    await page.locator('[id=\'exchangeBalance_qty\']').fill('5');
    return page;
}

// fill 10 usdc on swap page
export async function fillSwapPageUSDC(page: Page) {
    await page.locator('[id=\'swap_sell_qty\']').fill('10');
    return page;
}

// fill slippage tolerance swap settings
export async function fillSwapPageSlippage(page: Page) {
    await page.locator('[id=\'slippage_tolerance_input_field\']').fill('0.2');
    return page;
}

// ---------------------------------------confirm-----------------------------------

// fill slippage tolerance swap settings
export async function confirmMeta(page: Page) {
    await clickmmask('page-container-footer-next', page);
    // await clickmmask('page-container-footer-cancel', ppp);
    console.log('clicked');
    return page;
}
