import styles from './FavoritePoolsCard.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { usePoolStats } from './hooks/usePoolStats';

interface propsIF {
    pool: PoolIF;
    chainId: string;
    lastBlockNumber: number;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function FavoritePoolsCard(props: propsIF) {
    const { pool, chainId, cachedPoolStatsFetch, lastBlockNumber } = props;

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

    const ariaLabel = `Pool for ${pool.base.symbol} and ${pool.quote.symbol}. ${
        volume && ` volume is ${volume}`
    }. ${tvl && `tvl is ${tvl}`}`;

    return (
        <Link
            className={styles.container}
            to={linkPath}
            aria-label={ariaLabel}
            tabIndex={0}
        >
            <div>
                {pool.base.symbol} / {pool.quote.symbol}
            </div>
            <div>{volume}</div>
            <div>{tvl}</div>
        </Link>
    );
}
