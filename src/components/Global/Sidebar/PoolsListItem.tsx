import { PoolIF } from '../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../App/functions/getPoolStats';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { usePoolStats } from '../../../App/hooks/usePoolStats';
import { useContext, useMemo } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import {
    useLinkGen,
    linkGenMethodsIF,
    pageNames,
} from '../../../utils/hooks/useLinkGen';
import { TokenPriceFn } from '../../../App/functions/fetchTokenPrice';
import SidebarPoolsListItemContainer from '../../../styled/Sidebar/SidebarPoolsListItemContainer';
import SidebarPoolsListItemColumn from '../../../styled/Sidebar/SidebarPoolsListItemColumn';

interface propsIF {
    pool: PoolIF;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function PoolsListItem(props: propsIF) {
    const { pool, cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    // hook to get human-readable values for pool volume and TVL
    const [volume, tvl] = usePoolStats(
        pool,
        lastBlockNumber,
        cachedPoolStatsFetch,
        cachedFetchTokenPrice,
        crocEnv,
    );

    const { pathname } = useLocation();

    const navTarget = useMemo<pageNames>(() => {
        let output: pageNames;
        if (
            pathname.startsWith('/trade/market') ||
            pathname.startsWith('/account') ||
            pathname === '/'
        ) {
            output = 'market';
        } else if (pathname.startsWith('/trade/limit')) {
            output = 'limit';
        } else if (pathname.startsWith('/trade/pool')) {
            output = 'pool';
        } else {
            console.warn(
                'Could not identify the correct URL path for redirect. Using /trade/market as a fallback value. Refer to TopPoolsCard.tsx for troubleshooting.',
            );
            output = 'market';
        }
        return output as pageNames;
    }, [pathname]);

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    // hook to generate navigation actions with pre-loaded path
    const linkGenMarket: linkGenMethodsIF = useLinkGen(navTarget);

    const [addrTokenA, addrTokenB] =
        tokenA.address.toLowerCase() === pool.base.address.toLowerCase()
            ? [pool.base.address, pool.quote.address]
            : tokenA.address.toLowerCase() === pool.quote.address.toLowerCase()
            ? [pool.quote.address, pool.base.address]
            : tokenB.address.toLowerCase() === pool.base.address.toLowerCase()
            ? [pool.quote.address, pool.base.address]
            : [pool.base.address, pool.quote.address];

    return (
        <SidebarPoolsListItemContainer
            to={linkGenMarket.getFullURL({
                chain: chainId,
                tokenA: addrTokenA,
                tokenB: addrTokenB,
            })}
        >
            <SidebarPoolsListItemColumn>
                {pool.base.symbol} / {pool.quote.symbol}
            </SidebarPoolsListItemColumn>
            <SidebarPoolsListItemColumn>{volume}</SidebarPoolsListItemColumn>
            <SidebarPoolsListItemColumn>{tvl}</SidebarPoolsListItemColumn>
        </SidebarPoolsListItemContainer>
    );
}
