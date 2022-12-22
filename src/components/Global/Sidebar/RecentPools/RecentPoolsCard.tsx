import { Link, useLocation } from 'react-router-dom';
import styles from './RecentPoolsCard.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useEffect, useState, useMemo } from 'react';
import { formatAmountOld } from '../../../../utils/numbers';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
interface RecentPoolsCardProps {
    tradeData: tradeData;
    pool: PoolIF;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    lastBlockNumber: number;
}

export default function RecentPoolsCard(props: RecentPoolsCardProps) {
    const { tradeData, pool, lastBlockNumber, cachedPoolStatsFetch } = props;

    const { pathname } = useLocation();

    const locationSlug = useMemo(() => {
        if (pathname.startsWith('/trade/market') || pathname.startsWith('/account')) {
            return '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            return '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            return '/trade/range';
        } else {
            console.warn(
                'Could not identify the correct URL path for redirect. Using /trade/market as a fallback value. Refer to RecentPoolsCard.tsx for troubleshooting.',
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
                Math.floor(lastBlockNumber / 4),
            );
            const volume = poolStatsFresh?.volume;
            const volumeString = volume ? '$' + formatAmountOld(volume) : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmountOld(tvl) : undefined;
            setPoolTvl(tvlString);
        })();
    };

    useEffect(() => {
        fetchPoolStats();
    }, [lastBlockNumber]);

    const chainString = '0x5';

    const tokenAString =
        pool.base.address.toLowerCase() === tradeData.tokenA.address.toLowerCase()
            ? pool.base.address
            : pool.quote.address;

    const tokenBString =
        pool.base.address.toLowerCase() === tradeData.tokenA.address.toLowerCase()
            ? pool.quote.address
            : pool.base.address;

    return (
        <Link
            className={styles.container}
            to={`${locationSlug}/chain=${chainString}&tokenA=${tokenAString}&tokenB=${tokenBString}`}
        >
            <div>
                {pool.base.symbol} / {pool.quote.symbol}
            </div>
            <div>{poolVolume ?? '…'}</div>
            <div>{poolTvl ?? '…'}</div>
        </Link>
    );
}
