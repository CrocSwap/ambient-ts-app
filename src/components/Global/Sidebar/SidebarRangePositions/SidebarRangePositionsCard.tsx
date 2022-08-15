import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';

interface SidebarRangePositionsProps {
    isDenomBase: boolean;
    position: PositionIF;
}

export default function SidebarRangePositionsCard(props: SidebarRangePositionsProps) {
    const { isDenomBase, position } = props;
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
            : isDenomBase
            ? `${position?.lowRangeShortDisplayInBase}-${position?.highRangeShortDisplayInBase}`
            : `${position?.lowRangeShortDisplayInQuote}-${position?.highRangeShortDisplayInQuote}`;

    return (
        <div className={styles.container}>
            <div>
                {isDenomBase
                    ? `${position?.baseSymbol}/${position?.quoteSymbol}`
                    : `${position?.quoteSymbol}/${position?.baseSymbol}`}
            </div>
            <div>{rangeDisplay}</div>
            <div className={styles.status_display}>
                Qty
                {rangeStatusDisplay}
            </div>
        </div>
    );
}
