import { Link, useLocation } from 'react-router-dom';
import styles from './RecentPoolsCard.module.css';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useEffect, useState, useMemo, useContext } from 'react';
import { formatAmountOld } from '../../../../utils/numbers';
import { SmallerPoolIF } from '../../../../App/hooks/useRecentPools';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface propsIF {
    pool: SmallerPoolIF;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function RecentPoolsCard(props: propsIF) {
    const { pool, cachedPoolStatsFetch } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const tradeData = useAppSelector((state) => state.tradeData);
    const { lastBlockNumber } = useContext(ChainDataContext);

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
                Math.floor(Date.now() / 60000),
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
        fetchPoolStatsAsync(); // NOTE: we assume that a block occurs more frequently than once a minute
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
