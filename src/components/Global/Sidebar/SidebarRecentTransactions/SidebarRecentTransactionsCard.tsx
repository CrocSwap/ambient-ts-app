import { TransactionIF } from '../../../../utils/interfaces/exports';
import { useNavigate } from 'react-router-dom';
import styles from './SidebarRecentTransactionsCard.module.css';
import { Dispatch, SetStateAction } from 'react';
import { getTxType, getTxValue } from './functions/exports';

interface propsIF {
    tx: TransactionIF;
    chainId: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    tabToSwitchToBasedOnRoute: number;
}

export default function SidebarRecentTransactionsCard(props: propsIF) {
    const {
        tx,
        chainId,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
        setSelectedOutsideTab,
        setOutsideControl,
        tabToSwitchToBasedOnRoute,
    } = props;

    const navigate = useNavigate();

    function handleClick(tx: TransactionIF) {
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
        <div className={styles.container} onClick={() => handleClick(tx)}>
            <div>
                {tx.baseSymbol} / {tx.quoteSymbol}
            </div>
            <div>{txType}</div>
            <div className={styles.status_display}>{txValue}</div>
        </div>
    );
}
