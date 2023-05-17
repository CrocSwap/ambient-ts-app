import styles from './SidebarLimitOrders.module.css';
import SidebarLimitOrdersCard from './SidebarLimitOrdersCard';
import { SetStateAction, Dispatch, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LimitOrderIF } from '../../../../utils/interfaces/exports';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { SidebarContext } from '../../../../contexts/SidebarContext';

interface propsIF {
    isDenomBase: boolean;
    limitOrderByUser?: LimitOrderIF[];
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrders(props: propsIF) {
    const {
        limitOrderByUser,
        isDenomBase,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const {
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
    } = useContext(AppStateContext);
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        sidebar: { close: closeSidebar },
    } = useContext(SidebarContext);

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
                        />
                    ))}
            </div>
            {isUserConnected && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}
