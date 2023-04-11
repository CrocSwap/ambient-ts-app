import { Link, useLocation } from 'react-router-dom';
import styles from './RecentPoolsCard.module.css';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useEffect, useState, useMemo } from 'react';
import { formatAmountOld } from '../../../../utils/numbers';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
import { SmallerPoolIF } from '../../../../App/hooks/useRecentPools';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

interface propsIF {
    tradeData: tradeData;
    chainId: string;
    pool: SmallerPoolIF;
    cachedPoolStatsFetch: PoolStatsFn;
    lastBlockNumber: number;
}

export default function RecentPoolsCard(props: propsIF) {
    const { tradeData, chainId, pool, lastBlockNumber, cachedPoolStatsFetch } =
        props;

    const { pathname } = useLocation();

    const locationSlug = useMemo<string>(() => {
        let slug: string;
        if (
            pathname.startsWith('/trade/market') ||
            pathname.startsWith('/account')
        ) {
            slug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            slug = '/trade/limit';
        } else if (
            pathname.startsWith('/trade/range') ||
            pathname.startsWith('/trade/reposition')
        ) {
            slug = '/trade/range';
        } else {
            console.warn(
                'Could not identify the correct URL path for redirect. Using /trade/market as a fallback value. Refer to RecentPoolsCard.tsx for troubleshooting.',
            );
            slug = '/trade/market';
        }
        return slug + '/chain=';
    }, [pathname]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const fetchPoolStatsAsync = () => {
        (async () => {
            const poolStatsFresh = await cachedPoolStatsFetch(
                chainId,
                pool.baseToken.address,
                pool.quoteToken.address,
                lookupChain(chainId).poolIndex,
                Math.floor(lastBlockNumber / 4),
            );
            // display the total volume for all time
            const volume = poolStatsFresh?.volumeTotal;
            const volumeString = volume
                ? '$' + formatAmountOld(volume)
                : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmountOld(tvl) : undefined;
            setPoolTvl(tvlString);
        })();
    };

    useEffect(() => {
        fetchPoolStatsAsync();
    }, [lastBlockNumber]);

    const tokenAString =
        pool.baseToken.address.toLowerCase() ===
        tradeData.tokenA.address.toLowerCase()
            ? pool.baseToken.address
            : pool.quoteToken.address;

    const tokenBString =
        pool.baseToken.address.toLowerCase() ===
        tradeData.tokenA.address.toLowerCase()
            ? pool.quoteToken.address
            : pool.baseToken.address;

    return (
        <Link
            className={styles.container}
            to={
                locationSlug +
                chainId +
                '&tokenA=' +
                tokenAString +
                '&tokenB=' +
                tokenBString
            }
        >
            <div>
                {pool.baseToken.symbol} / {pool.quoteToken.symbol}
            </div>
            <div>{poolVolume ?? '…'}</div>
            <div>{poolTvl ?? '…'}</div>
        </Link>
    );
}
