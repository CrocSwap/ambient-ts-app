// index of all base URL pathways in the Ambient app
export const BASE_URL_PATHS = {
    index: '',
    home: '',
    swap: '/swap',
    market: '/trade/market',
    limit: '/trade/limit',
    range: '/trade/range',
    reposition: '/trade/reposition',
    tos: '/tos',
    testpage: '/testpage',
    account: '/account',
    privacy: '/privacy',
};

// type that maps to keys (strings) in the BASE_URL_PATHS object
export type pageNames = keyof typeof BASE_URL_PATHS;
