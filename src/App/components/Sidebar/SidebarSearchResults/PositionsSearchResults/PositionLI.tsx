import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../../../../utils/numbers';

interface propsIF {
    position: PositionIF;
    isDenomBase: boolean;
}

export default function PositionLI(props: propsIF) {
    const { position, isDenomBase } = props;

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
        <div className={styles.card_container}>
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