import { TokenIF, TransactionIF } from '../../../../utils/interfaces/exports';
import { useNavigate } from 'react-router-dom';
import styles from './SidebarRecentTransactionsCard.module.css';
import { Dispatch, SetStateAction } from 'react';
import { getTxType } from './functions/getTxType';
import { getTxValue } from './functions/getTxValue'

interface propsIF {
    tx: TransactionIF;
    coinGeckoTokenMap: Map<string, TokenIF>;
    chainId: string;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    tabToSwitchToBasedOnRoute: number;
}

export default function SidebarRecentTransactionsCard(props: propsIF) {
    const {
        tx,
        // coinGeckoTokenMap,
        chainId,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
        setSelectedOutsideTab,
        setOutsideControl,
        tabToSwitchToBasedOnRoute,
    } = props;

    const navigate = useNavigate();

    function handleRecentTransactionClick(tx: TransactionIF) {
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
            tx.quote
        );
    }

    // human-readable form of transaction type to display in DOM
    const txType = getTxType(tx.entityType);

    // human-readable form of transaction value to display in DOM
    const txValue = getTxValue(tx);

    return (
        <div className={styles.container} onClick={() => handleRecentTransactionClick(tx)}>
            <div>
                {tx.baseSymbol} / {tx.quoteSymbol}
            </div>
            <div>{txType}</div>
            <div className={styles.status_display}>{txValue}</div>
        </div>
    );
}
