import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';

interface propsIF {
    position: PositionIF;
    isDenomBase: boolean;
}

export default function PositionLI(props: propsIF) {
    const { position, isDenomBase } = props;

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
        <div className={styles.card_container}>
            <div>Pool</div>
            <div>{rangeDisplay}</div>
            <div>Qty</div>
        </div>
    );
}