import styles from './RangeStatus.module.css';

interface RangeStatusProps {
    isInRange: boolean;
}

export default function RangeStatus(props: RangeStatusProps) {
    const { isInRange } = props;
    return (
        <div className={styles.in_range_display}>
            <span className={isInRange ? styles.range_text_positive : styles.range_text_negative}>
                {isInRange ? 'In Range' : 'Out of Range'}
            </span>
        </div>
    );
}
