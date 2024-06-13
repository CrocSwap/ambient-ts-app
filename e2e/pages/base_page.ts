/* eslint-disable quotes */
/* eslint-disable camelcase */
import { type Page } from 'playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto(
            'http://localhost:3000/trade/market/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
        );
    }

    async home_btn() {
        await this.page.getByLabel('Home').click();
    }

    public async click_trade_btn() {
        await this.page.locator("[id='trade_now_btn_in_hero']").click();
    }
}
