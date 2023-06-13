import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function TopPools(props: propsIF) {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

    const { topPools, crocEnv } = useContext(CrocEnvContext);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </header>
            <div className={styles.content}>
                {topPools.map((pool, idx) => (
                    <TopPoolsCard
                        pool={pool}
                        key={idx}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                        crocEnv={crocEnv}
                    />
                ))}
            </div>
        </div>
    );
}
