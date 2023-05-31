import styles from './SidebarLimitOrdersCard.module.css';
import { LimitOrderIF } from '../../../../utils/interfaces/exports';
import { getLimitPrice, getLimitValue } from './functions/exports';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useContext } from 'react';
import { TokenContext } from '../../../../contexts/TokenContext';

interface propsIF {
    order: LimitOrderIF;
    handleClick: (limitOrder: LimitOrderIF) => void;
}
export default function SidebarLimitOrdersCard(props: propsIF) {
    const { order, handleClick } = props;
    const { tokens } = useContext(TokenContext);
    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    // human-readable limit price to display in the DOM
    const price = getLimitPrice(order, tokens, isDenomBase);

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
