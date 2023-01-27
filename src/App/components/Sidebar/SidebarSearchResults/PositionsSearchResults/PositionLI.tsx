import { Dispatch, SetStateAction, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../../../../utils/numbers';

interface propsIF {
    position: PositionIF;
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function PositionLI(props: propsIF) {
    const {
        position,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const { pathname } = useLocation();
    const navigate = useNavigate();

    const linkPath = useMemo<string>(() => {
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

    function handleRangePositionClick(pos: PositionIF) {
        setOutsideControl(true);
        setSelectedOutsideTab(2);
        setCurrentPositionActive(pos.positionStorageSlot);
        setIsShowAllEnabled(false);
        navigate(linkPath);
    }

    // TODO:   @Junior  please reference SidebarRangePositionsCard.tsx and port
    // TODO:   ... the code for `rangeStatusDisplay` including styling to this
    // TODO:   ... this component and a corresponding CSS module

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

            

    return (
        <div className={styles.card_container} onClick={() => handleRangePositionClick(position)}>
            <div>
                {
                    isDenomBase
                        ? `${position?.baseSymbol} / ${position?.quoteSymbol}`
                        : `${position?.quoteSymbol} / ${position?.baseSymbol}`
                }
            </div>
            <div>{rangeDisplay}</div>
            <div>{'$' + usdValueTruncated}</div>
        </div>
    );
}