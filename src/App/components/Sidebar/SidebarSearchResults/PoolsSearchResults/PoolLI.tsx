import styles from '../SidebarSearchResults.module.css';
import { TempPoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { poolStatsIF, usePoolStats } from './usePoolStats';
import { TokenPriceFn } from '../../../../functions/fetchTokenPrice';
import { CrocEnv } from '@crocswap-libs/sdk';

interface propsIF {
    pool: TempPoolIF;
    chainId: string;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
    crocEnv?: CrocEnv;
}

export default function PoolLI(props: propsIF) {
    const {
        pool,
        chainId,
        handleClick,
        cachedPoolStatsFetch,
        cachedFetchTokenPrice,
        crocEnv,
    } = props;

    // hook to get volume and TVL for the current pool
    const poolStats: poolStatsIF = usePoolStats(
        pool,
        chainId,
        cachedPoolStatsFetch,
        cachedFetchTokenPrice,
        crocEnv,
    );

    return (
        <li
            className={styles.card_container}
            onClick={() => handleClick(pool.base, pool.quote)}
        >
            <p>
                {pool.baseSymbol ?? '--'} / {pool.quoteSymbol ?? '--'}
            </p>
            <p style={{ textAlign: 'center' }}>{poolStats.volume ?? '--'}</p>
            <p style={{ textAlign: 'center' }}>{poolStats.tvl ?? '--'}</p>
        </li>
    );
}
