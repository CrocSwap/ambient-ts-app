export const useUrlPath = () => {
    // index of all base URL pathways in the Ambient app
    const BASE_URL_PATHS = {
        index: '',
        home: '',
        swap: '/swap',
        trade: '/trade',
        market: '/trade/market',
        limit: '/trade/limit',
        range: '/trade/range',
        reposition: '/reposition',
        tos: '/tos',
        testpage: '/testpage',
    };

    // type that maps to keys (strings) in the BASE_URL_PATHS object
    type pageNames = keyof typeof BASE_URL_PATHS;

    // fn to return a base URL slug for a given page
    function getPath(page: pageNames): string {
        return BASE_URL_PATHS[page];
    }

    return {
        getPath,
    };
};
