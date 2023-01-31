import styles from './SidebarLimitOrdersCard.module.css';
import { SetStateAction, Dispatch } from 'react';
import { useNavigate } from 'react-router-dom';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import { getLimitPrice } from './functions/getLimitPrice';
import { getLimitValue } from './functions/getLimitValue';

interface propsIF {
    isDenomBase: boolean;
    tokenMap: Map<string, TokenIF>;
    chainId: string;
    order: LimitOrderIF;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrdersCard(props: propsIF) {
    const {
        tokenMap,
        chainId,
        order,
        setIsShowAllEnabled,
        setOutsideControl,
        setCurrentPositionActive,
        setSelectedOutsideTab,
        isDenomBase,
    } = props;

    // human-readable limit price to display in the DOM
    const price = getLimitPrice(order, tokenMap, isDenomBase);

    // human-readable limit order value to display in the DOM
    const value = getLimitValue(order);

    const navigate = useNavigate();

    function handleLimitOrderClick() {
        setOutsideControl(true);
        setSelectedOutsideTab(1);
        setCurrentPositionActive(order.limitOrderIdentifier);
        setIsShowAllEnabled(false);
        navigate(
            '/trade/limit/chain=' +
            chainId +
            '&tokenA=' +
            order.base +
            '&tokenB=' +
            order.quote
        );
    }

    return (
        <div className={styles.container} onClick={handleLimitOrderClick}>
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
