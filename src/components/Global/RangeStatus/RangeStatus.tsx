import styles from './RangeStatus.module.css';

interface RangeStatusProps {
    isInRange: boolean;
    isAmbient: boolean;
}

export default function RangeStatus(props: RangeStatusProps) {
    const { isInRange, isAmbient } = props;
    return (
        <div className={styles.in_range_display}>
            <div className={styles.range_container}>
                <span
                    className={isInRange ? styles.range_text_positive : styles.range_text_negative}
                />
            </div>
            {isAmbient ? 'Always In Range' : isInRange ? 'In Range' : 'Out of Range'}
        </div>
    );
}
