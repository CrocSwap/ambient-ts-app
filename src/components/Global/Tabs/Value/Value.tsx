import styles from './Value.module.css';

interface ValueProps {
    usdValue: number | string;
}

export default function Value(props: ValueProps) {
    return (
        <>
            <section className={styles.range_column}>
                <p>{props.usdValue}</p>
            </section>
            <section className={styles.range_sing}>
                <p>{props.usdValue}</p>
            </section>
        </>
    );
}
