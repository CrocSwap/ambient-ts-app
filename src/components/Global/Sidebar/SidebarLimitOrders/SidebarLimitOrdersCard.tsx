import styles from './SidebarLimitOrdersCard.module.css';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import { getLimitPrice, getLimitValue } from './functions/exports';

interface propsIF {
    isDenomBase: boolean;
    tokenMap: Map<string, TokenIF>;
    order: LimitOrderIF;
    handleClick: (limitOrder: LimitOrderIF) => void
}
export default function SidebarLimitOrdersCard(props: propsIF) {
    const {
        tokenMap,
        order,
        isDenomBase,
        handleClick
    } = props;

    // human-readable limit price to display in the DOM
    const price = getLimitPrice(order, tokenMap, isDenomBase);

    // human-readable limit order value to display in the DOM
    const value = getLimitValue(order);

    return (
        <div className={styles.container} onClick={() => handleClick(order)}>
            <div>
                {isDenomBase
                    ? `${order?.baseSymbol}/${order?.quoteSymbol}`
                    : `${order?.quoteSymbol}/${order?.baseSymbol}`}
            </div>
            <div>{price}</div>
            <div className={styles.status_display}>{value}</div>
        </div>
    );
}
