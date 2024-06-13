import { test } from 'playwright/test';
import HomePage from './pages/home_page';
import TradePage from './pages/trade_page';

// test('test_cs_187_toppool', async ({ page }) => {
//     const testPage = new HomePage(page);
//     await testPage.goto();
//     await testPage.home_btn();
//     // const value = testPage.getHomepageTradepair();
//     await testPage.clickHomepageTradepair();
//     await testPage.assertTradepair('ETH / USDC');
// });

test('test_cs_183_tradebutton', async ({ page }) => {
    const testPage = new HomePage(page);
    await testPage.goto();
    await testPage.home_btn();
    // Click on trade button on homepage
    await testPage.click_trade_btn();
    await testPage.assertTradepage();
});

// test('test_cs_1301_af_stats', async ({ page }) => {
//     const testPage = new HomePage(page);
//     await testPage.goto();
//     await testPage.home_btn();
//     await testPage.assertTotalVolume();
//     await testPage.assertTotalFees();
//     await testPage.assertTotalValue();
// });

// test('test_cs_269_denom', async ({ page }) => {
//     const testPage = new TradePage(page);
//     await testPage.goto();
//     await testPage.home_btn();
//     // Click on trade button on homepage
//     await testPage.click_trade_btn();
//     await testPage.click_limit_btn();
//     const value = testPage.get_token_name();
//     await testPage.denom();
//     testPage.assert_token(value);
// });

// test('test_cs_1291_toppools', async ({ page }) => {
//     const testPage = new TradePage(page);
//     await testPage.goto();
//     await testPage.home_btn();
//     // Click on trade button on homepage
//     await testPage.click_trade_btn();
//     await testPage.click_toppools();
//     const value = testPage.get_toppools_token();
//     await testPage.click_toppools_token();
//     // compare if the trade paris are the same on the toppools and the trade page
//     testPage.assert_token(value);
// });

// test('test_CS_1292_recentpools', async ({ page }) => {
//     const testPage = new TradePage(page);
//     await testPage.goto();
//     await testPage.home_btn();
//     // Click on trade button on homepage
//     await testPage.click_trade_btn();
//     await testPage.click_recent_pools();
//     const value = testPage.get_recentpools_token();
//     await testPage.click_recentpools_token();
//     // compare if the trade paris are the same on the recentpools and the trade page
//     testPage.assert_token(value);
// });

test('test_cs_1310_back', async ({ page }) => {
    const testPage = new TradePage(page);
    await testPage.goto();
    await testPage.home_btn();
    // Click on trade button on homepage
    await testPage.click_trade_btn();
    // await testPage.goBack()
    // compare if the trade paris are the same on the recentpools and the trade page
    // testPage.assert_homepage()
});

// test('test_cs_1311_sidebarlock', async ({ page }) => {
//     const testPage = new TradePage(page);
//     await testPage.goto();
//     await testPage.home_btn();
//     // Click on trade button on homepage
//     await testPage.click_trade_btn();
//     // open sidebar
//     await testPage.click_toppools();
//     await testPage.click_lock_sidebar();
//     await testPage.assert_lock_sidebar();
// });

// test('test_cs_1312_collapse', async ({ page }) => {
//     const testPage = new TradePage(page);
//     await testPage.goto();
//     await testPage.home_btn();
//     // Click on trade button on homepage
//     await testPage.click_trade_btn();
//     // open sidebar
//     await testPage.click_toppools();
//     await testPage.click_open_all_dropdown();
//     // assert if dropdowns are open
//     await testPage.assert_transactions();
//     await testPage.assert_limit_order();
//     await testPage.assert_range_position();
//     await testPage.assert_recent_pools();
//     await testPage.assert_fav_pools();
//     await testPage.assert_top_pools();
// });

// test('test_cs_1303_search', async ({ page }) => {
//     const testPage = new TradePage(page);
//     await testPage.goto();
//     await testPage.home_btn();
//     // Click on trade button on homepage
//     await testPage.click_trade_btn();
//     // open sidebar
//     await testPage.click_toppools();
//     await testPage.fill_search_sidebar('eth');
//     const value = testPage.get_token_name();
//     await testPage.click_search_token();
//     testPage.assert_token(value);
// });
