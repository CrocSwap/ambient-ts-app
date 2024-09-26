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
        title: 'Liquidity',
        intro: 'This is the amount of ETH required to create the token auction and fill the initial bid.',
    },
    {
        element: '#auctions_create_network_fee',
        title: 'Network Fee',
        intro: 'This is the estimated fee you will have to pay in order to create the auction on-chain.',
    },
    {
        element: '#auctions_create_button',
        title: 'Create Token',
        intro: 'Create token auction token from this button',
        navigate: { label: 'To Auctions', path: '/auctions' },
        actionOnComplete: '#create_auction_reset',
    },
    {
        element: '#auctions_create_connect_button',
        title: 'Connect Wallet',
        intro: 'You should connect your wallet to create token auction',
        actionOnComplete: '#create_auction_reset',
    },
];
