import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { topPools } from '../../../../App/mockData';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard';
// import { Link } from 'react-router-dom';
import { TempPoolIF } from '../../../../utils/interfaces/exports';

interface propsIF {
    tradeData: tradeData;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    lastBlockNumber: number;
    poolList: TempPoolIF[];
}

export default function TopPools(props: propsIF) {
    const { tradeData, chainId, lastBlockNumber, cachedPoolStatsFetch, poolList } = props;
    false && poolList;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </header>
            <div className={styles.content}>
                {topPools.map((item, idx) => (
                    <TopPoolsCard
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
