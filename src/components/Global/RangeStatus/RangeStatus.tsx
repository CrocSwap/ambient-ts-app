import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import styles from './RangeStatus.module.css';

interface RangeStatusProps {
    isInRange: boolean;
    isAmbient: boolean;
    isEmpty: boolean;
    fullText?: boolean;
    justSymbol?: boolean;
}

export default function RangeStatus(props: RangeStatusProps) {
    const { isInRange, isAmbient, fullText, isEmpty } = props;

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
            <div className={styles.range_text_ambient} />
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
            <div className={styles.non_filled} />
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
                className={
                    isInRange
                        ? styles.range_text_positive
                        : styles.range_text_negative
                }
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
