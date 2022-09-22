import styles from './SidebarLimitOrders.module.css';
import SidebarLimitOrdersCard from './SidebarLimitOrdersCard';
import { SetStateAction, Dispatch } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ILimitOrderState } from '../../../../utils/state/graphDataSlice';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';

interface SidebarLimitOrdersProps {
    tokenMap: Map<string, TokenIF>;
    isDenomBase: boolean;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    limitOrderByUser?: ILimitOrderState[];
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrders(props: SidebarLimitOrdersProps) {
    const { limitOrderByUser, tokenMap, isDenomBase } = props;
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
            {!props.expandTradeTable && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}
