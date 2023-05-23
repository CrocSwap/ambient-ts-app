import { Link, useLocation } from 'react-router-dom';
import styles from './TopPoolsCard.module.css';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useEffect, useState, useMemo, useContext } from 'react';
import { formatAmountOld } from '../../../../utils/numbers';
import { topPoolIF } from '../../../../App/hooks/useTopPools';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface propsIF {
    pool: topPoolIF;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function TopPoolsCard(props: propsIF) {
    const { pool, cachedPoolStatsFetch } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    const tradeData = useAppSelector((state) => state.tradeData);
    const { pathname } = useLocation();

    const locationSlug = useMemo(() => {
        if (
            pathname.startsWith('/trade/market') ||
            pathname.startsWith('/account')
        ) {
            return '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            return '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            return '/trade/range';
        } else {
            console.error(
                'Could not identify the correct URL path for redirect. Using /trade/market as a fallback value. Refer to TopPoolsCard.tsx for troubleshooting.',
            );
            return '/trade/market';
        }
    }, [pathname]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const fetchPoolStats = () => {
        (async () => {
            const poolStatsFresh = await cachedPoolStatsFetch(
                pool.chainId,
                pool.base.address,
                pool.quote.address,
                pool.poolId,
                Math.floor(Date.now() / 60000),
            );
            const volume = poolStatsFresh?.volumeTotal; // display the total volume for all time
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
        fetchPoolStats(); // NOTE: we assume that a block occurs more frequently than once a minute
    }, [lastBlockNumber]);

    const tokenAString =
        pool.base.address.toLowerCase() ===
        tradeData.tokenA.address.toLowerCase()
            ? pool.base.address
            : pool.quote.address;

    const tokenBString =
        pool.base.address.toLowerCase() ===
        tradeData.tokenA.address.toLowerCase()
            ? pool.quote.address
            : pool.base.address;

    return (
        <Link
            className={styles.container}
            to={
                locationSlug +
                '/chain=' +
                chainId +
                '&tokenA=' +
                tokenAString +
                '&tokenB=' +
                tokenBString
            }
        >
            <div>
                {pool.base.symbol} / {pool.quote.symbol}
            </div>
            <div>{poolVolume ?? '…'}</div>
            <div>{poolTvl ?? '…'}</div>
        </Link>
    );
}
