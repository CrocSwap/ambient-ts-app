import { TokenIF } from '../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
import styles from './RecentPools.module.css';
import RecentPoolsCard from './RecentPoolsCard';
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
    const {
        tradeData,
        chainId,
        lastBlockNumber,
        cachedPoolStatsFetch,
        getRecentPools,
        getTokenByAddress,
    } = props;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </header>
            <div className={styles.content}>
                {getRecentPools(5).map((pool) => (
                    <RecentPoolsCard
                        tradeData={tradeData}
                        chainId={chainId}
                        pool={pool}
                        key={'recent_pool_' + JSON.stringify(pool)}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        lastBlockNumber={lastBlockNumber}
                        getTokenByAddress={getTokenByAddress}
                    />
                ))}
            </div>
        </div>
    );
}
