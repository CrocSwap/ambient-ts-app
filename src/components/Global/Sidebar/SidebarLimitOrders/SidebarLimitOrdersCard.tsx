import styles from './SidebarLimitOrdersCard.module.css';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import { getLimitPrice, getLimitValue } from './functions/exports';

interface propsIF {
    isDenomBase: boolean;
    tokenMap: Map<string, TokenIF>;
    order: LimitOrderIF;
    handleClick: (limitOrder: LimitOrderIF) => void;
}
export default function SidebarLimitOrdersCard(props: propsIF) {
    const { tokenMap, order, isDenomBase, handleClick } = props;

    // human-readable limit price to display in the DOM
    const price = getLimitPrice(order, tokenMap, isDenomBase);

    // human-readable limit order value to display in the DOM
    const value = getLimitValue(order);

    const orderTokens = isDenomBase
        ? `${order?.baseSymbol}/${order?.quoteSymbol}`
        : `${order?.quoteSymbol}/${order?.baseSymbol}`;

    const ariaLabel = `Limit Order for ${orderTokens}. ${
        price && ` order price is ${price}`
    }. ${value && `order value is ${value}.`}`;

    return (
        <button
            className={styles.container}
            onClick={() => handleClick(order)}
            aria-label={ariaLabel}
            tabIndex={0}
        >
            <div>{orderTokens}</div>
            <div>{price}</div>
            <div className={styles.status_display}>{value}</div>
        </button>
    );
}
