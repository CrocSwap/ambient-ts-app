import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF, TokenIF } from '../../../../utils/interfaces/exports';
import { useMemo, SetStateAction, Dispatch } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../../../utils/numbers';

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
        // tokenMap,
        isDenomBase,
        position,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
        tabToSwitchToBasedOnRoute,
    } = props;

    // const getToken = (addr: string) => tokenMap.get(addr.toLowerCase()) as TokenIF;
    // const baseToken = getToken(position.base + '_' + position.chainId);
    // const quoteToken = getToken(position.quote + '_' + position.chainId);

    const { pathname } = useLocation();

    const linkPath = useMemo(() => {
        let locationSlug = '';
        if (pathname.startsWith('/trade/market') || pathname.startsWith('/account')) {
            locationSlug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            locationSlug = '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            locationSlug = '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            locationSlug = '/swap';
        }
        return locationSlug + '/chain=0x5&tokenA=' + position.base + '&tokenB=' + position.quote;
    }, [pathname]);

    const navigate = useNavigate();

    function handleRangePositionClick(pos: PositionIF) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setCurrentPositionActive(pos.positionStorageSlot);
        setIsShowAllEnabled(false);
        navigate(linkPath);
    }

    const usdValueNum = position.totalValueUSD;

    const usdValueTruncated = !usdValueNum
        ? '0.00'
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 10000
        ? formatAmountOld(usdValueNum, 1)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    // const liqTotalUSD =
    //     '$' +
    //     position.positionLiqTotalUSD.toLocaleString(undefined, {
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2,
    //     });

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
            <div className={styles.status_display}>{'$' + usdValueTruncated}</div>
        </div>
    );
}
