import { TokenIF } from '../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
import styles from './RecentPools.module.css';
import RecentPoolsCard from './RecentPoolsCard';
// import { Link } from 'react-router-dom';
import { SmallerPoolIF } from '../../../../App/hooks/useRecentPools';

interface RecentPoolsProps {
    tradeData: tradeData;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    lastBlockNumber: number;
    getRecentPools: (count: number) => SmallerPoolIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
}

export default function RecentPools(props: RecentPoolsProps) {
    const { tradeData, chainId, lastBlockNumber, cachedPoolStatsFetch, getRecentPools, getTokenByAddress } = props;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </div>
            <div className={styles.content}>
                {getRecentPools(5).map((pool, idx) => (
                    <RecentPoolsCard
                        tradeData={tradeData}
                        chainId={chainId}
                        pool={pool}
                        key={idx}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        lastBlockNumber={lastBlockNumber}
                        getTokenByAddress={getTokenByAddress}
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
