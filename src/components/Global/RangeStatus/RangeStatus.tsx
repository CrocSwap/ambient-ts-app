import styles from './RangeStatus.module.css';

interface RangeStatusProps {
    isInRange: boolean;
    isAmbient: boolean;
    fullText?: boolean;
    justSymbol?: boolean;
}

export default function RangeStatus(props: RangeStatusProps) {
    const { isInRange, isAmbient, fullText } = props;

    const fullTextDisplay = fullText ? 'Out of Range' : 'Out of Rng';

    const symbolOnlyDisplay = (
        <div className={`${styles.range_container} ${styles.symbol_only_display}`}>
            {isAmbient ? (
                <div className={styles.range_text_ambient} />
            ) : (
                <span
                    className={isInRange ? styles.range_text_positive : styles.range_text_negative}
                />
            )}
        </div>
    );

    const ambientRange = <div className={styles.range_text_ambient} />;
    const nonAmbientRange = (
        <div className={isInRange ? styles.range_text_positive : styles.range_text_negative} />
    );

    const rangeDisplay = (
        <div className={styles.in_range_display}>
            <div className={styles.range_container}>
                {isAmbient ? ambientRange : nonAmbientRange}
            </div>
            <p>{isAmbient ? 'Ambient' : isInRange ? 'In Range' : fullTextDisplay}</p>
        </div>
    );

    return (
        <>
            {' '}
            {/* {symbolOnlyDisplay} */}
            {/* {rangeDisplay} */}
            {props.justSymbol ? symbolOnlyDisplay : rangeDisplay}
        </>
    );
}
