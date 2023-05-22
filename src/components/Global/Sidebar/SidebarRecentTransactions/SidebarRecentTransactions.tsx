// START: Import React and Dongles
import { Dispatch, SetStateAction, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppStateContext } from '../../../../contexts/AppStateContext';

// START: Import Local Files
import { TransactionIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarRecentTransactions.module.css';

// START: Import JSX Components
import SidebarRecentTransactionsCard from './SidebarRecentTransactionsCard';
import { useUrlPath } from '../../../../utils/hooks/useUrlPath';

interface propsIF {
    chainId: string;
    mostRecentTransactions: TransactionIF[];
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    isUserLoggedIn: boolean | undefined;
}

export default function SidebarRecentTransactions(props: propsIF) {
    const {
        chainId,
        mostRecentTransactions,
        setCurrentTxActiveInTransactions,
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
    const linkGenMarket = useUrlPath('market');

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 0 : onAccountRoute ? 0 : 0;

    // TODO: should this redirect with a <Navigate /> element?
    function redirectBasedOnRoute() {
        if (onAccountRoute) return;
        navigate('/account');
    }

    const handleCardClick = (tx: TransactionIF): void => {
        setOutsideControlActive(true);
        setOutsideTabSelected(tabToSwitchToBasedOnRoute);
        setIsShowAllEnabled(false);
        setCurrentTxActiveInTransactions(tx.id);
        linkGenMarket.navigate({
            chain: chainId,
            tokenA: tx.base,
            tokenB: tx.quote
        });
    };

    const handleViewMoreClick = (): void => {
        redirectBasedOnRoute();
        setOutsideControlActive(true);
        setOutsideTabSelected(tabToSwitchToBasedOnRoute);
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
