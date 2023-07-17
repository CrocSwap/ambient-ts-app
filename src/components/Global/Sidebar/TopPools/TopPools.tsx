import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import styles from '../SidebarTable.module.css';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import PoolListItem from '../PoolListItem/PoolListItem';
import { useLinkGen } from '../../../../utils/hooks/useLinkGen';
import { useLocation } from 'react-router-dom';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function TopPools(props: propsIF) {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

    const { topPools } = useContext(CrocEnvContext);
    const location = useLocation();
    const onExploreRoute = location.pathname.includes('explore');

    const linkGenExplore = useLinkGen('explore');

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
                {onExploreRoute ? undefined : (
                    <div
                        className={styles.view_more}
                        onClick={() => linkGenExplore.navigate()}
                    >
                        View More
                    </div>
                )}
            </div>
        </div>
    );
}
