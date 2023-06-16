import { PositionIF } from '../../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import styles from '../SidebarRangePositionsCard.module.css';

export const getRangeDisplay = (
    position: PositionIF,
    isDenomBase: boolean,
): [string, string] => {
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
            ? `${quoteTokenCharacter}${position?.lowRangeDisplayInBase}-${quoteTokenCharacter}${position?.highRangeDisplayInBase}`
            : `${baseTokenCharacter}${position?.lowRangeDisplayInQuote}-${baseTokenCharacter}${position?.highRangeDisplayInQuote}`;

    const rangeStatusStyle =
        position.positionType === 'ambient'
            ? styles.inner_circle_ambient
            : position.isPositionInRange
            ? styles.inner_circle_positive
            : styles.inner_circle_negative;

    return [rangeDisplay, rangeStatusStyle];
};
