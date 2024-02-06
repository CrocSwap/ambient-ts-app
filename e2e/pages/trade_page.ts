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
        await this.page
            .locator(
                '#root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container-trade > section > div > div > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__ContentContainer-sc-1wecv3f-1.ktsSty.bxuVdV > div:nth-child(1) > div:nth-child(2) > div > div.Sidebar__ItemsContainer-sc-1wecv3f-7.kxjylf > a:nth-child(2) > div:nth-child(1)',
            )
            .click();
    }

    public async click_recent_pools() {
        await this.page.locator("[id='sidebar_header_recent_pools']").click();
    }

    public async click_toppools_token() {
        await this.page.locator("[id='sidebar_header_top_pools']").click();
    }

    public async click_recentpools_token() {
        await this.page
            .locator(
                '#root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container-trade > section > div > div > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__ContentContainer-sc-1wecv3f-1.ktsSty.bxuVdV > div:nth-child(3) > div:nth-child(2) > div > div.Sidebar__ItemsContainer-sc-1wecv3f-7.kxjylf > a > div:nth-child(1)',
            )
            .click();
    }

    public async click_open_all_dropdown() {
        await this.page.locator("[id='sidebar_collapse_all_button']").click();
    }

    public async click_search_token() {
        await this.page
            .locator(
                '#root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container-trade > section > div > div > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__SearchResultsContainer-sc-1wecv3f-19.eECDjm.jEAMxt > div:nth-child(2) > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__ResultsContainer-sc-1wecv3f-20.ktsSty.ifRnGR > div:nth-child(3)',
            )
            .click();
    }
    // ---------------------------------------------------get ----------------------------------------------------------
    get_token_name() {
        return this.page
            .locator("[id='trade_header_token_pair']")
            .textContent();
    }

    get_toppools_token() {
        return this.page
            .locator(
                '#root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container-trade > section > div > div > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__ContentContainer-sc-1wecv3f-1.ktsSty.bxuVdV > div:nth-child(1) > div:nth-child(2) > div > div.Sidebar__ItemsContainer-sc-1wecv3f-7.kxjylf > a:nth-child(2) > div:nth-child(1)',
            )
            .textContent();
    }

    get_recentpools_token() {
        return this.page
            .locator(
                '#root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container-trade > section > div > div > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__ContentContainer-sc-1wecv3f-1.ktsSty.bxuVdV > div:nth-child(3) > div:nth-child(2) > div > div.Sidebar__ItemsContainer-sc-1wecv3f-7.kxjylf > a > div:nth-child(1)',
            )
            .textContent();
    }

    // -------------------------------------------------assert --------------------------------------------------------
    public async assert_token(value: Promise<string | null>) {
        // compare the trade paris are the same on the homepage and the trade page
        await expect(
            this.page.locator(
                'root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container > section > section > div:nth-child(2) > div.Container__FlexContainer-sc-1b686b3-0.Home__TopPoolContainer-sc-10xhhpp-22.eILTRa.kEDAKB > div.Container__FlexContainer-sc-1b686b3-0.Home__HomeContent-sc-10xhhpp-1.hGrThG.eaLqRW > a:nth-child(2) > div',
            ),
        ).toBe(value);
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
        ).toHaveJSProperty('open', '');
    }

    public async assert_limit_order() {
        await expect(
            this.page.locator("[id='sidebar_header_limit_orders']"),
        ).toHaveJSProperty('open', '');
    }

    public async assert_range_position() {
        await expect(
            this.page.locator("[id='sidebar_header_liquidity_positions']"),
        ).toHaveJSProperty('open', '');
    }

    public async assert_recent_pools() {
        await expect(
            this.page.locator("[id='sidebar_header_recent_pools']"),
        ).toHaveJSProperty('open', '');
    }

    public async assert_fav_pools() {
        await expect(
            this.page.locator("[id='sidebar_header_favorite_pools']"),
        ).toHaveJSProperty('open', '');
    }

    public async assert_top_pools() {
        await expect(
            this.page.locator("[id='sidebar_header_top_pools']"),
        ).toHaveJSProperty('open', '');
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
