import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { ISwap } from '../../../../utils/state/graphDataSlice';
import styles from './SidebarRecentTransactions.module.css';
import SidebarRecentTransactionsCard from './SidebarRecentTransactionsCard';
import { Dispatch, SetStateAction } from 'react';
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
    setSwitchTabToTransactions: Dispatch<SetStateAction<boolean>>;
    switchTabToTransactions: boolean;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;

    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarRecentTransactions(props: SidebarRecentTransactionsPropsIF) {
    const {
        mostRecentTransactions,
        coinGeckoTokenMap,
        chainId,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        isShowAllEnabled,
        setIsShowAllEnabled,
        setSwitchTabToTransactions,
        switchTabToTransactions,
        expandTradeTable,
        setExpandTradeTable,
    } = props;

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Type</div>
            <div>Status</div>
        </div>
    );

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
                        setSwitchTabToTransactions={setSwitchTabToTransactions}
                        switchTabToTransactions={switchTabToTransactions}
                        selectedOutsideTab={props.selectedOutsideTab}
                        setSelectedOutsideTab={props.setSelectedOutsideTab}
                        outsideControl={props.outsideControl}
                        setOutsideControl={props.setOutsideControl}
                    />
                ))}
            </div>
            {!expandTradeTable && (
                <div className={styles.view_more} onClick={() => setExpandTradeTable(true)}>
                    View More
                </div>
            )}
        </div>
    );
}
