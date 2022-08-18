import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { useLocation } from 'react-router-dom';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { useEffect, useState, SetStateAction, Dispatch } from 'react';

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

    const [baseLiquidityDisplay, setBaseLiquidityDisplay] = useState<string | undefined>(undefined);
    const [quoteLiquidityDisplay, setQuoteLiquidityDisplay] = useState<string | undefined>(
        undefined,
    );

    useEffect(() => {
        if (position.positionLiqBase && position.baseTokenDecimals) {
            const baseLiqDisplayNum = parseFloat(
                toDisplayQty(position.positionLiqBase, position.baseTokenDecimals),
            );
            const baseLiqDisplayTruncated =
                baseLiqDisplayNum < 0.0001
                    ? baseLiqDisplayNum.toExponential(2)
                    : baseLiqDisplayNum < 2
                    ? baseLiqDisplayNum.toPrecision(3)
                    : baseLiqDisplayNum >= 1000000
                    ? baseLiqDisplayNum.toExponential(2)
                    : baseLiqDisplayNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            setBaseLiquidityDisplay(baseLiqDisplayTruncated);
        }
        if (position.positionLiqQuote && position.quoteTokenDecimals) {
            const quoteLiqDisplayNum = parseFloat(
                toDisplayQty(position.positionLiqQuote, position.quoteTokenDecimals),
            );
            const quoteLiqDisplayTruncated =
                quoteLiqDisplayNum < 0.0001
                    ? quoteLiqDisplayNum.toExponential(2)
                    : quoteLiqDisplayNum < 2
                    ? quoteLiqDisplayNum.toPrecision(3)
                    : quoteLiqDisplayNum >= 1000000
                    ? quoteLiqDisplayNum.toExponential(2)
                    : quoteLiqDisplayNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            setQuoteLiquidityDisplay(quoteLiqDisplayTruncated);
        }
    }, [JSON.stringify(position)]);

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
                {`${baseLiquidityDisplay}/${quoteLiquidityDisplay}`}
                {rangeStatusDisplay}
            </div>
        </div>
    );
}
