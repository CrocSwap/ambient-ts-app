import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import styles from '../SidebarTable.module.css';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import PoolListItem from '../PoolListItem/PoolListItem';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function TopPools(props: propsIF) {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

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
                    <PoolListItem
                        pool={pool}
                        key={idx}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                    />
                ))}
            </div>
        </div>
    );
}
