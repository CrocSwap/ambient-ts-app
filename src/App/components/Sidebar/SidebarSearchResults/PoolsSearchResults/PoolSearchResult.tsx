import styles from '../SidebarSearchResults.module.css';
import { PoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { TokenPriceFn } from '../../../../functions/fetchTokenPrice';
import { CrocEnv } from '@crocswap-libs/sdk';
import { usePoolStats } from '../../../../hooks/usePoolStats';

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
    const [volume, tvl] = usePoolStats(
        pool,
        undefined,
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
            <p style={{ textAlign: 'center' }}>{volume}</p>
            <p style={{ textAlign: 'center' }}>{tvl}</p>
        </li>
    );
}
