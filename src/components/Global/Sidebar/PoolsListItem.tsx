import { PoolIF } from '../../../ambient-utils/types';
import {
    PoolStatsFn,
    getMoneynessRank,
} from '../../../ambient-utils/dataLayer';
import { Link, useLocation } from 'react-router-dom';
import { useContext, useMemo } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import {
    useLinkGen,
    linkGenMethodsIF,
    pageNames,
} from '../../../utils/hooks/useLinkGen';
import { TokenPriceFn } from '../../../ambient-utils/api';
import { ItemContainer } from '../../../styled/Components/Sidebar';
import { FlexContainer } from '../../../styled/Common';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import useFetchPoolStats from '../../../App/hooks/useFetchPoolStats';

interface propsIF {
    pool: PoolIF;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function PoolsListItem(props: propsIF) {
    const { pool } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    // hook to get human-readable values for pool volume and TVL
    const poolData = useFetchPoolStats(pool);

    const isBaseTokenMoneynessGreaterOrEqual =
        pool.base.address && pool.quote.address
            ? getMoneynessRank(pool.base.symbol) -
                  getMoneynessRank(pool.quote.symbol) >=
              0
            : false;

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

    const { tokenA, tokenB } = useContext(TradeDataContext);

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
        <ItemContainer
            as={Link}
            to={linkGenMarket.getFullURL({
                chain: chainId,
                tokenA: addrTokenA,
                tokenB: addrTokenB,
            })}
            numCols={3}
            color='text2'
        >
            {[
                `${
                    isBaseTokenMoneynessGreaterOrEqual
                        ? pool.quote.symbol
                        : pool.base.symbol
                } / ${
                    isBaseTokenMoneynessGreaterOrEqual
                        ? pool.base.symbol
                        : pool.quote.symbol
                }`,
                `${
                    poolData.poolVolume24h
                        ? '$' + poolData.poolVolume24h
                        : '...'
                }`,
                `${poolData.poolTvl ? '$' + poolData.poolTvl : '...'}`,
            ].map((item, idx) => (
                <FlexContainer
                    key={idx}
                    justifyContent='center'
                    alignItems='center'
                    padding='4px'
                >
                    {item}
                </FlexContainer>
            ))}
        </ItemContainer>
    );
}
