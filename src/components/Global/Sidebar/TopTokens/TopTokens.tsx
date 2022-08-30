import styles from './TopTokens.module.css';
import TopTokensCard from './TopTokensCard';
import { topTokens } from '../../../../App/mockData';

interface TopTokensProps {
    chainId: string;
}

export default function TopTokens(props: TopTokensProps) {
    const { chainId } = props;

    const header = (
        <div className={styles.header}>
            <div>Token</div>
            <div>Price</div>
            <div>Change</div>
        </div>
    );

    // const mapItems = [1, 2, 3, 4, 5, 6, 7];
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {topTokens.map((item, idx) => (
                    <TopTokensCard key={idx} chainId={chainId} pool={item} />
                ))}
            </div>
        </div>
    );
}
