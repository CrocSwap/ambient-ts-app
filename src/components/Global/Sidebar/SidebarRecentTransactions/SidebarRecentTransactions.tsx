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
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    currentClickedTxHashFromRecentTx: string;
    SetCurrentClickedTxHashFromRecentTx: Dispatch<SetStateAction<string>>;
}

export default function SidebarRecentTransactions(props: SidebarRecentTransactionsPropsIF) {
    const {
        mostRecentTransactions,
        coinGeckoTokenMap,
        chainId,
        isShowAllEnabled,
        setIsShowAllEnabled,
        currentClickedTxHashFromRecentTx,
        SetCurrentClickedTxHashFromRecentTx,
    } = props;

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Type</div>
            <div>Status</div>
        </div>
    );

    // const mapItems = [1, 2, 3, 4, 5, 6, 7];
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
                        isShowAllEnabled={isShowAllEnabled}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                        currentClickedTxHashFromRecentTx={currentClickedTxHashFromRecentTx}
                        SetCurrentClickedTxHashFromRecentTx={SetCurrentClickedTxHashFromRecentTx}
                    />
                ))}
            </div>
        </div>
    );
}
