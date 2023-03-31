import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF } from '../../../../utils/interfaces/exports';
import {
    getPositionValue,
    getRangeDisplay,
    getSymbols,
} from './functions/exports';

interface propsIF {
    isDenomBase: boolean;
    position: PositionIF;
    handleClick: (pos: PositionIF) => void;
}

export default function SidebarRangePositionsCard(props: propsIF) {
    const { isDenomBase, position, handleClick } = props;

    // human-readable string showing the tokens in the pool
    const pair = getSymbols(
        isDenomBase,
        position.baseSymbol,
        position.quoteSymbol,
    );

    // human-readable string indicating the range display
    const [rangeDisplay, rangeStatusStyle] = getRangeDisplay(
        position,
        isDenomBase,
    );

    // human-readable string showing total value of the position
    const value = getPositionValue(position.totalValueUSD);

    const ariaLabel = ` ${rangeDisplay} position for ${pair}. 
    ${value && `position value is ${value}.`}`;

    return (
        <button
            className={styles.container}
            onClick={() => handleClick(position)}
            tabIndex={0}
            aria-label={ariaLabel}
        >
            <div>{pair}</div>
            <div>
                {rangeDisplay}
                <div className={styles.range_status_container}>
                    <div className={rangeStatusStyle}>
                        <div className={styles.inner_circle_2}></div>
                    </div>
                </div>
            </div>
            <div className={styles.status_display}>{value}</div>
        </button>
    );
}
