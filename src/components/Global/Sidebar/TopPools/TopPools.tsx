import { topPools } from '../../../../App/mockData';
import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard';

interface TopPoolsProps {
    chainId: string;
    lastBlockNumber: number;
}

export default function TopPools(props: TopPoolsProps) {
    const { chainId, lastBlockNumber } = props;

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
                        lastBlockNumber={lastBlockNumber}
                    />
                ))}
            </div>
        </div>
    );
}
