/* eslint-disable camelcase */
/* eslint-disable quotes */
import { Page, expect } from 'playwright/test';
import { BasePage } from './base_page';
import { locators } from './trade_page_locators';

export default class TradePage extends BasePage {
    get_miget_Min_Price_Denomn_price() {
        throw new Error('Method not implemented.');
    }
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
        await this.page.locator(locators.assertToken).click();
    }

    public async click_recent_pools() {
        await this.page.locator(locators.assertToken).click();
        await this.page.locator(locators.clickRecentPairs).click();
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
        await this.page.locator('p').filter({ hasText: 'ETH / CRV' }).click();
    }
    // id needed
    public async click_reverse() {
        await this.page.getByLabel(locators.clickReverseArrow).click();
    }
    // id needed
    public async click_add_fav() {
        await this.page
            .locator('div')
            .filter({ hasText: /^ETH \/ USDC3/ })
            .getByLabel('Add pool from favorites')
            .click();
        //        const row = await this.page.locator(`text=${"ETH / USDC"}`).locator('xpath=ancestor::tr');
        //        await this.page.getByLabel(locators.clickAddFav).click();
    }

    public async click_favpools() {
        // await this.page.locator(locators.clickFavpools).click();
        await this.page
            .getByRole('button', { name: 'Favorites', exact: true })
            .click();
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

    public async click_Full_Screen() {
        await this.page.locator(locators.fullScreenBtn).click();
    }

    public async click_USD_Toggle() {
        await this.page.locator(locators.usdPriceBtn).click();
    }

    public async click_Transaction_Row() {
        await this.page.locator(locators.transactionRow).click();
    }

    public async click_ESC() {
        await this.page.keyboard.press('Escape');
    }

    public async click_Open_Chat() {
        await this.page.locator(locators.chatOpenTrollbox).click();
    }

    public async click_Last_Button() {
        await this.page.locator(locators.chatLastButton).click();
    }

    public async click_Chat_Room_Dropdown() {
        await this.page.locator(locators.chatRoomDropdown).click();
    }
    // id needed
    public async click_Select_Chat_Room() {
        await this.page.waitForSelector(
            'div._dropdown_item_1p5ax_277[data-value="ETH / USDC"]',
            { timeout: 60000 },
        );
        const elementHandle = await this.page.$(
            'div._dropdown_item_1p5ax_277[data-value="ETH / USDC"]',
        );

        if (!elementHandle) {
            throw new Error('Element not found.');
        }

        await elementHandle.click();
        // await this.page.getByText('ETH / WBTC').click();
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
        try {
            // Wait for the price element to be loaded
            const priceElement = await this.page.waitForSelector(
                locators.getMinPrice,
            );

            // Poll the inner text of the price element until it changes from the placeholder value
            let priceText: string | null = null;
            while (priceText === null || priceText.trim() === '...') {
                priceText = await priceElement.innerText();
                console.log('Price text:', priceText); // Log the price text during polling
            }

            // Check if priceText is null or empty string
            if (!priceText) {
                throw new Error('Price not found or empty');
            }

            // Clean the price text: remove non-numeric characters and replace commas with dots
            const cleanedPriceText = priceText
                .replace(/[^\d.,]+/g, '')
                .replace(/,/g, '.');

            // Parse the cleaned price text into a floating-point number
            const priceNumber = parseFloat(cleanedPriceText);

            // Check if the parsed value is a valid number
            if (isNaN(priceNumber)) {
                throw new Error('Price is not a valid number');
            }

            return priceNumber;
        } catch (error) {
            // Handle errors such as element not found
            throw new Error(`Failed to get min price: ${error}`);
        }
    }

    async get_Min_Price_Denom(): Promise<number> {
        const priceElement = await this.page.locator(locators.getMinPrice);
        const priceText = await priceElement.textContent();

        // Check if priceText is null or empty string
        if (!priceText) {
            throw new Error('Price not found or empty');
        }
        // replace comma
        const cleanedPriceText = priceText.replace(/,/g, '');

        const priceNumber = parseFloat(cleanedPriceText);

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
        await expect(denom).toHaveText('CRV / ETH');
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
        const tokenFav = this.page.getByRole('link', { name: /ETH \/ USDC/ });
        await expect(tokenFav).toHaveText(/ETH \/ USDC/);
    }

    public async assert_balanced_enabled() {
        await expect(this.page.locator(locators.clickBalanced)).toBeTruthy();
    }
    // id needed
    public async assert_clipboard() {
        const clipboardElement = await this.page.waitForSelector(
            locators.assertClipboard,
        );
        const message = await clipboardElement.innerText();
        expect(message).toContain('Chart image copied to clipboard');
    }

    public async assert_Modules_Not_Visible() {
        const value = this.page.locator(locators.swapModuleBtn);
        const actualValue = await value;
        await expect(actualValue).not.toBeVisible();
    }

    public async assert_USD_Toggle() {
        const element = await this.page.locator(locators.usdPrice);
        const textContent = await element.textContent();
        expect(textContent).toContain('USD');
    }

    public async assert_Transaction_Popup() {
        const element = await this.page.locator(locators.transactionPopup);
        // Check if the popup locator is visible
        const isVisible = await element.isVisible();
        expect(isVisible).toBe(true);
    }

    public async assert_Popup() {
        const element = await this.page.locator(locators.transactionPopup);
        // Check if the popup locator is visible
        const isVisible = await element.isVisible();
        expect(isVisible).toBe(false);
    }

    public async assert_Chat_Unable() {
        const element = await this.page.locator(locators.chatBox);
        // Check if the chat is not connected to wallet
        if (!element) {
            throw new Error('Input element with ID "box" not found.');
        }

        // Get the value of the placeholder attribute
        const placeholder = await element.getAttribute('placeholder');

        if (!placeholder) {
            throw new Error(
                'Placeholder attribute not found for the input element.',
            );
        }

        // Check if the placeholder text contains "Please connect wallet to chat"
        expect(placeholder).toContain('Please connect wallet to chat');
    }

    public async assert_Chat_Room() {
        const element = await this.page.$('div[style="flex-grow: 1;"]');

        if (!element) {
            throw new Error('Element with specified CSS selector not found.');
        }

        // Get the text content of the element
        const textContent = await element.textContent();

        // Check if the text content contains "ETH / USDC"
        expect(textContent).toContain('ETH / USDC');
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
