import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import { getRangeDisplay, getValueUSD } from './functions/exports';

interface propsIF {
    position: PositionIF;
    isDenomBase: boolean;
    handleClick: (position: PositionIF) => void;
}

export default function PositionLI(props: propsIF) {
    const { position, isDenomBase, handleClick } = props;

    // fn to generate human-readable range output (from X to Y)
    const rangeDisplay = getRangeDisplay(position, isDenomBase);

    // fn to generate human-readable version of total position value
    const positionValue = getValueUSD(position.totalValueUSD);

    return (
        <div className={styles.card_container} onClick={() => handleClick(position)}>
            <div>
                {isDenomBase
                    ? `${position?.baseSymbol} / ${position?.quoteSymbol}`
                    : `${position?.quoteSymbol} / ${position?.baseSymbol}`}
            </div>
            <div>{rangeDisplay}</div>
            <div>{'$' + positionValue}</div>
        </div>
    );
}
