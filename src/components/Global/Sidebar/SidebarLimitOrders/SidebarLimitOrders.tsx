import styles from './SidebarLimitOrders.module.css';
import SidebarLimitOrdersCard from './SidebarLimitOrdersCard';
import { SetStateAction, Dispatch, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { LimitOrderIF } from '../../../../utils/interfaces/exports';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { tokenMethodsIF } from '../../../../App/hooks/useTokens';
import { useLinkGen, linkGenMethodsIF } from '../../../../utils/hooks/useLinkGen';

interface propsIF {
    chainId: string,
    isDenomBase: boolean;
    limitOrderByUser?: LimitOrderIF[];
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    isUserLoggedIn: boolean | undefined;
    tokens: tokenMethodsIF;
}

export default function SidebarLimitOrders(props: propsIF) {
    const {
        chainId,
        limitOrderByUser,
        isDenomBase,
        setCurrentPositionActive,
        setIsShowAllEnabled,
        isUserLoggedIn,
        tokens,
    } = props;

    const {
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
        sidebar: { close: closeSidebar },
    } = useContext(AppStateContext);

    const location = useLocation();

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenAccount: linkGenMethodsIF = useLinkGen('account');

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 1 : onAccountRoute ? 1 : 1;
    function redirectBasedOnRoute() {
        if (onAccountRoute) return;
        linkGenAccount.navigate();
    }

    const handleLimitOrderClick = (limitOrder: LimitOrderIF) => {
        setOutsideControlActive(true);
        setOutsideTabSelected(1);
        setCurrentPositionActive(limitOrder.limitOrderIdentifier);
        setIsShowAllEnabled(false);
        linkGenLimit.navigate({
            chain: chainId,
            tokenA: limitOrder.base,
            tokenB: limitOrder.quote
        });
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
                            tokens={tokens}
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
