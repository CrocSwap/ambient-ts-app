import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { topPools } from '../../../../App/mockData';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
import styles from './RecentPools.module.css';
import RecentPoolsCard from './RecentPoolsCard';
// import { Link } from 'react-router-dom';

interface RecentPoolsProps {
    tradeData: tradeData;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    lastBlockNumber: number;
}

export default function RecentPools(props: RecentPoolsProps) {
    const { tradeData, chainId, lastBlockNumber, cachedPoolStatsFetch } = props;

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
                    <RecentPoolsCard
                        tradeData={tradeData}
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
