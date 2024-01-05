import { Page } from "@playwright/test";
import { BasePage } from "./base_page";
import { expect } from "playwright/test";

export default class HomePage extends BasePage {


    constructor(public page: Page) {
        super(page);
    }

    public async homepage_tradepair() {
        return await this.page.locator(
            "root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container > section > section > div:nth-child(2) > div.Container__FlexContainer-sc-1b686b3-0.Home__TopPoolContainer-sc-10xhhpp-22.eILTRa.kEDAKB > div.Container__FlexContainer-sc-1b686b3-0.Home__HomeContent-sc-10xhhpp-1.hGrThG.eaLqRW > a:nth-child(2) > div"
        ).textContent();
    }

    public async click_trade_btn() {
        await this.page.locator(
            "[id='trade_now_btn_in_hero']"
        ).click();
    }

    public async click_homepage_tradepair() {
        await this.page.locator(
            "root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container > section > section > div:nth-child(2) > div.Container__FlexContainer-sc-1b686b3-0.Home__TopPoolContainer-sc-10xhhpp-22.eILTRa.kEDAKB > div.Container__FlexContainer-sc-1b686b3-0.Home__HomeContent-sc-10xhhpp-1.hGrThG.eaLqRW > a:nth-child(2) > div"
        ).click();
    }

    public async assert_tradepair(value: string) {
        // compare the trade paris are the same on the homepage and the trade page
        await expect(this.page.locator(
            "root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container > section > section > div:nth-child(2) > div.Container__FlexContainer-sc-1b686b3-0.Home__TopPoolContainer-sc-10xhhpp-22.eILTRa.kEDAKB > div.Container__FlexContainer-sc-1b686b3-0.Home__HomeContent-sc-10xhhpp-1.hGrThG.eaLqRW > a:nth-child(2) > div"
        )).toBe(value);
    }

    public async assert_tradepage() {
        await expect(this.page.locator(
            "#primary_navigation > a.Header__NavigationLink-sc-r62nyn-6.gwCeHz.active"
        )).toBeTruthy();
    }

    public async assert_total_value() {
        await expect(this.page.locator(
            "//html/body/div[1]/div[1]/section/section/div[2]/div[2]/div[2]/div[1]/div"
        )).toBe("Total Value Locked");
    }

    public async assert_total_volume() {
        await expect(this.page.locator(
            "//html/body/div[1]/div[1]/section/section/div[2]/div[2]/div[2]/div[2]/div"
        )).toBe("Total Volume");
    }

    public async assert_total_fees() {
        await expect(this.page.locator(
            "//html/body/div[1]/div[1]/section/section/div[2]/div[2]/div[2]/div[3]/div"
        )).toBe("Total Fees");
    }

}