import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard';
import { TempPoolIF } from '../../../../utils/interfaces/exports';
import { topPoolIF } from '../../../../App/hooks/useTopPools';

interface propsIF {
    tradeData: tradeData;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    lastBlockNumber: number;
    poolList: TempPoolIF[];
    topPools: topPoolIF[];
}

export default function TopPools(props: propsIF) {
    const {
        tradeData,
        chainId,
        lastBlockNumber,
        cachedPoolStatsFetch,
        topPools,
    } = props;

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
                        tradeData={tradeData}
                        pool={pool}
                        key={idx}
                        chainId={chainId}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        lastBlockNumber={lastBlockNumber}
                    />
                ))}
            </div>
        </div>
    );
}
