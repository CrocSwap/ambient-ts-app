import styles from './TopTokensCard.module.css';

interface TopTokensCardProps {
    chainId: string;
}

export default function TopTokensCard(props: TopTokensCardProps) {
    const { chainId } = props;
    return (
        <div className={styles.container}>
            <div>{chainId}</div>
            <div>Price</div>
            <div>Gain</div>
        </div>
    );
}
