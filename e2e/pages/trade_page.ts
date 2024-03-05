/* eslint-disable camelcase */
/* eslint-disable quotes */
import { Page, expect } from 'playwright/test';
import { BasePage } from './base_page';

export default class TradePage extends BasePage {
    constructor(public page: Page) {
        super(page);
    }
    // ----------------------------------------------------------click ----------------------------------------------
    public async click_limit_btn() {
        await this.page.locator("[id='link_to_limit_module']").click();
    }

    public async click_pool_btn() {
        await this.page.locator("[id='link_to_pool_module']").click();
    }

    public async click_lock_sidebar() {
        await this.page.locator("[id='sidebar_is_unlocked_clickable']").click();
    }

    public async click_toppools() {
        await this.page.locator("[id='sidebar_header_top_pools']").click();
    }

    public async click_recent_pools() {
        await this.page.locator("[id='sidebar_header_recent_pools']").click();
    }

    public async click_toppools_token() {
        await this.page
            .locator(
                "xpath=//*[@id='root']/div[1]/section/div/div/div/div[2]/div[1]/div[2]/div/div[2]/a[1]/div[1]",
            )
            .click();
    }

    public async click_recentpools_token() {
        await this.page
            .locator(
                "xpath=//*[@id='root']/div[1]/section/div/div/div/div[2]/div[3]/div[2]/div/div[2]/a[1]/div[1]",
            )
            .click();
    }

    public async click_open_all_dropdown() {
        await this.page.locator("[id='sidebar_collapse_all_button']").click();
    }

    public async click_search_token() {
        await this.page.locator('p').filter({ hasText: 'ETH / WBTC' }).click();
    }

    public async click_reverse_arrow() {
        // waiting for ID
        await this.page.getByLabel('Reverse tokens').click();
    }

    public async click_reverse() {
        await this.page.getByLabel('Reverse tokens').click();
    }

    public async click_add_fav() {
        await this.page.getByLabel('Add pool from favorites').click();
    }

    public async click_favpools() {
        await this.page.locator("[id='sidebar_header_favorite_pools']").click();
    }

    public async click_5percent() {
        await this.page.locator("[id='range_width_preset_5%']").click();
    }

    public async click_10percent() {
        await this.page.locator("[id='range_width_preset_10%']").click();
    }

    public async click_25percent() {
        await this.page.locator("[id='range_width_preset_25%']").click();
    }

    public async click_50percent() {
        await this.page.locator("[id='range_width_preset_50%']").click();
    }

    public async click_ambient() {
        await this.page.locator("[id='range_width_preset_Ambient']").click();
    }

    public async click_balanced() {
        await this.page.locator("[id='advanced_repositionswitch']").click();
    }

    public async click_decrease() {
        await this.page.locator("[id='decrease_min_price_button']").click();
    }

    public async click_increase() {
        await this.page.locator("[id='increase_max_price_button']").click();
    }

    public async click_leaderboard() {
        await this.page.locator("[id='leaderboard_tab_clickable']").click();
    }

    public async click_leaderboard_row() {
        await this.page.locator(
            '//html/body/div[1]/div[1]/section/section/div[1]/div[2]/div[2]/div/div/div/div/div/div/div[2]/div[2]/div[5]/p',
        );
    }

    public async click_settings_btn() {
        await this.page.locator("[id='settings_button']").click();
    }

    public async click_01() {
        await this.page.locator("[id='slippage-preset-button-0.1%']").click();
    }

    public async click_03() {
        await this.page.locator("[id='slippage-preset-button-0.3%']").click();
    }

    public async click_05() {
        await this.page.locator("[id='slippage-preset-button-0.5%']").click();
    }

    public async click_clipboard() {
        await this.page.locator("[id='trade_chart_save_image']").click();
    }
    // ---------------------------------------------------get ----------------------------------------------------------
    get_token_name() {
        return this.page.textContent("[id='trade_header_token_pair']");
    }

    get_toppools_token() {
        return this.page.textContent(
            '#root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container-trade > section > div > div > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__ContentContainer-sc-1wecv3f-1.ktsSty.bxuVdV > div:nth-child(1) > div:nth-child(2) > div > div.Sidebar__ItemsContainer-sc-1wecv3f-7.kxjylf > a:nth-child(2) > div:nth-child(1)',
        );
    }

    get_recentpools_token() {
        return this.page
            .locator(
                '#root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container-trade > section > div > div > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__ContentContainer-sc-1wecv3f-1.ktsSty.bxuVdV > div:nth-child(3) > div:nth-child(2) > div > div.Sidebar__ItemsContainer-sc-1wecv3f-7.kxjylf > a:nth-child(1) > div:nth-child(1)',
            )
            .textContent();
    }

