import styles from './SidebarLimitOrders.module.css';
import SidebarLimitOrdersCard from './SidebarLimitOrdersCard';
import { SetStateAction, Dispatch } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';

interface SidebarLimitOrdersProps {
    tokenMap: Map<string, TokenIF>;
    isDenomBase: boolean;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    limitOrderByUser?: LimitOrderIF[];
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    isUserLoggedIn: boolean;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrders(props: SidebarLimitOrdersProps) {
    const {
        limitOrderByUser,
        tokenMap,
        isDenomBase,
        setCurrentPositionActive,
        setIsShowAllEnabled,
        isUserLoggedIn,
    } = props;
    const location = useLocation();
    const navigate = useNavigate();
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Price</div>
            <div>Value</div>
        </div>
    );

    const sidebarLimitOrderCardProps = {
        tokenMap: tokenMap,
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
        setCurrentPositionActive: setCurrentPositionActive,
        setIsShowAllEnabled: setIsShowAllEnabled,
    };

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 1 : onAccountRoute ? 3 : 1;
    function redirectBasedOnRoute() {
        // if (onTradeRoute || onAccountRoute) return;
        if (onTradeRoute) return;
        navigate('/trade');
    }

    const handleViewMoreClick = () => {
        redirectBasedOnRoute();
        props.setOutsideControl(true);
        props.setSelectedOutsideTab(tabToSwitchToBasedOnRoute);

        props.setIsShowAllEnabled(false);
        props.setExpandTradeTable(true);
    };
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {limitOrderByUser &&
                    limitOrderByUser.map((order, idx) => (
                        <SidebarLimitOrdersCard
                            key={idx}
                            isDenomBase={isDenomBase}
                            order={order}
                            {...sidebarLimitOrderCardProps}
                        />
                    ))}
            </div>
            {!props.expandTradeTable && isUserLoggedIn && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}
