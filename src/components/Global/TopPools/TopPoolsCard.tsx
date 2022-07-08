import styles from './TopPoolsCard.module.css';

export default function TopPoolsCard() {
    return (
        <div className={styles.container}>
            <div>Pool</div>
            <div>Volume</div>
            <div>TVL</div>
        </div>
    );
}
