import styles from './RangeMinMax.module.css';

interface RangeMinMaxprops {
    min: number | string;
    max: number | string;
}

export default function RangeMinMax(props: RangeMinMaxprops) {
    return (
        <>
            <section className={styles.range_column}>
                <p>{props.min}</p>
                <p>{props.max}</p>
            </section>
            <section className={styles.range_sing}>
                <p>{props.min}</p>
            </section>
            <section className={styles.range_sing}>
                <p>{props.max}</p>
            </section>
        </>
    );
}
