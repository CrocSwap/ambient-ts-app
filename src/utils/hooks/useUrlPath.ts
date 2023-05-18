import { useLocation } from 'react-router-dom';
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

    const location = useLocation();

    // type that maps to keys (strings) in the BASE_URL_PATHS object
    type pageNames = keyof typeof BASE_URL_PATHS;

    // fn to return a base URL slug for a given page
    function getPath(page: pageNames, paramTuples: string[][]): string {
        const baseUrl: string = BASE_URL_PATHS[page];
        const paramsSlug: string = paramTuples
            .map((tup: string[]) => tup.join('='))
            .join('&');
        return baseUrl + '/' + paramsSlug;
    }

    return {
        location,
        getPath,
    };
};
