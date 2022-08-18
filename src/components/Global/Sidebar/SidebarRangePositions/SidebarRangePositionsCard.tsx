import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { SetStateAction, Dispatch } from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarRangePositionsProps {
    isDenomBase: boolean;
    position: PositionIF;

    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarRangePositionsCard(props: SidebarRangePositionsProps) {
    const location = useLocation();

    const { isDenomBase, position, setOutsideControl, setSelectedOutsideTab } = props;

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 0 : onAccountRoute ? 2 : 0;

    function handleRangePositionClick() {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
    }

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
        <div className={styles.container} onClick={handleRangePositionClick}>
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
