import styles from './TopTokens.module.css';

export default function TopTokens() {
    return (
        <div className={styles.container}>
            <div>Pool</div>
            <div>Price</div>
            <div>Change</div>
        </div>
    );
}
