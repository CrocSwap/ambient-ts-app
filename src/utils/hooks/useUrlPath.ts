import { useNavigate } from 'react-router-dom';

export interface swapParamsIF {
    chain: string,
    tokenA: string,
    tokenB: string,
}
interface marketParamsIF {
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
type anyParamIFs = swapParamsIF |
    marketParamsIF |
    limitParamsIF |
    rangeParamsIF |
    repoParamsIF;

export const useUrlPath = (chainId: string) => {
    const navigate = useNavigate();

    false && chainId;

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

    class Path {
        private readonly page: pageNames;
        constructor(page: pageNames) {
            this.page = page;
        }
        getURL(paramsObj?: anyParamIFs): string {
            let paramsSlug = '';
            if (paramsObj) {
                paramsSlug = '/' + Object.entries(paramsObj)
                    .map((tup: string[]) => tup.join('='))
                    .join('&');
            }
            return BASE_URL_PATHS[this.page] + paramsSlug;
        };
        navigate(paramsObj?: anyParamIFs): void {
            navigate(this.getURL(paramsObj));
        };
    }

    return {
        index: new Path('index'),
        swap: new Path('swap'),
        trade: new Path('trade'),
        market: new Path('market'),
        limit: new Path('limit'),
        range: new Path('range'),
        repo: new Path('reposition'),
        account: new Path('account'),
        privacy: new Path('privacy'),
        tos: new Path('tos'),
    }
};
