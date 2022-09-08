import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { ISwap } from '../../../../utils/state/graphDataSlice';
import styles from './SidebarRecentTransactions.module.css';
import SidebarRecentTransactionsCard from './SidebarRecentTransactionsCard';
import { Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarRecentTransactionsPropsIF {
    // showSidebar: boolean;
    mostRecentTransactions: ISwap[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coinGeckoTokenMap?: Map<string, TokenIF>;
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
}

export default function SidebarRecentTransactions(props: SidebarRecentTransactionsPropsIF) {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        mostRecentTransactions,
        coinGeckoTokenMap,
        chainId,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        isShowAllEnabled,
        setIsShowAllEnabled,

        expandTradeTable,
    } = props;

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Type</div>
            <div>Value</div>
        </div>
    );

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 0 : onAccountRoute ? 4 : 0;

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

    // // const mapItems = [1, 2, 3, 4, 5, 6, 7];
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {mostRecentTransactions.map((tx, idx) => (
                    <SidebarRecentTransactionsCard
                        tx={tx}
                        key={idx}
                        coinGeckoTokenMap={coinGeckoTokenMap}
                        chainId={chainId}
                        currentTxActiveInTransactions={currentTxActiveInTransactions}
                        setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
                        isShowAllEnabled={isShowAllEnabled}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                        selectedOutsideTab={props.selectedOutsideTab}
                        setSelectedOutsideTab={props.setSelectedOutsideTab}
                        outsideControl={props.outsideControl}
                        setOutsideControl={props.setOutsideControl}
                        tabToSwitchToBasedOnRoute={tabToSwitchToBasedOnRoute}
                    />
                ))}
            </div>
            {!expandTradeTable && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}
