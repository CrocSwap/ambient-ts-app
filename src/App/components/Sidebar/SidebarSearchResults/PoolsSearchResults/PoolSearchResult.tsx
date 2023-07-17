import styles from '../SidebarSearchResults.module.css';
import { PoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { poolStatsIF, usePoolStats } from './usePoolStats';
import { TokenPriceFn } from '../../../../functions/fetchTokenPrice';
import { CrocEnv } from '@crocswap-libs/sdk';

interface propsIF {
    pool: PoolIF;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
    crocEnv?: CrocEnv;
}

export default function PoolSearchResult(props: propsIF) {
    const {
        pool,
        handleClick,
        cachedPoolStatsFetch,
        cachedFetchTokenPrice,
        crocEnv,
    } = props;

    // hook to get volume and TVL for the current pool
    const poolStats: poolStatsIF = usePoolStats(
        pool,
        cachedPoolStatsFetch,
        cachedFetchTokenPrice,
        crocEnv,
    );

    return (
        <li
            className={styles.card_container}
            onClick={() => handleClick(pool.base.address, pool.quote.address)}
        >
            <p>
                {pool.base.symbol ?? '--'} / {pool.quote.symbol ?? '--'}
            </p>
            <p style={{ textAlign: 'center' }}>{poolStats.volume ?? '--'}</p>
            <p style={{ textAlign: 'center' }}>{poolStats.tvl ?? '--'}</p>
        </li>
    );
}
