import { FlexContainer } from '../../../styled/Common';
import { TradeModuleLink } from '../../../styled/Components/TradeModules';
import {
    linkGenMethodsIF,
    useLinkGen,
    marketParamsIF,
    limitParamsIF,
    poolParamsIF,
    baseURLs,
} from '../../../utils/hooks/useLinkGen';
import { TokenIF } from '../../../utils/interfaces/exports';

interface propsIF {
    chainId: string;
    tokenA: TokenIF;
    tokenB: TokenIF;
    limitTick?: number;
}

export default function TradeLinks(props: propsIF) {
    const { chainId, tokenA, tokenB, limitTick } = props;

    // hooks to generate default URL paths
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    // URL param data to generate nav links
    const marketParams: marketParamsIF = {
        chain: chainId,
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    };
    const limitParams: limitParamsIF = {
        ...marketParams,
        limitTick: limitTick ?? 0,
    };
    const poolParams: poolParamsIF = {
        ...marketParams,
    };

    // interface describing shape of route data to generate nav links
    interface routeIF {
        path: string;
        baseURL: baseURLs;
        name: 'Swap' | 'Limit' | 'Pool';
    }

    // data to generate nav links to the three trade modules
    const routes: routeIF[] = [
        {
            path: linkGenMarket.getFullURL(marketParams),
            baseURL: linkGenMarket.baseURL,
            name: 'Swap',
        },
        {
            path: linkGenLimit.getFullURL(limitParams),
            baseURL: linkGenLimit.baseURL,
            name: 'Limit',
        },
        {
            path: linkGenPool.getFullURL(poolParams),
            baseURL: linkGenPool.baseURL,
            name: 'Pool',
        },
    ];

    // nav links to the three trade modules
    return (
        <FlexContainer
            as='nav'
            justifyContent='center'
            alignItems='center'
            gap={8}
            margin='0 0 16px 0'
            height='25px'
        >
            {routes.map((route: routeIF) => (
                <TradeModuleLink
                    key={JSON.stringify(route)}
                    to={route.path}
                    isActive={location.pathname.includes(route.baseURL)}
                >
                    {route.name}
                </TradeModuleLink>
            ))}
        </FlexContainer>
    );
}
