import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';

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
            : `${position?.lowRangeDisplayInBase}-${position?.highRangeDisplayInBase}`;

    return (
        <div className={styles.container}>
            <div>
                {position?.baseSymbol}/{position?.quoteSymbol}
            </div>
            <div>{rangeDisplay}</div>
            <div className={styles.status_display}>
                Qty
                {rangeStatusDisplay}
            </div>
        </div>
    );
}
