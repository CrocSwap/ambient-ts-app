import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';

// import { toDisplayQty } from '@crocswap-libs/sdk';
import {
    //  useEffect, useState,
    SetStateAction,
    Dispatch,
} from 'react';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
// import { formatAmount } from '../../../../utils/numbers';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';

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

    tabToSwitchToBasedOnRoute: number;
}

export default function SidebarRangePositionsCard(props: SidebarRangePositionsProps) {
    const {
        tokenMap,
        isDenomBase,
        position,
        setOutsideControl,
        setSelectedOutsideTab,
        // currentPositionActive,
        setCurrentPositionActive,
        setIsShowAllEnabled,

        tabToSwitchToBasedOnRoute,
    } = props;

    const dispatch = useAppDispatch();

    const baseId = position.base + '_' + position.chainId;
    const quoteId = position.quote + '_' + position.chainId;

    const baseToken = tokenMap ? tokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = tokenMap ? tokenMap.get(quoteId.toLowerCase()) : null;

    // const onTradeRoute = location.pathname.includes('trade');
    // const onAccountRoute = location.pathname.includes('account');

    // const tabToSwitchToBasedOnRoute = onTradeRoute ? 2 : onAccountRoute ? 2 : 0;

    function handleRangePositionClick(pos: PositionIF) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setCurrentPositionActive(pos.positionStorageSlot);
        setIsShowAllEnabled(false);
        if (baseToken) dispatch(setTokenA(baseToken));
        if (quoteToken) dispatch(setTokenB(quoteToken));
    }

    const liqTotalUSD =
        '$' +
        position.positionLiqTotalUSD.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const rangeStatusStyle =
        position.positionType === 'ambient'
            ? styles.inner_circle_ambient
            : position.isPositionInRange
            ? styles.inner_circle_positive
            : styles.inner_circle_negative;

    const rangeStatusDisplay = (
        <div className={styles.range_status_container}>
            <div className={rangeStatusStyle}>
                <div className={styles.inner_circle_2}></div>
            </div>
        </div>
    );

    const baseTokenCharacter = position?.baseSymbol
        ? getUnicodeCharacter(position?.baseSymbol)
        : '';
    const quoteTokenCharacter = position?.quoteSymbol
        ? getUnicodeCharacter(position?.quoteSymbol)
        : '';

    const rangeDisplay =
        position?.positionType === 'ambient'
            ? 'ambient'
            : isDenomBase
            ? `${quoteTokenCharacter}${position?.lowRangeShortDisplayInBase}-${quoteTokenCharacter}${position?.highRangeShortDisplayInBase}`
            : `${baseTokenCharacter}${position?.lowRangeShortDisplayInQuote}-${baseTokenCharacter}${position?.highRangeShortDisplayInQuote}`;

    return (
        <div className={styles.container} onClick={() => handleRangePositionClick(position)}>
            <div>
                {isDenomBase
                    ? `${position?.baseSymbol}/${position?.quoteSymbol}`
                    : `${position?.quoteSymbol}/${position?.baseSymbol}`}
            </div>
            <div>
                {rangeDisplay}
                {rangeStatusDisplay}
            </div>
            <div className={styles.status_display}>{liqTotalUSD}</div>
        </div>
    );
}
