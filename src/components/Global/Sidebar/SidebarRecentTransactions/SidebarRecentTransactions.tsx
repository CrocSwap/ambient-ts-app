// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// START: Import Local Files
import { TokenIF, TransactionIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarRecentTransactions.module.css';

// START: Import JSX Components
import SidebarRecentTransactionsCard from './SidebarRecentTransactionsCard';

interface propsIF {
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
    isUserLoggedIn: boolean | undefined;
    closeSidebar: () => void;
}

export default function SidebarRecentTransactions(props: propsIF) {
    const {
        mostRecentTransactions,
        chainId,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
        setOutsideControl,
        setSelectedOutsideTab,
        isUserLoggedIn,
        closeSidebar,
    } = props;

    const location = useLocation();
    const navigate = useNavigate();

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 0 : onAccountRoute ? 0 : 0;

    function redirectBasedOnRoute() {
        if (onAccountRoute) return;
        navigate('/account');
    }

    const handleCardClick = (tx: TransactionIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setIsShowAllEnabled(false);
        setCurrentTxActiveInTransactions(tx.id);
        navigate(
            '/trade/market/chain=' +
                chainId +
                '&tokenA=' +
                tx.base +
                '&tokenB=' +
                tx.quote,
        );
    };

    const handleViewMoreClick = (): void => {
        redirectBasedOnRoute();
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        closeSidebar();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Type</div>
                <div>Value</div>
            </header>
            <div className={styles.content}>
                {mostRecentTransactions.map((tx: TransactionIF) => (
                    <SidebarRecentTransactionsCard
                        key={
                            'Sidebar-Recent-Transactions-Card-' +
                            JSON.stringify(tx)
                        }
                        tx={tx}
                        handleClick={handleCardClick}
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
