import styles from './SidebarLimitOrders.module.css';
import SidebarLimitOrdersCard from './SidebarLimitOrdersCard';
import { SetStateAction, Dispatch, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import { AppStateContext } from '../../../../contexts/AppStateContext';

interface propsIF {
    tokenMap: Map<string, TokenIF>;
    chainId: string;
    isDenomBase: boolean;
    limitOrderByUser?: LimitOrderIF[];
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    isUserLoggedIn: boolean | undefined;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrders(props: propsIF) {
    const {
        limitOrderByUser,
        tokenMap,
        chainId,
        isDenomBase,
        setCurrentPositionActive,
        setIsShowAllEnabled,
        isUserLoggedIn,
    } = props;

    const {
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
        sidebar: { close: closeSidebar },
    } = useContext(AppStateContext);

    const location = useLocation();
    const navigate = useNavigate();

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 1 : onAccountRoute ? 1 : 1;
    function redirectBasedOnRoute() {
        if (onAccountRoute) return;
        navigate('/account');
    }

    const handleLimitOrderClick = (limitOrder: LimitOrderIF) => {
        setOutsideControlActive(true);
        setOutsideTabSelected(1);
        setCurrentPositionActive(limitOrder.limitOrderIdentifier);
        setIsShowAllEnabled(false);
        navigate(
            '/trade/limit/chain=' +
                chainId +
                '&tokenA=' +
                limitOrder.base +
                '&tokenB=' +
                limitOrder.quote,
        );
    };

    const handleViewMoreClick = () => {
        redirectBasedOnRoute();
        setOutsideControlActive(true);
        setOutsideTabSelected(tabToSwitchToBasedOnRoute);
        closeSidebar();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Price</div>
                <div>Value</div>
            </header>
            <div className={styles.content}>
                {limitOrderByUser &&
                    limitOrderByUser.map((order: LimitOrderIF) => (
                        <SidebarLimitOrdersCard
                            key={
                                'Sidebar-Limit-Orders-Card-' +
                                JSON.stringify(order)
                            }
                            isDenomBase={isDenomBase}
                            order={order}
                            handleClick={handleLimitOrderClick}
                            tokenMap={tokenMap}
                        />
                    ))}
            </div>
            {isUserLoggedIn && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}
