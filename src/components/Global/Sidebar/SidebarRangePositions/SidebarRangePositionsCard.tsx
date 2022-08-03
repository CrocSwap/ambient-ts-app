import { PositionIF } from '../../../../utils/state/graphDataSlice';
import styles from './SidebarRangePositionsCard.module.css';

interface SidebarRangePositionsProps {
    position: PositionIF;
}

export default function SidebarRangePositionsCard(props: SidebarRangePositionsProps) {
    const { position } = props;
    const rangeStatusDisplay = (
        <div className={styles.range_status_container}>
            <div className={styles.inner_circle_1}>
                <div className={styles.inner_circle_2}></div>
            </div>
        </div>
    );

    const rangeDisplay =
        position?.positionType === 'ambient'
            ? 'ambient'
            : `${position?.bidTick}/${position?.askTick}`;

    return (
        <div className={styles.container}>
            <div>
                {position?.baseTokenSymbol}/{position?.quoteTokenSymbol}
            </div>
            <div>{rangeDisplay}</div>
            <div className={styles.status_display}>
                Qty
                {rangeStatusDisplay}
            </div>
        </div>
    );
}
