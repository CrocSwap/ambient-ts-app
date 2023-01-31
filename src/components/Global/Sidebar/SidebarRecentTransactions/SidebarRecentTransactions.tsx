import { TokenIF, TransactionIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarRecentTransactions.module.css';
import SidebarRecentTransactionsCard from './SidebarRecentTransactionsCard';
import { Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface propsIF {
    // showSidebar: boolean;
    mostRecentTransactions: TransactionIF[];
    coinGeckoTokenMap: Map<string, TokenIF>;
    chainId: string;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;

    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setShowSidebar: Dispatch<SetStateAction<boolean>>;
    isUserLoggedIn: boolean | undefined;
}

export default function SidebarRecentTransactions(props: propsIF) {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        mostRecentTransactions,
        chainId,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
        isUserLoggedIn,
        // expandTradeTable,
        setShowSidebar,
    } = props;

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 0 : onAccountRoute ? 0 : 0;

    function redirectBasedOnRoute() {
        // if (onTradeRoute || onAccountRoute) return;
        // navigate('/trade');

        if (onAccountRoute) return;
        navigate('/account');
    }

    const handleViewMoreClick = () => {
        redirectBasedOnRoute();
        props.setOutsideControl(true);
        props.setSelectedOutsideTab(tabToSwitchToBasedOnRoute);

        setShowSidebar(false);

        // props.setIsShowAllEnabled(false);
        // props.setExpandTradeTable(true);
    };

    // TODO:   @Junior please refactor the header <div> as a <header> element

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Type</div>
                <div>Value</div>
            </div>
            <div className={styles.content}>
                {mostRecentTransactions.map((tx, idx) => (
                    <SidebarRecentTransactionsCard
                        tx={tx}
                        key={idx}
                        chainId={chainId}
                        setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                        setSelectedOutsideTab={props.setSelectedOutsideTab}
                        setOutsideControl={props.setOutsideControl}
                        tabToSwitchToBasedOnRoute={tabToSwitchToBasedOnRoute}
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
