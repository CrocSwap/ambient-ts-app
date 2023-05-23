import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function TopPools(props: propsIF) {
    const { cachedPoolStatsFetch } = props;

    const { topPools } = useContext(CrocEnvContext);

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
                    />
                ))}
            </div>
        </div>
    );
}
