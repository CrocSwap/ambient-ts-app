import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';

import { useLocation } from 'react-router-dom';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { useEffect, useState, SetStateAction, Dispatch } from 'react';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
import { formatAmount } from '../../../../utils/numbers';

interface SidebarRangePositionsProps {
    isDenomBase: boolean;
    position: PositionIF;
    tokenMap: Map<string, TokenIF>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;

    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
}

export default function SidebarRangePositionsCard(props: SidebarRangePositionsProps) {
    const location = useLocation();

    const {
        tokenMap,
        isDenomBase,
        position,
        setOutsideControl,
        setSelectedOutsideTab,
        // currentPositionActive,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const dispatch = useAppDispatch();

    const baseId = position.base + '_' + position.chainId;
    const quoteId = position.quote + '_' + position.chainId;

    const baseToken = tokenMap ? tokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = tokenMap ? tokenMap.get(quoteId.toLowerCase()) : null;

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 0 : onAccountRoute ? 2 : 0;

    function handleRangePositionClick(pos: PositionIF) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setCurrentPositionActive(pos.id);
        setIsShowAllEnabled(false);
        if (baseToken) dispatch(setTokenA(baseToken));
        if (quoteToken) dispatch(setTokenB(quoteToken));
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
                baseLiqDisplayNum === 0
                    ? '0'
                    : baseLiqDisplayNum < 0.0001
                    ? baseLiqDisplayNum.toExponential(2)
                    : baseLiqDisplayNum < 2
                    ? baseLiqDisplayNum.toPrecision(3)
                    : baseLiqDisplayNum >= 100000
                    ? formatAmount(baseLiqDisplayNum)
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
                quoteLiqDisplayNum === 0
                    ? '0'
                    : quoteLiqDisplayNum < 0.0001
                    ? quoteLiqDisplayNum.toExponential(2)
                    : quoteLiqDisplayNum < 2
                    ? quoteLiqDisplayNum.toPrecision(3)
                    : quoteLiqDisplayNum >= 100000
                    ? formatAmount(quoteLiqDisplayNum)
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
        <div className={styles.container} onClick={() => handleRangePositionClick(position)}>
            <div>
                {isDenomBase
                    ? `${position?.baseSymbol}/${position?.quoteSymbol}`
                    : `${position?.quoteSymbol}/${position?.baseSymbol}`}
            </div>
            <div>{rangeDisplay}</div>
            <div className={styles.status_display}>
                {`${baseLiquidityDisplay || '… '}/${quoteLiquidityDisplay || '…'}`}
                {rangeStatusDisplay}
            </div>
        </div>
    );
}
