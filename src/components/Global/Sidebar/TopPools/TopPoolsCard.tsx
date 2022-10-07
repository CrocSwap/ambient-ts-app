import { Link, useLocation } from 'react-router-dom';
import styles from './TopPoolsCard.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';
import { getPoolStatsFresh } from '../../../../App/functions/getPoolStats';
import { useEffect, useState, useMemo } from 'react';
import { formatAmount } from '../../../../utils/numbers';
interface TopPoolsCardProps {
    pool: PoolIF;
    chainId: string;
    lastBlockNumber: number;
}

export default function TopPoolsCard(props: TopPoolsCardProps) {
    const { pool, lastBlockNumber } = props;

    const location = useLocation();

    const locationSlug = useMemo(() => {
        const { pathname } = location;
        if (pathname.startsWith('/trade/market')) {
            return '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            return '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            return '/trade/range';
        }
    }, [location]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    useEffect(() => {
        (async () => {
            const poolStatsFresh = await getPoolStatsFresh(
                pool.chainId,
                pool.base.address,
                pool.quote.address,
                pool.poolId,
            );
            const volume = poolStatsFresh?.volume;
            const volumeString = volume ? '$' + formatAmount(volume) : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmount(tvl) : undefined;
            setPoolTvl(tvlString);
        })();
    }, [JSON.stringify(pool), lastBlockNumber]);

    return (
        <Link
            className={styles.container}
            to={`${locationSlug}/chain=0x5&tokenA=${pool.base.address}&tokenB=${pool.quote.address}`}
        >
            <div>
                {pool.base.symbol} / {pool.quote.symbol}
            </div>
            <div>{poolVolume ?? '…'}</div>
            <div>{poolTvl ?? '…'}</div>
        </Link>
    );
}
