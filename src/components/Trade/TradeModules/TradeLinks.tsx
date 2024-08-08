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
import { TokenIF } from '../../../ambient-utils/types';
import { brand } from '../../../ambient-utils/constants';

interface propsIF {
    chainId: string;
    tokenA: TokenIF;
    tokenB: TokenIF;
    limitTick?: number;
}

export default function TradeLinks(props: propsIF) {
    const { chainId, tokenA, tokenB, limitTick } = props;
    const isFuta = brand === 'futa';

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
    // this is constructed as such to handle a valid `0` value
    const limitParams: limitParamsIF =
        limitTick === undefined
            ? {
                  ...marketParams,
              }
            : {
                  ...marketParams,
                  limitTick: limitTick,
              };
    const poolParams: poolParamsIF = {
        ...marketParams,
    };

    // interface describing shape of route data to generate nav links
    interface routeIF {
        path: string;
        baseURL: baseURLs | string;
        name: 'Swap' | 'Limit' | 'Pool';
    }

    // data to generate nav links to the three trade modules
    const routes: routeIF[] = isFuta
        ? [
              {
                  path: '/swap',
                  baseURL: '/swap',
                  name: 'Swap',
              },
              {
                  path: '/limit',
                  baseURL: '/limit',
                  name: 'Limit',
              },
          ]
        : [
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
            margin={!isFuta ? '0 0 16px 0' : '8px 0'}
            padding={isFuta ? '' : ''}
            height='25px'
            width='100%'
        >
            {routes.map((route: routeIF) => (
                <TradeModuleLink
                    key={JSON.stringify(route)}
                    id={`link_to_${route.name.toLowerCase()}_module`}
                    to={route.path}
                    isActive={location.pathname.includes(route.baseURL)}
                    isFuta={isFuta}
                >
                    {route.name}
                </TradeModuleLink>
            ))}
        </FlexContainer>
    );
}
