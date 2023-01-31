import styles from './FavoritePoolsCard.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatAmountOld } from '../../../../utils/numbers';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface propsIF {
    pool: PoolIF;
    chainId: string;
    lastBlockNumber: number;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function FavoritePoolsCard(props: propsIF) {
    const { pool, chainId, cachedPoolStatsFetch, lastBlockNumber } = props;

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const { tokenB } = useAppSelector((state) => state.tradeData);

    const [addrTokenA, addrTokenB] =
    tokenB.address.toLowerCase() === pool.base.address.toLowerCase()
        ? [pool.quote.address, pool.base.address]
        : [pool.base.address, pool.quote.address];

    const linkPath = '/trade/market/chain=' + chainId + '&tokenA=' + addrTokenA + '&tokenB=' + addrTokenB

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
