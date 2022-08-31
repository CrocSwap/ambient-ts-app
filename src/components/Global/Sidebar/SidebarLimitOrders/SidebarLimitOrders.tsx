import styles from './SidebarLimitOrders.module.css';
import SidebarLimitOrdersCard from './SidebarLimitOrdersCard';
import { SetStateAction, Dispatch } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarLimitOrdersProps {
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;

    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrders(props: SidebarLimitOrdersProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Price</div>
            <div>Amount</div>
        </div>
    );

    const mapItems = [1, 2, 3, 4, 5, 6, 7];

    const sidebarLimitOrderCardProps = {
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
    };

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 1 : onAccountRoute ? 3 : 1;

    function redirectBasedOnRoute() {
        if (onTradeRoute || onAccountRoute) return;
        navigate('/trade');
    }

    const handleViewMoreClick = () => {
        redirectBasedOnRoute();
        props.setOutsideControl(true);
        props.setSelectedOutsideTab(tabToSwitchToBasedOnRoute);

        props.setIsShowAllEnabled(true);
        props.setExpandTradeTable(true);
    };
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {mapItems.map((item, idx) => (
                    <SidebarLimitOrdersCard key={idx} {...sidebarLimitOrderCardProps} />
                ))}
            </div>
            {!props.expandTradeTable && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}
