import styles from './FavoritePoolsCard.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { usePoolStats } from './hooks/usePoolStats';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';

interface propsIF {
    pool: PoolIF;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function FavoritePoolsCard(props: propsIF) {
    const { pool, cachedPoolStatsFetch } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    // hook to get human-readable values for pool volume and TVL
    const [volume, tvl] = usePoolStats(
        pool,
        lastBlockNumber,
        cachedPoolStatsFetch,
    );

    const { tokenB } = useAppSelector((state) => state.tradeData);

    const [addrTokenA, addrTokenB] =
        tokenB.address.toLowerCase() === pool.base.address.toLowerCase()
            ? [pool.quote.address, pool.base.address]
            : [pool.base.address, pool.quote.address];

    const linkPath =
        '/trade/market/chain=' +
        chainId +
        '&tokenA=' +
        addrTokenA +
        '&tokenB=' +
        addrTokenB;

    return (
        <Link className={styles.container} to={linkPath}>
            <div>
                {pool.base.symbol} / {pool.quote.symbol}
            </div>
            <div>{volume}</div>
            <div>{tvl}</div>
        </Link>
    );
}
