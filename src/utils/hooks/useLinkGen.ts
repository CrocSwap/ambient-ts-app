import { useLocation, useNavigate } from 'react-router-dom';

export interface swapParamsIF {
    chain: string;
    tokenA: string;
    tokenB: string;
}

export interface marketParamsIF {
    chain: string;
    tokenA: string;
    tokenB: string;
}

export interface limitParamsIF {
    chain: string;
    tokenA: string;
    tokenB: string;
    limitTick?: number;
}

export interface poolParamsIF {
    chain: string;
    tokenA: string;
    tokenB: string;
    lowTick?: string;
    highTick?: string;
}

export interface initParamsIF {
    chain: string;
    tokenA: string;
    tokenB: string;
}

export interface repoParamsIF {
    chain: string;
    tokenA: string;
    tokenB: string;
}

// type containing all the URL parameter interfaces
type anyParamsIF =
    | swapParamsIF
    | marketParamsIF
    | limitParamsIF
    | poolParamsIF
    | initParamsIF
    | repoParamsIF;

// index of all base URL pathways in the Ambient app
const BASE_URL_PATHS = {
    index: '',
    home: '',
    swap: '/swap',
    market: '/trade/market',
    limit: '/trade/limit',
    pool: '/trade/pool',
    initpool: '/initpool',
    reposition: '/trade/reposition',
    explore: '/explore',
    explorePools: '/explore/pools',
    exploreTokens: '/explore/tokens',
    tos: '/terms',
    testpage: '/testpage',
    account: '/account',
    privacy: '/privacy',
} as const;

// string-literal union type of keys in `BASE_URL_PATHS`
export type pageNames = keyof typeof BASE_URL_PATHS;
// string-literal union type of keys in `BASE_URL_PATHS`
export type baseURLs = typeof BASE_URL_PATHS[pageNames];

export interface linkGenMethodsIF {
    current: {
        page: pageNames;
        baseURL: baseURLs;
    };
    getFullURL: (paramsObj?: anyParamsIF | string) => string;
    navigate: (paramsObj?: anyParamsIF | string) => void;
    redirect: (paramsObj?: anyParamsIF | string) => void;
}

// TODO:    @Emily: it probably makes sense to expand this hook to
// TODO:    .... centralize URLs to link external resources

export const useLinkGen = (page?: pageNames): linkGenMethodsIF => {
    // current URL path of the app relative to index page
    const { pathname } = useLocation();

    // callable fn to navigate the user to a given URL path in the app
    const navigate = useNavigate();

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
        } else if (pathname.startsWith(BASE_URL_PATHS.pool)) {
            pageName = 'pool';
        } else if (pathname.startsWith(BASE_URL_PATHS.initpool)) {
            pageName = 'initpool';
        } else if (pathname.startsWith(BASE_URL_PATHS.reposition)) {
            pageName = 'reposition';
        } else if (pathname.startsWith(BASE_URL_PATHS.explore)) {
            pageName = 'explore';
        } else if (pathname.startsWith(BASE_URL_PATHS.explorePools)) {
            pageName = 'explorePools';
        } else if (pathname.startsWith(BASE_URL_PATHS.exploreTokens)) {
            pageName = 'exploreTokens';
        } else if (pathname.startsWith(BASE_URL_PATHS.tos)) {
            pageName = 'tos';
        } else if (pathname.startsWith(BASE_URL_PATHS.testpage)) {
            pageName = 'testpage';
        } else if (pathname.startsWith(BASE_URL_PATHS.account)) {
            pageName = 'account';
        } else if (pathname.startsWith(BASE_URL_PATHS.privacy)) {
            pageName = 'privacy';
        } else {
            pageName = 'home';
        }
        return pageName;
    }

    class Nav implements linkGenMethodsIF {
        current: {
            page: pageNames;
            baseURL: baseURLs;
        };
        constructor(page: pageNames = getPageFromLocation()) {
            this.current = {
                page: page,
                baseURL: BASE_URL_PATHS[page],
            };
        }
        getFullURL(paramsObj?: anyParamsIF | string): baseURLs | string {
            let paramsSlug = '';
            if (paramsObj) {
                if (typeof paramsObj === 'string') {
                    paramsSlug = '/' + paramsObj;
                } else {
                    paramsSlug =
                        '/' +
                        Object.entries(paramsObj)
                            .map((tup: [string, string | number]) =>
                                tup.join('='),
                            )
                            .join('&');
                }
            }
            return this.current.baseURL + paramsSlug;
        }
        navigate(paramsObj?: anyParamsIF | string): void {
            navigate(this.getFullURL(paramsObj));
        }
        redirect(paramsObj?: anyParamsIF | string): void {
            navigate(this.getFullURL(paramsObj), { replace: true });
        }
    }

    return new Nav(page);
};
