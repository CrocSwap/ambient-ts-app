import styles from './ProgressBar.module.css';
interface ProgressBarProps {
    value: number; // percentage value from 0 to 100
}
export default function ProgressBar(props: ProgressBarProps) {
    const { value } = props;

    return (
        <div className={styles.progressBarContainer}>
            <div
                className={styles.progressBarFill}
                style={{ width: `${value}%` }}
            ></div>
        </div>
    );
}
