import styles from './TopTokens.module.css';
import TopTokensCard from './TopTokensCard';
import { topTokens } from '../../../../App/mockData';
// import { Link } from 'react-router-dom';

interface TopTokensProps {
    chainId: string;
    lastBlockNumber: number;
}

export default function TopTokens(props: TopTokensProps) {
    const { chainId } = props;

    const header = (
        <div className={styles.header}>
            <div>Token</div>
            <div>Price</div>
            <div>24h Δ</div>
        </div>
    );

    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {topTokens.map((item, idx) => (
                    <TopTokensCard
                        key={idx}
                        chainId={chainId}
                        pool={item}
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
