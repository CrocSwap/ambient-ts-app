import styles from './RangeMinMax.module.css';

export default function RangeMinMax() {
    return (
        <>
            <section className={styles.range_column}>
                <p>Min</p>
                <p>Max</p>
            </section>
            <section className={styles.range_sing}>
                <p>Min</p>
            </section>
            <section className={styles.range_sing}>
                <p>Max</p>
            </section>
        </>
    );
}
