import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { topPools } from '../../../../App/mockData';
import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard';
// import { Link } from 'react-router-dom';

interface TopPoolsProps {
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    lastBlockNumber: number;
}

export default function TopPools(props: TopPoolsProps) {
    const { chainId, lastBlockNumber, cachedPoolStatsFetch } = props;

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Volume</div>
            <div>TVL</div>
        </div>
    );

    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {topPools.map((item, idx) => (
                    <TopPoolsCard
                        pool={item}
                        key={idx}
                        chainId={chainId}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        lastBlockNumber={lastBlockNumber}
                        // lastBlockNumber={lastBlockNumber}
                    />
                ))}
            </div>
            {/* <Link className={styles.view_more} to='/analytics'>
                View More
            </Link> */}
        </div>
    );
}
