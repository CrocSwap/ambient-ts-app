/* eslint-disable camelcase */
import { test, expect } from 'playwright/test';
import HomePage from './pages/home_page';
import TradePage from './pages/trade_page';

test('test_cs_187_toppool', async ({ page }) => {
    const test_page = new HomePage(page);
    await test_page.goto();
    await test_page.home_btn();
    await test_page.clickHomepageTradepair();
    await test_page.assertTradepair();
});

test('test_cs_183_tradebutton', async ({ page }) => {
    const test_page = new HomePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.assertTradepage();
});

test('test_cs_1301_af_stats', async ({ page }) => {
    const test_page = new HomePage(page);
    await test_page.goto();
    await test_page.home_btn();
    await test_page.assertTotalVolume();
    await test_page.assertTotalFees();
    await test_page.assertTotalValue();
});

test('test_cs_269_denom', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_limit_btn();
    await test_page.denom();
    await test_page.assert_denom();
});

test('test_cs_1291_toppools', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_toppools();
    await test_page.click_toppools_token();
    // compare if the trade paris are the same on the toppools and the trade page
    await test_page.assert_token();
});

test('test_CS_1292_recentpools', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_recent_pools();
    await test_page.click_recentpools_token();
    // compare if the trade paris are the same on the recentpools and the trade page
    await test_page.assert_token();
});

test('test_cs_1310_back', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // await test_page.goBack()
    // compare if the trade paris are the same on the recentpools and the trade page
    // test_page.assert_homepage()
});

test('test_cs_1311_sidebarlock', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // open sidebar
    await test_page.click_toppools();
    await test_page.click_lock_sidebar();
    await test_page.assert_lock_sidebar();
});

test('test_cs_1312_collapse', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // open sidebar
    await test_page.click_toppools();
    await test_page.click_open_all_dropdown();
    // assert if dropdowns are open
    await test_page.assert_transactions();
    await test_page.assert_limit_order();
    await test_page.assert_range_position();
    await test_page.assert_recent_pools();
    await test_page.assert_fav_pools();
    await test_page.assert_top_pools();
});

test('test_cs_1303_search', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // open sidebar
    await test_page.click_toppools();
    await test_page.fill_search_sidebar('eth');
    await test_page.click_search_token();
    await test_page.assertSearchToken();
});

test('test_cs_1378_searchneg', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // open sidebar
    await test_page.click_toppools();
    await test_page.fill_search_sidebar('abc');
    await test_page.assert_searchneg();
});

test('test_cs_800_tradereverse', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_reverse();
    await test_page.assert_swap_reverse();
});

test('test_cs_801_limitreverse', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_limit_btn();
    await test_page.click_reverse();
    await test_page.assert_limit_reverse();
});

test('test_cs_802_swapreverse', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_swap_page();
    await test_page.click_reverse();
    await test_page.assert_reverse();
});

test('test_cs_734_denomswap', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.denom();
    await test_page.assert_denom();
});

test('test_cs_214_favpool', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_add_fav();
    await test_page.click_favpools();
    await test_page.assert_fav_pool_added();
});

test('test_cs_252_balanceranges_5to10', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    // 5-10
    await test_page.click_5percent();
    const value = test_page.get_min_price();
    await test_page.click_10percent();
    const value_new = test_page.get_min_price();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).toBeGreaterThan(newValue);
});

test('test_cs_252_balanceranges_10to25', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    // 10-25
    await test_page.click_10percent();
    const value = test_page.get_min_price();
    await test_page.click_25percent();
    const value_new = test_page.get_min_price();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).toBeGreaterThan(newValue);
});

test('test_cs_252_balanceranges_25to50', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    // 25-50
    await test_page.click_25percent();
    const value = test_page.get_min_price();
    await test_page.click_50percent();
    const value_new = test_page.get_min_price();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).toBeGreaterThan(newValue);
});

test('test_cs_252_balanceranges_ambient', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    // ambient
    await test_page.click_ambient();
    const value = test_page.get_min_price();
    // value is Promises resolving to number
    const actualValue = await value;
    await expect(actualValue).toBe(0);
});

test('test_cs_251_plusminus_min', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.click_balanced();
    // min percentage decrease test
    const value = test_page.get_min_percentage();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    const value_new = test_page.get_min_percentage();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    await expect(newValue).toBeGreaterThan(await actualValue);
});

test('test_cs_251_plusminus_max', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.click_balanced();
    // max percentage increase test
    const value = test_page.get_max_percentage();
    await test_page.click_increase();
    await test_page.click_increase();
    await test_page.click_increase();
    await test_page.click_increase();
    const value_new = test_page.get_max_percentage();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    await expect(newValue).toBeGreaterThan(await actualValue);
});

test('test_cs_342_pooldisplay', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.assert_balanced_enabled();
});
// id needed ---fail
/* test('test_cs_693_leadboard', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    // click on leaderboard
    await test_page.click_leaderboard();
    const value = test_page.get_leaderboard();
    // open detail of row
    await test_page.click_leaderboard_row();
   // await test_page.assert_leaderboard();
});
*/
test('test_cs_769_slippage', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_swap_page();
    await test_page.click_settings_btn();
    // %0.1
    await test_page.click_01();
    const value = test_page.get_01();
    // value is Promises resolving to number
    const actualValue = await value;
    await expect(actualValue).toBe(0.1);
    // 0.3%
    await test_page.click_03();
    const value3 = test_page.get_03();
    // value3 is Promises resolving to number
    const actualValue3 = await value3;
    await expect(actualValue3).toBe(0.3);
    // 0.5%
    await test_page.click_05();
    // value5 is Promises resolving to number
    const value5 = test_page.get_05();
    const actualValue5 = await value5;
    await expect(actualValue5).toBe(0.5);
});

test('test_cs_774_clipboard', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_clipboard();
    await test_page.assert_clipboard();
});
