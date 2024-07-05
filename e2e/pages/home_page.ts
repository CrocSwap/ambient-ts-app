import { Page, expect } from 'playwright/test';
import { BasePage } from './base_page';
import { locators } from './home_page_locators';

export default class HomePage extends BasePage {
    constructor(public page: Page) {
        super(page);
    }

    public async clickTradeButton() {
        // eslint-disable-next-line quotes
        await this.page.locator(locators.clickTradeButton).click();
    }

    public async clickHomepageTradepair() {
        await this.page.locator(locators.clickHomepageTradepair).click();
    }

    public async assertTradepair() {
        // compare the trade paris are the same on the homepage and the trade page
        const token = await this.page.locator(locators.tokenPairTradePage);
        const tokentext = await token.textContent();
        await expect(tokentext).toBe('ETH / WBTC');
    }

    public async assertTradepage() {
        expect(this.page.locator(locators.assertTradepage)).toBeTruthy();
    }

    public async assertTotalValue() {
        const totalValue = this.page.locator(locators.totalValue);
        await expect(totalValue).toHaveText('Total Value Locked');
    }

    public async assertTotalVolume() {
        const totalVolume = this.page.locator(locators.totalVolume);
        await expect(totalVolume).toHaveText('Total Volume');
    }

    public async assertTotalFees() {
        const totalFees = this.page.locator(locators.totalFees);
        await expect(totalFees).toHaveText('Total Fees');
    }
}
