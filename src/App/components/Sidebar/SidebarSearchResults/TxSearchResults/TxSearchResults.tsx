import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { useContext } from 'react';
import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import TxLI from './TxLI';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../../utils/hooks/useLinkGen';

interface propsIF {
    searchedTxs: TransactionIF[];
}

export default function TxSearchResults(props: propsIF) {
    const { searchedTxs } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const {
        setCurrentTxActiveInTransactions,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    const handleClick = (tx: TransactionIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(0);
        setShowAllData(false);
        setCurrentTxActiveInTransactions(tx.txId);
        linkGenMarket.navigate(
            tx.isBuy
                ? {
                      chain: chainId,
                      tokenA: tx.base,
                      tokenB: tx.quote,
                  }
                : {
                      chain: chainId,
                      tokenA: tx.quote,
                      tokenB: tx.base,
                  },
        );
    };

    // TODO:   @Junior  please refactor the header <div> as a <header> element
    // TODO:   @Junior  also make the <div> elems inside it into <hX> elements

    return (
        <div>
            <div className={styles.card_title}>My Recent Transactions</div>
            {searchedTxs.length ? (
                <>
                    <div className={styles.header}>
                        <div>Pool</div>
                        <div>Type</div>
                        <div>Value</div>
                    </div>
                    <div className={styles.main_result_container}>
                        {searchedTxs.slice(0, 4).map((tx: TransactionIF) => (
                            <TxLI
                                key={`tx-sidebar-search-result-${JSON.stringify(
                                    tx,
                                )}`}
                                tx={tx}
                                handleClick={handleClick}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <h5 className={styles.not_found_text}>No Transactions Found</h5>
            )}
        </div>
    );
}