    async get_min_price(): Promise<number> {
        const priceElement = await this.page.locator(
            "[id='min_price_readable']",
        );
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
        const priceElement = await this.page.locator(
            "[id='min_price_of_range_advanced']",
        );
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
        const priceElement = await this.page.locator(
            "[id='max_price_of_range_advanced']",
        );
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

    async get_leaderboard(): Promise<number> {
        const priceElement = await this.page.locator(
            "xpath=//*[@id='root']/div[1]/section/section/div[1]/div[2]/div[2]/div/div/div/div/div/div/div[2]/div[1]/div[5]",
        );
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
        const priceElement = await this.page.locator(
            "[id='slippage-preset-button-0.1%']",
        );
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
        const priceElement = await this.page.locator(
            "[id='slippage-preset-button-0.3%']",
        );
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
        const priceElement = await this.page.locator(
            "[id='slippage-preset-button-0.5%']",
        );
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
        const token = this.page.locator(
            "[id='trade_chart_header_token_pair_symbols']",
        );
        await expect(token).toHaveText('ETH / USDC');
    }

    public async assert_leaderboard(value: Promise<string | null>) {
        const priceElement = await this.page.locator(
            '//html/body/div[1]/div[1]/section/section/div[1]/div[2]/div[2]/div/div/div/div/div/div/div[2]/div[2]/div[5]/p',
        );
        const content = await priceElement.textContent();

        // expect(this.page.textContent(content))
        //     .toBe(value);
    }

    public async assert_homepage() {
        await expect(
            this.page.locator("[id='trade_now_btn_in_hero']"),
        ).toBeTruthy();
    }

    public async assert_lock_sidebar() {
        await expect(this.page.locator("[id='sidebar_is_locked_clickable']"))
            .toBeTruthy;
    }

    public async assert_transactions() {
        await expect(
            this.page.locator(
                '#sidebar_header_transactions > svg.Sidebar__ArrowIcon-sc-1wecv3f-17.jTcnZQ',
            ),
        ).toBeTruthy();
    }

    public async assert_limit_order() {
        await expect(
            this.page.locator("[id='sidebar_header_limit_orders']"),
        ).toBeTruthy();
    }

    public async assert_range_position() {
        await expect(
            this.page.locator("[id='sidebar_header_liquidity_positions']"),
        ).toBeTruthy();
    }

    public async assert_recent_pools() {
        await expect(
            this.page.locator("[id='sidebar_header_recent_pools']"),
        ).toBeTruthy();
    }

    public async assert_fav_pools() {
        await expect(
            this.page.locator("[id='sidebar_header_favorite_pools']"),
        ).toBeTruthy();
    }

    public async assert_top_pools() {
        await expect(
            this.page.locator("[id='sidebar_header_top_pools']"),
        ).toBeTruthy();
    }

    public async assertSearchToken() {
        const denom = this.page.locator("[id='trade_header_token_pair']");
        await expect(denom).toHaveText('ETH / WBTC');
    }

    public async assert_searchneg() {
        const neg = this.page.getByText('No Pools Found');
        await expect(neg).toHaveText('No Pools Found');
        // id to be added
    }

    public async assert_swap_reverse() {
        const reverseSawp = this.page.locator("[id='swap_sell_token_selector']");
        await expect(reverseSawp).toHaveText('USDC');
    }

    public async assert_limit_reverse() {
        const reverseLimit = this.page.locator(
            "[id='limit_sell_token_selector']",
        );
        await expect(reverseLimit).toHaveText('USDC');
    }

    public async assert_reverse() {
        const denom = this.page.locator("[id='swap_sell_token_selector']");
        await expect(denom).toHaveText('USDC');
    }

    public async assert_denom() {
        const denom = this.page.locator("[id='trade_header_token_pair']");
        await expect(denom).toHaveText('USDC / ETH');
    }

    public async assert_fav_pool_added() {
        const totalVolume = this.page.locator(
            "xpath=//*[@id='root']/div[1]/section/div/div/div/div[2]/div[2]/div[2]/div/div[2]/a[1]/div[1]",
        );
        await expect(totalVolume).toHaveText('ETH / USDC');
    }

    public async assert_balanced_enabled() {
        await expect(
            this.page.locator("[id='advanced_repositionswitch']"),
        ).toBeTruthy();
    }

    public async assert_clipboard() {
        const value = this.page.locator(
            "xpath=//*[@id='root']/div[4]/div/div/div/div[2]",
        );
        const actualValue = await value;
        await expect(actualValue).toHaveText('Chart image copied to clipboard');
    }
    // -----------------------------------------------other fun--------------------------------------------------------
    public async denom() {
        await this.page.locator("[id='trade_header_token_pair']").click();
    }

    public async fill_search_sidebar(value: string) {
        await this.page.getByPlaceholder('Search...').click();
        await this.page.getByPlaceholder('Search...').fill(value);
        await this.page.getByPlaceholder('Search...').press('Enter');
    }
}
