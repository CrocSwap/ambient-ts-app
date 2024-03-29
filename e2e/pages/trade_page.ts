/* eslint-disable camelcase */
/* eslint-disable quotes */
import { Page, expect } from 'playwright/test';
import { BasePage } from './base_page';
import { locators } from './trade_page_locators';

export default class TradePage extends BasePage {
    constructor(public page: Page) {
        super(page);
    }
    // ----------------------------------------------------------click ----------------------------------------------
    public async click_limit_btn() {
        await this.page.locator(locators.clickLimitBtn).click();
    }

    public async click_pool_btn() {
        await this.page.locator(locators.clickPoolBtn).click();
    }

    public async click_lock_sidebar() {
        await this.page.locator(locators.clickLockSidebar).click();
    }

    public async click_toppools() {
        await this.page.locator(locators.clickToppools).click();
    }

    public async click_recent_pools() {
        await this.page.locator(locators.clickRecentPools).click();
    }
    // id needede
    public async click_toppools_token() {
        await this.page.locator(locators.clickToppoolsToken).click();
    }
    // id needed
    public async click_recentpools_token() {
        await this.page.locator(locators.clickRecentpoolsToken).click();
    }

    public async click_open_all_dropdown() {
        await this.page.locator(locators.clickOpenAllDropdown).click();
    }
    // id needed
    public async click_search_token() {
        await this.page.locator('p').filter({ hasText: 'ETH / WBTC' }).click();
    }
    // id needed
    public async click_reverse() {
        await this.page.getByLabel(locators.clickReverseArrow).click();
    }
    // id needed
    public async click_add_fav() {
        await this.page.getByLabel(locators.clickAddFav).click();
    }

    public async click_favpools() {
        await this.page.locator(locators.clickFavpools).click();
    }

    public async click_5percent() {
        await this.page.locator(locators.click5Percent).click();
    }

    public async click_10percent() {
        await this.page.locator(locators.click10Percent).click();
    }

    public async click_25percent() {
        await this.page.locator(locators.click25Percent).click();
    }

    public async click_50percent() {
        await this.page.locator(locators.click50Percent).click();
    }

    public async click_ambient() {
        await this.page.locator(locators.clickAmbient).click();
    }

    public async click_balanced() {
        await this.page.locator(locators.clickBalanced).click();
    }

    public async click_decrease() {
        await this.page.locator(locators.clickDecrease).click();
    }

    public async click_increase() {
        await this.page.locator(locators.clickIncrease).click();
    }

    public async click_leaderboard() {
        await this.page.locator(locators.clickLeaderboard).click();
    }
    // id needed
    public async click_leaderboard_row() {
        await this.page.locator(locators.clickLeaderboardRow);
    }

    public async click_settings_btn() {
        await this.page.locator(locators.clickSettingsBtn).click();
    }

    public async click_01() {
        await this.page.locator(locators.click01).click();
    }

    public async click_03() {
        await this.page.locator(locators.click03).click();
    }

    public async click_05() {
        await this.page.locator(locators.click05).click();
    }

    public async click_clipboard() {
        await this.page.locator(locators.clickClipboard).click();
    }
    // ---------------------------------------------------get ----------------------------------------------------------
    get_token_name() {
        return this.page.textContent(locators.getTokenName);
    }
    // id needed
    get_toppools_token() {
        return this.page.textContent(locators.getToppoolsToken);
    }
    // id needed
    get_recentpools_token() {
        return this.page.locator(locators.getRecentpoolsToken).textContent();
    }

    async get_min_price(): Promise<number> {
        const priceElement = await this.page.locator(locators.getMinPrice);
        const priceText = await priceElement.textContent();

        // Check if priceText is null or empty string and handle accordingly
        if (!priceText) {
            throw new Error('Price not found or empty');
        }

        const cleanedPriceText = priceText.replace(/,/g, ''); // replace comma

        const priceNumber = Number(cleanedPriceText);
        if (isNaN(priceNumber)) {
            throw new Error('Price is not a valid number');
        }

        return priceNumber;
    }

    async get_min_percentage(): Promise<number> {
        const priceElement = await this.page.locator(locators.getMinPercentage);
        const priceText = await priceElement.textContent();

        // Check if priceText is null or empty string and handle accordingly
        if (!priceText) {
            throw new Error('Percentage not found or empty');
        }

        const cleanedPriceText = priceText.replace(/[-%]/g, ''); // replace % and -

        const priceNumber = Number(cleanedPriceText);
        if (isNaN(priceNumber)) {
            throw new Error('Percentage is not a valid number');
        }

        return priceNumber;
    }

    async get_max_percentage(): Promise<number> {
        const priceElement = await this.page.locator(locators.getMaxPercentage);
        const priceText = await priceElement.textContent();

        // Check if priceText is null or empty string and handle accordingly
        if (!priceText) {
            throw new Error('Percentage not found or empty');
        }

        const cleanedPriceText = priceText.replace(/[+%]/g, ''); // replace % and +

        const priceNumber = Number(cleanedPriceText);
        if (isNaN(priceNumber)) {
            throw new Error('Percentage is not a valid number');
        }

        return priceNumber;
    }
    // id needed
    async get_leaderboard(): Promise<number> {
        const priceElement = await this.page.locator(locators.getLeaderboard);
        const priceText = await priceElement.textContent();

        // Check if priceText is null or empty string and handle accordingly
        if (!priceText) {
            throw new Error('Percentage not found or empty');
        }

        const cleanedPriceText = priceText.replace(/[%]/g, ''); // replace %

        const priceNumber = Number(cleanedPriceText);
        if (isNaN(priceNumber)) {
            throw new Error('Percentage is not a valid number');
        }

        return priceNumber;
    }

