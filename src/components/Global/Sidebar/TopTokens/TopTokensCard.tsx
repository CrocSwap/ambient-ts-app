import styles from './TopTokensCard.module.css';

export default function TopTokensCard() {
    return (
        <div className={styles.container}>
            <div>Pool</div>
            <div>Price</div>
            <div>Gain</div>
        </div>
    );
}
