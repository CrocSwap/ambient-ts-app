import styles from './FavoritePoolsCard.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';
import { getPoolStatsFresh } from '../../../../App/functions/getPoolStats';
import { useEffect, useState } from 'react';
import { formatAmount } from '../../../../utils/numbers';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';

interface FavoritePoolsCardIF {
    pool: PoolIF;
    lastBlockNumber: number;
}

export default function FavoritePoolsCard(props: FavoritePoolsCardIF) {
    const { pool, lastBlockNumber } = props;

    const dispatch = useAppDispatch();

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const tradeData = useAppSelector((state) => state.tradeData);
    // const tokenA = tradeData.tokenA;
    const tokenB = tradeData.tokenB;

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
        <div
            className={styles.container}
            onClick={() => {
                if (tokenB.address.toLowerCase() === props.pool.base.address.toLowerCase()) {
                    dispatch(setTokenB(props.pool.base));
                    dispatch(setTokenA(props.pool.quote));
                } else {
                    dispatch(setTokenA(props.pool.base));
                    dispatch(setTokenB(props.pool.quote));
                }
            }}
        >
            <div>
                {pool.base.symbol} / {pool.quote.symbol}
            </div>
            <div>{poolVolume ?? '…'}</div>
            <div>{poolTvl ?? '…'}</div>
        </div>
    );
}
