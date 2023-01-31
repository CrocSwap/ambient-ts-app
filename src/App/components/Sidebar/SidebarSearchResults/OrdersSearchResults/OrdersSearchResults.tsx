import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import LimitOrderLI from './LimitOrderLI';
import styles from '../SidebarSearchResults.module.css';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    chainId: string;
    searchedLimitOrders: LimitOrderIF[];
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>,
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>,
    setCurrentPositionActive: Dispatch<SetStateAction<string>>,
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>
}

export default function OrdersSearchResults(props: propsIF) {
    const {
        chainId,
        searchedLimitOrders,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled
    } = props;

    const navigate = useNavigate();

    const handleClick = (limitOrder: LimitOrderIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(1);
        setCurrentPositionActive(limitOrder.limitOrderIdentifier);
        setIsShowAllEnabled(false);
        navigate(
            '/trade/limit/chain=' +
            chainId +
            '&tokenA=' +
            limitOrder.base +
            '&tokenB=' +
            limitOrder.quote
        );
    }

    return (
        <div>
            <div className={styles.card_title}>My Limit Orders</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Price</div>
                <div>Value</div>
            </div>
            {
                searchedLimitOrders.slice(0,4).map((limitOrder: LimitOrderIF) => (
                    <LimitOrderLI
                        key={`order-search-result-${JSON.stringify(limitOrder)}`}
                        limitOrder={limitOrder}
                        isDenomBase={isDenomBase}
                        handleClick={handleClick}
                    />
                ))
            }
        </div>
    );
}
