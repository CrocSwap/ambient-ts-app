import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import styles from './OpenOrderStatus.module.css';
interface CircularProgressBarProps {
    fillPercentage: number;
    radius?: number;
}
export default function CircularProgressBarForComments(
    props: CircularProgressBarProps,
) {
    const { fillPercentage } = props;
    const strokeWidth = 1.5; // Width of the border
    const radius = props.radius ? props.radius : 11; // Radius of the circle (half of the desired width/height)
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (fillPercentage / 100) * circumference;

    return (
        <DefaultTooltip
            title={`${props.fillPercentage}% Filled`}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <svg
                className={styles.circular_progress}
                width={radius * 2}
                height={radius * 2}
            >
                <circle
                    className={styles.circle_background}
                    cx={radius}
                    cy={radius}
                    r={radius - strokeWidth / 2}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className={styles.circle_fill}
                    cx={radius}
                    cy={radius}
                    r={radius - strokeWidth / 2}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
        </DefaultTooltip>
    );
}
