import { useLocation, useNavigate } from 'react-router-dom';

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
    limitTick?: number,
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
export type pageNames = keyof typeof BASE_URL_PATHS;

export interface linkGenMethodsIF {
    baseURL: string,
    getFullURL: (paramsObj?: anyParamsIF) => string,
    navigate: (paramsObj?: anyParamsIF) => void,
}

// TODO:    @Emily: it probably makes sense to expand this hook to
// TODO:    .... centralize URLs to link external resources

export const useUrlPath = (page?: pageNames): linkGenMethodsIF => {
    // current URL path of the app relative to index page
    const { pathname } = useLocation();

    // callable fn to navigate the user to a given URL path in the app
    const navigate = useNavigate();

    // base URL of the user's location in the app, primarily uses provided
    // ... argument but will read the current URL pathname as a backup check
    const baseURL: string = BASE_URL_PATHS[page ?? getPageFromLocation()];

    // fn to infer the current page in the app based on the URL path
    function getPageFromLocation(): pageNames {
        let pageName: pageNames;
            if (pathname === '/') {
                pageName = 'index';
            } else if (pathname.startsWith(BASE_URL_PATHS.swap)) {
                pageName = 'swap';
            } else if (pathname.startsWith(BASE_URL_PATHS.market)) {
                pageName = 'market';
            } else if (pathname.startsWith(BASE_URL_PATHS.limit)) {
                pageName = 'limit';
            } else if (pathname.startsWith(BASE_URL_PATHS.range)) {
                pageName = 'range';
            } else if (pathname.startsWith(BASE_URL_PATHS.reposition)) {
                pageName = 'reposition';
            } else if (pathname.startsWith(BASE_URL_PATHS.tos)) {
                pageName = 'tos';
            } else if (pathname.startsWith(BASE_URL_PATHS.testpage)) {
                pageName = 'testpage';
            } else if (pathname.startsWith(BASE_URL_PATHS.account)) {
                pageName = 'account';
            } else if (pathname.startsWith(BASE_URL_PATHS.privacy)) {
                pageName = 'privacy';
            } else {
                console.warn(`Could not find page name corresponding to URL path <<${pathname}>> in fn getPageFromLocation() in useUrlPath.ts file. Returning value 'home' as backup value.`);
                pageName = 'home';
            };
        return pageName;
    }

    // fn to build a URL for a given page including parameters
    function getFullURL(paramsObj?: anyParamsIF): string {
        let paramsSlug = '';
        if (paramsObj) {
            paramsSlug = '/' + Object.entries(paramsObj)
                .map((tup: string[]) => tup.join('='))
                .join('&');
        }
        return baseURL + paramsSlug;
    }

    // fn to build a full URL including params AND navigate the user
    function navigateUser(paramsObj?: anyParamsIF): void {
        navigate(getFullURL(paramsObj));
    }

    return {
        baseURL,
        getFullURL,
        navigate: navigateUser,
    }
};
