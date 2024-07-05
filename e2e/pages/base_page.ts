/* eslint-disable quotes */
/* eslint-disable camelcase */
import { type Page } from 'playwright/test';
import { locators } from './base_page_locators';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto(locators.tradepage);
    }

    async gotoChat() {
        await this.page.goto(locators.chatLink);
    }
    // id needed
    async home_btn() {
        await this.page.getByLabel('Home').click();
    }

    public async click_trade_btn() {
        await this.page.locator(locators.tradeNow).click();
    }
    // id needed
    public async click_swap_page() {
        await this.page
            .getByTestId('page-header')
            .getByRole('link', { name: 'Swap' })
            .click();
    }
}
