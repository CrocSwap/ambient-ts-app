import styles from './TopTokensHeader.module.css';
export default function TopTokensHeader() {
    return (
        <div className={styles.container}>
            <p>#</p>
            <p>Name</p>
            <p>Price</p>
            <p>Price Change</p>
            <p>Volume (24h)</p>
            <p>TVL</p>
        </div>
    );
}
