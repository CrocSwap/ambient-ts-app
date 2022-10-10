import { Link, useLocation } from 'react-router-dom';
import styles from './TopPoolsCard.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';
import { getPoolStatsFresh } from '../../../../App/functions/getPoolStats';
import { useEffect, useState, useMemo } from 'react';
import { formatAmount } from '../../../../utils/numbers';
interface TopPoolsCardProps {
    pool: PoolIF;
    chainId: string;
}

export default function TopPoolsCard(props: TopPoolsCardProps) {
    const { pool } = props;

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
                'Could not identify the correct URL path for redirect. Using /trade/market as a fallback value. Refer to TopPoolsCard.tsx for troubleshooting.',
            );
            return '/trade/market';
        }
    }, [pathname]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const fetchPoolStats = () => {
        (async () => {
            console.log('fetching pool stats from sidebar');
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
    };

    useEffect(() => {
        fetchPoolStats();

        // fetch every minute
        const timerId = setInterval(() => {
            fetchPoolStats();
        }, 60000);

        // after 1 hour stop
        setTimeout(() => {
            clearInterval(timerId);
        }, 3600000);

        // clear interval when component unmounts
        return () => clearInterval(timerId);
    }, []);

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
