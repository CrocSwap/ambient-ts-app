import { test, expect } from '@playwright/test';
import { BasePage } from "./pages/base_page";
import  HomePage  from "./pages/home_page";
import  TradePage  from "./pages/trade_page";


 test('test_cs_187_toppool', async ({ page }) => {

  const test_page = new HomePage(page);
  await test_page.goto();
  await test_page.home_btn();
  const value = test_page.homepage_tradepair();
  await test_page.click_homepage_tradepair();
  await test_page.assert_tradepair("ETH / USDC");  
  
});

 test('test_cs_183_tradebutton', async ({ page }) => {

    const test_page = new HomePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.assert_tradepage();  
    
  });

 test('test_cs_1301_af_stats', async ({ page }) => {

    const test_page = new HomePage(page);
    await test_page.goto();
    await test_page.home_btn();
    await test_page.assert_total_volume();
    await test_page.assert_total_fees();
    await test_page.assert_total_value();  
    
  });  

 test('test_cs_269_denom', async ({ page }) => {

    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();  
    await test_page.click_limit_btn();
    const value = test_page.get_token_name();
    await test_page.denom();
    test_page.assert_token(value)

  });  
  
 test('test_cs_1291_toppools', async ({ page }) => {

    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();  
    await test_page.click_toppools();
    const value = test_page.get_toppools_token();
    await test_page.click_toppools_token();
    // compare if the trade paris are the same on the toppools and the trade page
    test_page.assert_token(value)

  }); 

 test('test_CS_1292_recentpools', async ({ page }) => {

    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();  
    await test_page.click_recent_pools();
    const value = test_page.get_recentpools_token();
    await test_page.click_recentpools_token();
    // compare if the trade paris are the same on the recentpools and the trade page
    test_page.assert_token(value)

  }); 

 test('test_cs_1310_back', async ({ page }) => {

    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn(); 
    //await test_page.goBack()
    // compare if the trade paris are the same on the recentpools and the trade page
    //test_page.assert_homepage()

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
  await test_page.fill_search_sidebar("eth");
  const value = test_page.get_token_name();
  await test_page.click_search_token();
  test_page.assert_token(value)

  }); 
