import { Page, expect } from 'playwright/test';
import { BasePage } from './base_page';

export default class HomePage extends BasePage {
    constructor(public page: Page) {
        super(page);
    }

    public async getHomepageTradepair() {
        return await this.page
            .locator(
                'root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container > section > section > div:nth-child(2) > div.Container__FlexContainer-sc-1b686b3-0.Home__TopPoolContainer-sc-10xhhpp-22.eILTRa.kEDAKB > div.Container__FlexContainer-sc-1b686b3-0.Home__HomeContent-sc-10xhhpp-1.hGrThG.eaLqRW > a:nth-child(2) > div',
            )
            .textContent();
    }

    public async clickTradeButton() {
        // eslint-disable-next-line quotes
        await this.page.locator("[id='trade_now_btn_in_hero']").click();
    }

    public async clickHomepageTradepair() {
        await this.page
            .locator(
                'root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container > section > section > div:nth-child(2) > div.Container__FlexContainer-sc-1b686b3-0.Home__TopPoolContainer-sc-10xhhpp-22.eILTRa.kEDAKB > div.Container__FlexContainer-sc-1b686b3-0.Home__HomeContent-sc-10xhhpp-1.hGrThG.eaLqRW > a:nth-child(2) > div',
            )
            .click();
    }

    public async assertTradepair(value: string) {
        // compare the trade paris are the same on the homepage and the trade page
        expect(
            this.page.locator(
                'root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container > section > section > div:nth-child(2) > div.Container__FlexContainer-sc-1b686b3-0.Home__TopPoolContainer-sc-10xhhpp-22.eILTRa.kEDAKB > div.Container__FlexContainer-sc-1b686b3-0.Home__HomeContent-sc-10xhhpp-1.hGrThG.eaLqRW > a:nth-child(2) > div',
            ),
        ).toBe(value);
    }

    public async assertTradepage() {
        expect(
            this.page.locator(
                '#primary_navigation > a.Header__NavigationLink-sc-r62nyn-6.gwCeHz.active',
            ),
        ).toBeTruthy();
    }

    public async assertTotalValue() {
        expect(
            this.page.locator(
                '//html/body/div[1]/div[1]/section/section/div[2]/div[2]/div[2]/div[1]/div',
            ),
        ).toBe('Total Value Locked');
    }

    public async assertTotalVolume() {
        expect(
            this.page.locator(
                '//html/body/div[1]/div[1]/section/section/div[2]/div[2]/div[2]/div[2]/div',
            ),
        ).toBe('Total Volume');
    }

    public async assertTotalFees() {
        expect(
            this.page.locator(
                '//html/body/div[1]/div[1]/section/section/div[2]/div[2]/div[2]/div[3]/div',
            ),
        ).toBe('Total Fees');
    }
}
