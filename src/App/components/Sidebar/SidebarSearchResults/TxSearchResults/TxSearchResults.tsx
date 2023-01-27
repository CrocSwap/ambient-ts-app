import { Dispatch, SetStateAction } from 'react';
import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import TxLI from './TxLI'

interface propsIF {
    txsByUser: TransactionIF[];
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

}

export default function TxSearchResults(props: propsIF) {
    const {
        txsByUser,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled
    } = props;

    // TODO:   @Junior  please refactor the header <div> as a <header> element
    // TODO:   @Junior  also make the <div> elems inside it into <hX> elements

    return (
        <div>
            <div className={styles.card_title}>My Recent Transactions</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Type</div>
                <div>Value</div>
            </div>
            {
                txsByUser.map((tx: TransactionIF) => (
                    <TxLI
                        key={`tx-sidebar-search-result-${JSON.stringify(tx)}`}
                        tx={tx}
                        setOutsideControl={setOutsideControl}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                ))
            }
        </div>
    );
}
