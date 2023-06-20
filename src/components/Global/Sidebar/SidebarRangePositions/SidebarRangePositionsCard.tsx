import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF } from '../../../../utils/interfaces/exports';
import { getRangeDisplay, getSymbols } from './functions/exports';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { getFormattedTokenBalance } from '../../../../App/functions/getFormattedTokenBalance';

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

    // human-readable string indicating the range display
    const [rangeDisplay, rangeStatusStyle] = getRangeDisplay(
        position,
        isDenomBase,
    );

    // human-readable string showing total value of the position
    const value = getFormattedTokenBalance({
        balance: position.totalValueUSD,
        prefix: '$',
    });

    return (
        <div className={styles.container} onClick={() => handleClick(position)}>
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
        </div>
    );
}
