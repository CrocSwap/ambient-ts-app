import styles from '../SidebarSearchResults.module.css';
import { TempPoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { poolStatsIF, usePoolStats } from './usePoolStats';
import { TokenPriceFn } from '../../../../functions/fetchTokenPrice';
import { CrocEnv } from '@crocswap-libs/sdk';

interface propsIF {
    pool: TempPoolIF;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
    crocEnv?: CrocEnv;
}

export default function PoolLI(props: propsIF) {
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
            onClick={() =>
                handleClick(pool.baseToken.address, pool.quoteToken.address)
            }
        >
            <p>
                {pool.baseToken.symbol ?? '--'} /{' '}
                {pool.quoteToken.symbol ?? '--'}
            </p>
            <p style={{ textAlign: 'center' }}>{poolStats.volume ?? '--'}</p>
            <p style={{ textAlign: 'center' }}>{poolStats.tvl ?? '--'}</p>
        </li>
    );
}