    async get_01(): Promise<number> {
        const priceElement = await this.page.locator(locators.click01);
        const priceText = await priceElement.textContent();

        // Check if priceText is null or empty string and handle accordingly
        if (!priceText) {
            throw new Error('Percentage not found or empty');
        }

        const cleanedPriceText = priceText.replace(/[%]/g, ''); // replace %

        const priceNumber = Number(cleanedPriceText);
        if (isNaN(priceNumber)) {
            throw new Error('Percentage is not a valid number');
        }

        return priceNumber;
    }

    async get_03(): Promise<number> {
        const priceElement = await this.page.locator(locators.click03);
        const priceText = await priceElement.textContent();

        // Check if priceText is null or empty string and handle accordingly
        if (!priceText) {
            throw new Error('Percentage not found or empty');
        }

        const cleanedPriceText = priceText.replace(/[%]/g, ''); // replace %

        const priceNumber = Number(cleanedPriceText);
        if (isNaN(priceNumber)) {
            throw new Error('Percentage is not a valid number');
        }

        return priceNumber;
    }

    async get_05(): Promise<number> {
        const priceElement = await this.page.locator(locators.click05);
        const priceText = await priceElement.textContent();

        // Check if priceText is null or empty string and handle accordingly
        if (!priceText) {
            throw new Error('Percentage not found or empty');
        }

        const cleanedPriceText = priceText.replace(/[%]/g, ''); // replace %

        const priceNumber = Number(cleanedPriceText);
        if (isNaN(priceNumber)) {
            throw new Error('Percentage is not a valid number');
        }

        return priceNumber;
    }

    // -------------------------------------------------assert --------------------------------------------------------
    public async assert_token() {
        // compare the trade paris are the same on the homepage and the trade page
        const token = this.page.locator(locators.assertToken);
        await expect(token).toHaveText('ETH / USDC');
    }
    // id needed
    /*
    public async assert_leaderboard(value: Promise<string | null>) {
        const priceElement = await this.page.locator(locators.assertLeaderboard);
        const content = await priceElement.textContent();

        //expect(this.page.textContent(content)).toBe(value);
    }
*/
    public async assert_homepage() {
        await expect(this.page.locator(locators.assertHomepage)).toBeTruthy();
    }

    public async assert_lock_sidebar() {
        await expect(this.page.locator(locators.assertLockSidebar)).toBeTruthy;
    }

    public async assert_transactions() {
        await expect(
            this.page.locator(locators.assertTransactions),
        ).toBeTruthy();
    }

    public async assert_limit_order() {
        await expect(this.page.locator(locators.assertLimitOrder)).toBeTruthy();
    }

    public async assert_range_position() {
        await expect(
            this.page.locator(locators.assertRangePosition),
        ).toBeTruthy();
    }

    public async assert_recent_pools() {
        await expect(this.page.locator(locators.clickRecentPools)).toBeTruthy();
    }

    public async assert_fav_pools() {
        await expect(this.page.locator(locators.clickFavpools)).toBeTruthy();
    }

    public async assert_top_pools() {
        await expect(this.page.locator(locators.clickToppools)).toBeTruthy();
    }

    public async assertSearchToken() {
        const denom = this.page.locator(locators.getTokenName);
        await expect(denom).toHaveText('ETH / WBTC');
    }
    // id needed
    public async assert_searchneg() {
        const neg = this.page.getByText('No Pools Found');
        await expect(neg).toHaveText('No Pools Found');
        // id to be added
    }

    public async assert_swap_reverse() {
        const reverseSawp = this.page.locator(locators.assertSwapReverse);
        await expect(reverseSawp).toHaveText('USDC');
    }

    public async assert_limit_reverse() {
        const reverseLimit = this.page.locator(locators.assertLimitReverse);
        await expect(reverseLimit).toHaveText('USDC');
    }

    public async assert_reverse() {
        const denom = this.page.locator(locators.assertSwapReverse);
        await expect(denom).toHaveText('USDC');
    }

    public async assert_denom() {
        const denom = this.page.locator(locators.getTokenName);
        await expect(denom).toHaveText('USDC / ETH');
    }
    // id needed
    public async assert_fav_pool_added() {
        const totalVolume = this.page.locator(locators.assertFavPoolAdded);
        await expect(totalVolume).toHaveText('ETH / USDC');
    }

    public async assert_balanced_enabled() {
        await expect(this.page.locator(locators.clickBalanced)).toBeTruthy();
    }
    // id needed
    public async assert_clipboard() {
        const value = this.page.locator(locators.assertClipboard);
        const actualValue = await value;
        await expect(actualValue).toHaveText('Chart image copied to clipboard');
    }
    // -----------------------------------------------other fun--------------------------------------------------------
    public async denom() {
        await this.page.locator(locators.getTokenName).click();
    }
    // id needed
    public async fill_search_sidebar(value: string) {
        await this.page.getByPlaceholder('Search...').click();
        await this.page.getByPlaceholder('Search...').fill(value);
        await this.page.getByPlaceholder('Search...').press('Enter');
    }
}
