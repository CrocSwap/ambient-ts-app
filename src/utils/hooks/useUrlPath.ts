import { useNavigate } from 'react-router-dom';

interface swapParamsIF {
    chain: string,
    tokenA: string,
    tokenB: string,
}
export interface marketParamsIF {
    chain: string,
    tokenA: string,
    tokenB: string,
}
interface limitParamsIF {
    chain: string,
    tokenA: string,
    tokenB: string,
}
interface rangeParamsIF {
    chain: string,
    tokenA: string,
    tokenB: string,
    highTick?: string,
    lowTick?: string,
}
interface repoParamsIF {
    chain: string,
    tokenA: string,
    tokenB: string,
    highTick: string,
    lowTick: string,
}

// type containing all the URL parameter interfaces
type anyParamsIF = swapParamsIF |
    marketParamsIF |
    limitParamsIF |
    rangeParamsIF |
    repoParamsIF;

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
    account: '/account',
    privacy: '/privacy',
};

// type that maps to keys (strings) in the BASE_URL_PATHS object
type pageNames = keyof typeof BASE_URL_PATHS;

export const useUrlPath = (page: pageNames) => {
    const navigate = useNavigate();

    const baseURL: string = BASE_URL_PATHS[page];

    function getFullURL(paramsObj?: anyParamsIF): string {
        let paramsSlug = '';
        if (paramsObj) {
            paramsSlug = '/' + Object.entries(paramsObj)
                .map((tup: string[]) => tup.join('='))
                .join('&');
        }
        return baseURL + paramsSlug;
    }

    function navigateUser(paramsObj?: anyParamsIF): void {
        navigate(getFullURL(paramsObj));
    }

    return {
        baseURL: BASE_URL_PATHS[page],
        getFullURL,
        navigate: navigateUser,
    }
};
