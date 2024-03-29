export const locators = {
    clickLimitBtn: '[id=\'link_to_limit_module\']',
    clickPoolBtn: '[id=\'link_to_pool_module\']',
    clickLockSidebar: '[id=\'sidebar_is_unlocked_clickable\']',
    clickToppools: '[id=\'sidebar_header_top_pools\']',
    clickRecentPools: '[id=\'sidebar_header_recent_pools\']',
    clickToppoolsToken:
        'xpath=//*[@id=\'root\']/div[1]/section/div/div/div/div[2]/div[1]/div[2]/div/div[2]/a[1]/div[1]',
    clickRecentpoolsToken:
        'xpath=//*[@id=\'root\']/div[1]/section/div/div/div/div[2]/div[3]/div[2]/div/div[2]/a[1]/div[1]',
    clickOpenAllDropdown: '[id=\'sidebar_collapse_all_button\']',
    clickReverseArrow: 'Reverse tokens',
    clickAddFav: 'Add pool from favorites',
    clickFavpools: '[id=\'sidebar_header_favorite_pools\']',
    click5Percent: '[id=\'range_width_preset_5%\']',
    click10Percent: '[id=\'range_width_preset_10%\']',
    click25Percent: '[id=\'range_width_preset_25%\']',
    click50Percent: '[id=\'range_width_preset_50%\']',
    clickAmbient: '[id=\'range_width_preset_Ambient\']',
    clickBalanced: '[id=\'advanced_repositionswitch\']',
    clickDecrease: '[id=\'decrease_min_price_button\']',
    clickIncrease: '[id=\'increase_max_price_button\']',
    clickLeaderboard: '[id=\'leaderboard_tab_clickable\']',
    clickLeaderboardRow:
        '//html/body/div[1]/div[1]/section/section/div[1]/div[2]/div[2]/div/div/div/div/div/div/div[2]/div[2]/div[5]/p',
    clickSettingsBtn: '[id=\'settings_button\']',
    click01: '[id=\'slippage-preset-button-0.1%\']',
    click03: '[id=\'slippage-preset-button-0.3%\']',
    click05: '[id=\'slippage-preset-button-0.5%\']',
    clickClipboard: '[id=\'trade_chart_save_image\']',
    getTokenName: '[id=\'trade_header_token_pair\']',
    getToppoolsToken:
        '#root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container-trade > section > div > div > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__ContentContainer-sc-1wecv3f-1.ktsSty.bxuVdV > div:nth-child(1) > div:nth-child(2) > div > div.Sidebar__ItemsContainer-sc-1wecv3f-7.kxjylf > a:nth-child(2) > div:nth-child(1)',
    getRecentpoolsToken:
        '#root > div.Container__FlexContainer-sc-1b686b3-0.ktsSty.content-container-trade > section > div > div > div > div.Container__FlexContainer-sc-1b686b3-0.Sidebar__ContentContainer-sc-1wecv3f-1.ktsSty.bxuVdV > div:nth-child(3) > div:nth-child(2) > div > div.Sidebar__ItemsContainer-sc-1wecv3f-7.kxjylf > a:nth-child(1) > div:nth-child(1)',
    getMinPrice: '[id=\'min_price_readable\']',
    getMinPercentage: '[id=\'min_price_of_range_advanced\']',
    getMaxPercentage: 'Reverse tokens',
    getLeaderboard:
        'xpath=//*[@id=\'root\']/div[1]/section/section/div[1]/div[2]/div[2]/div/div/div/div/div/div/div[2]/div[1]/div[5]',
    assertToken: '[id=\'trade_chart_header_token_pair_symbols\']',
    assertLeaderboard:
        '//html/body/div[1]/div[1]/section/section/div[1]/div[2]/div[2]/div/div/div/div/div/div/div[2]/div[2]/div[5]/p',
    assertHomepage: '[id=\'trade_now_btn_in_hero\']',
    assertLockSidebar: '[id=\'sidebar_is_locked_clickable\']',
    assertTransactions:
        '#sidebar_header_transactions > svg.Sidebar__ArrowIcon-sc-1wecv3f-17.jTcnZQ',
    assertLimitOrder: '[id=\'sidebar_header_limit_orders\']',
    assertRangePosition: '[id=\'sidebar_header_liquidity_positions\']',
    assertSwapReverse: '[id=\'swap_sell_token_selector\']',
    assertLimitReverse: '[id=\'limit_sell_token_selector\']',
    assertFavPoolAdded:
        'xpath=//*[@id=\'root\']/div[1]/section/div/div/div/div[2]/div[2]/div[2]/div/div[2]/a[1]/div[1]',
    assertClipboard: 'xpath=//*[@id=\'root\']/div[4]/div/div/div/div[2]',
};
