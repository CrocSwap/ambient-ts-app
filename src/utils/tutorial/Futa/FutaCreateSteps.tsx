export const futaCreateSteps = [
    {
        element: '#navbar_create',
        title: ' Welcome',
        intro: 'Welcome to Create Token on Futa',
        actionTrigger: '#create_auction_reset',
    },
    {
        element: '#ticker_input',
        title: 'Token Ticker',
        intro: 'You can enter token ticker from here ',
        // assignment: '#ticker_input>MY TICKER',
        actionTrigger: '#create_auction_input_trigger',
    },
    {
        element: '#auctions_create_liquidity',
        title: 'Liquidty',
        intro: 'Liquidty is the amount of liquidity you want to provide for the token auction',
    },
    {
        element: '#auctions_create_network_fee',
        title: 'Network Fee',
        intro: 'Network fee is the fee you have to pay in order to transact',
    },
    {
        element: '#auctions_create_button',
        title: 'Create Token',
        intro: 'Create token auction token from this button',
        navigate: {label: 'To Auctions', path: '/auctions'},
        actionOnComplete: '#create_auction_reset',
    },
    {
        element: '#auctions_create_connect_button',
        title: 'Connect Wallet',
        intro: 'You should connect your wallet to create token auction',
        actionOnComplete: '#create_auction_reset',
    },
];
