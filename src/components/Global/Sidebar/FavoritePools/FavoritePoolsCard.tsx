import styles from './FavoritePoolsCard.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { formatAmount } from '../../../../utils/numbers';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface FavoritePoolsCardIF {
    pool: PoolIF;
    lastBlockNumber: number;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function FavoritePoolsCard(props: FavoritePoolsCardIF) {
    const { pool, cachedPoolStatsFetch, lastBlockNumber } = props;

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const { tokenB } = useAppSelector((state) => state.tradeData);

    const { pathname } = useLocation();

    const linkPath = useMemo(() => {
        let locationSlug = '';
        if (pathname.startsWith('/trade/market') || pathname.startsWith('/account')) {
            locationSlug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            locationSlug = '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            locationSlug = '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            locationSlug = '/swap';
        }
        const [addrTokenA, addrTokenB] =
            tokenB.address.toLowerCase() === pool.base.address.toLowerCase()
                ? [pool.quote.address, pool.base.address]
                : [pool.base.address, pool.quote.address];
        return locationSlug + '/chain=0x5&tokenA=' + addrTokenA + '&tokenB=' + addrTokenB;
    }, [pathname]);

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
            const volumeString = volume ? '$' + formatAmount(volume) : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmount(tvl) : undefined;
            setPoolTvl(tvlString);
        })();
    };

    useEffect(() => {
        fetchPoolStats();
    }, [lastBlockNumber]);

    return (
        <Link className={styles.container} to={linkPath}>
            <div>
                {pool.base.symbol} / {pool.quote.symbol}
            </div>
            <div>{poolVolume ?? '…'}</div>
            <div>{poolTvl ?? '…'}</div>
        </Link>
    );
}
