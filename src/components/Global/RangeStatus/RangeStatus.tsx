import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import styles from './RangeStatus.module.css';

interface propsIF {
    isInRange: boolean;
    isAmbient: boolean;
    isEmpty: boolean;
    fullText?: boolean;
    justSymbol?: boolean;
    size?: 's' | 'l';
}

export default function RangeStatus(props: propsIF) {
    const { isInRange, isAmbient, fullText, isEmpty, size = 'l' } = props;

    const fullTextDisplay = fullText ? 'Out of Range' : 'Out of Range';

    const ambientWithTooltip = (
        <DefaultTooltip
            interactive
            title={'ambient'}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div
                className={`${styles.range_text_ambient} ${
                    size === 's' ? styles.small : styles.large
                }`}
            />
        </DefaultTooltip>
    );
    const emptyWithTooltip = (
        <DefaultTooltip
            interactive
            title={'Empty'}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div
                className={`${styles.non_filled} ${
                    size === 's' ? styles.small : styles.large
                }`}
            />
        </DefaultTooltip>
    );
    const rangeWithTooltip = (
        <DefaultTooltip
            interactive
            title={isInRange ? 'In Range' : 'Out of Range'}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <span
                className={`${
                    isInRange
                        ? styles.range_text_positive
                        : styles.range_text_negative
                }
                        ${size === 's' ? styles.small : styles.large}`}
            />
        </DefaultTooltip>
    );

    const symbolOnlyDisplay = (
        <div
            className={`${styles.range_container} ${styles.symbol_only_display}`}
        >
            {isAmbient
                ? ambientWithTooltip
                : isEmpty
                ? emptyWithTooltip
                : rangeWithTooltip}
        </div>
    );

    const rangeDisplay = (
        <div className={styles.in_range_display}>
            <div className={styles.range_container}>
                {isAmbient
                    ? ambientWithTooltip
                    : isEmpty
                    ? emptyWithTooltip
                    : rangeWithTooltip}
            </div>
            <p>
                {isAmbient
                    ? 'Ambient'
                    : isInRange
                    ? 'In Range'
                    : fullTextDisplay}
            </p>
        </div>
    );

    return <>{props.justSymbol ? symbolOnlyDisplay : rangeDisplay}</>;
}
