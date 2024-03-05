import { Page, expect } from 'playwright/test';
import { BasePage } from './base_page';

export default class HomePage extends BasePage {
    constructor(public page: Page) {
        super(page);
    }

    public async clickTradeButton() {
        // eslint-disable-next-line quotes
        await this.page.locator("[id='trade_now_btn_in_hero']").click();
    }

    public async clickHomepageTradepair() {
        await this.page
            .locator(
                'xpath=//*[@id=\'root\']/div[1]/section/section/div[2]/div[1]/div[2]/a[1]/div/div[1]/div[2]',
            )
            .click();
    }

    public async assertTradepair() {
        // compare the trade paris are the same on the homepage and the trade page
        const token = await this.page.locator(
            '[id=\'trade_chart_header_token_pair_symbols\']',
        );
        const tokentext = await token.textContent();
        await expect(tokentext).toBe('ETH / USDC');
    }

    public async assertTradepage() {
        expect(
            this.page.locator(
                '#primary_navigation > a.Header__NavigationLink-sc-r62nyn-6.gwCeHz.active',
            ),
        ).toBeTruthy();
    }

    public async assertTotalValue() {
        const totalFees = this.page.locator(
            'xpath=//*[@id=\'root\']/div[1]/section/section/div[2]/div[2]/div[2]/div[1]/div',
        );
        await expect(totalFees).toHaveText('Total Value Locked');
    }

    public async assertTotalVolume() {
        const totalVolume = this.page.locator(
            'xpath=//*[@id=\'root\']/div[1]/section/section/div[2]/div[2]/div[2]/div[2]/div',
        );
        await expect(totalVolume).toHaveText('Total Volume');
    }

    public async assertTotalFees() {
        const totalFees = this.page.locator(
            'xpath=//*[@id=\'root\']/div[1]/section/section/div[2]/div[2]/div[2]/div[3]/div',
        );
        await expect(totalFees).toHaveText('Total Fees');
    }
}
