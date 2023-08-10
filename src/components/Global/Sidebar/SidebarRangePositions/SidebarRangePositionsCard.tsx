import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF } from '../../../../utils/interfaces/exports';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import { getSymbols } from '../../../../App/functions/getSymbols';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';

interface propsIF {
    position: PositionIF;
    handleClick: (pos: PositionIF) => void;
}

export default function SidebarRangePositionsCard(props: propsIF) {
    const { position, handleClick } = props;
    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    // human-readable string showing the tokens in the pool
    const pair = getSymbols(
        isDenomBase,
        position.baseSymbol,
        position.quoteSymbol,
    );

    const getRangeDisplay = (
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

    // human-readable string indicating the range display
    const [rangeDisplay, rangeStatusStyle] = getRangeDisplay(
        position,
        isDenomBase,
    );

    // human-readable string showing total value of the position
    const value = getFormattedNumber({
        value: position.totalValueUSD,
        prefix: '$',
    });

    return (
        <div className={styles.container} onClick={() => handleClick(position)}>
            <div>{pair}</div>
            <div>{rangeDisplay}</div>
            <div className={styles.status_display}>{value}</div>
            <div>
                <div className={styles.range_status_container}>
                    <div className={rangeStatusStyle}>
                        <div className={styles.inner_circle_2}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
