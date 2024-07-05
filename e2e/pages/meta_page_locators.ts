export const locators = {
    gotoTradePage:
        'https://dev-ambi.netlify.app/trade/market/chain=0xaa36a7&tokenA=0x60bBA138A74C5e7326885De5090700626950d509&tokenB=0x0000000000000000000000000000000000000000',
    gotoSwap:
        'http://localhost:3000/swap/chain=0xaa36a7&tokenA=0x0000000000000000000000000000000000000000&tokenB=0x60bBA138A74C5e7326885De5090700626950d509',
    gotoChat:
        'https://proven-chat-test.netlify.app/trade/market/chain=0x1&tokenA=0x0000000000000000000000000000000000000000&tokenB=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    gotoHomepage: 'http://localhost:3000',
    clickLiqPosition: '[id=\'sidebar_header_liquidity_positions\']',
    clickLimitOrder: '[id=\'sidebar_header_limit_orders\']',
    clickTransactions: '[id=\'sidebar_header_transactions\']',
    clickWalletBalances: '[id=\'wallet_balances_tab_clickable\']',
    clickExchangeBalances: '[id=\'exchange_balances_tab_clickable\']',
    clickLiquidityTab: '[id=\'liquidity_tab_clickable\']',
    clickLimitTab: '[id=\'limits_tab_clickable\']',
    clickLimit: '[id=\'link_to_limit_module\']',
    clickPoolTab: '[id=\'link_to_pool_module\']',
    clickTransactionsTab: '[id=\'transactions_tab_clickable\']',
    clickTransferTab: '[id=\'transfer_tab_clickable\']',
    clickChangeTokenAccount: '[id=\'exchangeBalance_token_selector\']',
    clickSelectChangeToken: '[id=\'token_select_input_field\']',
    clickTransfer:
        '#subcont > div > div.TabComponent_tab_window__3P7DO > div > div > div > button',
    clickWithdrawTab: '[id=\'withdraw_tab_clickable\']',
    clickDifferentAddress: '[id=\'withdraw_to_different_addressswitch\']',
    clickWithdraw: '[id=\'withdraw_tokens_button\']',
    clickDeposit: '#deposit_tokens_button',
    clickAddLiquidity: 'Add',
    enterAmountRemove: '[id=\'remove_liq_preset_10%\']',
    enterAmountLiquidity: '[id=\'range_B_qty\']',
    clickSubmit: '[id=\'submit_range_position_button\']',
    clickRemoveLiq: '[id=\'harvest_remove_fees_modal_button\']',
    clickConfirm: '[id=\'set_skip_confirmation_button\']',
    clickRemoveLimits: 'Remove',
    clickRemoveLimitOrder: '[id=\'claim_remove_limit_button\']',
    clickRemoveLiquidity:
        '[id=\'remove_position_pos_853ed8b2017c165ae15f284e53c4119ef7d5d39055b2ffc15ef2d305efbb5f18\']',
    clickReverseTokenSwap: 'Reverse tokens',
    clickSettingsSwap: '[id=\'settings_button\']',
    clickSubmitSlippage: '[id=\'update_settings_button\']',
    clickConfirmSwap: '[id=\'confirm_swap_button\']',
    clickConfirmLimit: '[id=\'confirm_limit_order_button\']',
    clickTransactionsRow: '//*[@id="current_row_scroll"]/div[1]',
    clickClaimLimit:
        '[id=\'claim_limit_button_limit_608f80ba82d75d7e0188c677434bf872d805987d216301082bf09d06448e6908\']',
    clickMyTransactions: '[id=\'positions_only_toggleswitch\']',
    clickBalancedToggle: '[id=\'advanced_repositionswitch\']',
    clickDecreaseMinPrice: '[id=\'decrease_min_price_button\']',
    clickLimitRate: '[id=\'increase_limit_rate_button\']',
    clickChangeWallet:
        '#app-content > div > div.mm-box.multichain-app-header-logo.mm-box--margin-2.mm-box--display-none.mm-box--sm:display-flex.mm-box--justify-content-center.mm-box--align-items-center > button > svg',
    clickChangeWalletSelecet:
        'xpath=/html/body/div[3]/div[3]/div/section/div[2]/div[2]/div[1]',
    assertTransactionSwap:
        'xpath=//*[@id="Modal_Global"]/div/div/section/div/footer/div/button/div[2]',
    assertIdShareableChart:
        '//*[@id="Modal_Global"]/div/div/section/div/div[2]/div/section[1]/div[3]/div[2]/div/p',
    assertValLimitPriceShareableChart:
        'xpath=//*[@id="Modal_Global"]/div/div/section/div/div[2]/div/div[1]/div/div/div[6]/section[1]/h2',
    assertTransactionsTransactionTab: 'xpath=//*[@id="tx_row_0"]/div[2]/div[2]',
    assertChangeNetwork:
        'xpath=//*[@id="root"]/div[1]/header/div[2]/div/div/div[1]/div/div/div/div/div',
    fillTransferTab:
        '[id=\'exchange-balance-transfer-address-exchange-balance-transfer-quantity\']',
    fillWithdrawTab:
        '[id=\'exchange-balance-withdraw-address-exchange-balance-transfer-quantity\']',
    fillTransferUSDC: '[id=\'exchangeBalance_qty\']',
    fillPool: '[id=\'range_A_qty\']',
    fillLimit: '[id=\'limit_sell_qty\']',
    fillSwap: '[id=\'swap_sell_qty\']',
    fillPoolBar: '[id=\'input-slider-range\']',
    confirmMeta: 'page-container-footer-next',
    confirmNetworkChange: 'Switch network',
    getIdLiquidity: '//*[@id="current_row_scroll"]/div[1]/div[1]/div[1]',
    getValLimitPrice:
        'xpath=//*[@id="current_row_scroll"]/div[1]/div[2]/p/span[2]',
    chatRoomDropdown: '[id=\'room dropdown\']',
    getWalletConnectivity:
        'xpath=//*[@id="root"]/div[1]/header/div[2]/div/div/div[2]/section[1]',
    chatOpenTrollbox: '[id=\'open-close-trollbox\']',
};
