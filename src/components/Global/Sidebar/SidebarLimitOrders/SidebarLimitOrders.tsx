import styles from './SidebarLimitOrders.module.css';
import SidebarLimitOrdersCard from './SidebarLimitOrdersCard';
import { SetStateAction, Dispatch } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';

interface propsIF {
    tokenMap: Map<string, TokenIF>;
    chainId: string;
    isDenomBase: boolean;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    limitOrderByUser?: LimitOrderIF[];
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    isUserLoggedIn: boolean | undefined;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    setShowSidebar: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrders(props: propsIF) {
    const {
        limitOrderByUser,
        tokenMap,
        chainId,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
        isUserLoggedIn,
        setShowSidebar,
    } = props;
    const location = useLocation();
    const navigate = useNavigate();

    const sidebarLimitOrderCardProps = {
        tokenMap: tokenMap,
        chainId: chainId,
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
        setCurrentPositionActive: setCurrentPositionActive,
        setIsShowAllEnabled: setIsShowAllEnabled,
    };

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 1 : onAccountRoute ? 1 : 1;
    function redirectBasedOnRoute() {
        // if (onTradeRoute || onAccountRoute) return;
        // if (onTradeRoute) return;
        // navigate('/trade');

        if (onAccountRoute) return;
        navigate('/account');
    }

    const handleLimitOrderClick = (limitOrder: LimitOrderIF) => {
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

    const handleViewMoreClick = () => {
        redirectBasedOnRoute();
        props.setOutsideControl(true);
        props.setSelectedOutsideTab(tabToSwitchToBasedOnRoute);

        setShowSidebar(false);

        // props.setIsShowAllEnabled(false);
        // props.setExpandTradeTable(true);
    };

    // TODO:   @Junior please refactor header <div> as a <header> element

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Price</div>
                <div>Value</div>
            </div>
            <div className={styles.content}>
                {limitOrderByUser &&
                    limitOrderByUser.map((order, idx) => (
                        <SidebarLimitOrdersCard
                            key={idx}
                            isDenomBase={isDenomBase}
                            order={order}
                            handleClick={handleLimitOrderClick}
                            {...sidebarLimitOrderCardProps}
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
