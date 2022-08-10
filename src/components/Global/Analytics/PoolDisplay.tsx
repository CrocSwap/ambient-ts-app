import styles from './PoolDisplay.module.css';

interface TokenNameData {
    token0: string;
    token1: string;
}
export default function PoolDisplay(props: TokenNameData) {
    return (
        <section className={styles.account_pool_display}>
            {props.token0}/{props.token1}
        </section>
    );
}
