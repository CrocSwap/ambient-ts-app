import { Dispatch, SetStateAction } from 'react';
import LimitOrderLI from './LimitOrderLI';
import styles from '../SidebarSearchResults.module.css';
import { useClick } from './hooks/useClick';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';

interface OrdersSearchResultPropsIF {
    searchedLimitOrders: LimitOrderIF[];
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function OrdersSearchResults(props: OrdersSearchResultPropsIF) {
    const {
        searchedLimitOrders,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const handleClick = useClick(
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    );

    return (
        <div>
            <div className={styles.card_title}>My Limit Orders</div>
            {searchedLimitOrders.length ? (
                <>
                    <div className={styles.header}>
                        <div>Pool</div>
                        <div>Price</div>
                        <div>Value</div>
                    </div>
                    <div className={styles.main_result_container}>
                        {searchedLimitOrders.slice(0, 4).map((limitOrder: LimitOrderIF) => (
                            <LimitOrderLI
                                key={`order-search-result-${JSON.stringify(limitOrder)}`}
                                limitOrder={limitOrder}
                                isDenomBase={isDenomBase}
                                handleClick={handleClick}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <h5 className={styles.not_found_text}>No Orders Found</h5>
            )}
        </div>
    );
}
