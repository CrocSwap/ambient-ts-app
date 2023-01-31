import { Dispatch, SetStateAction } from 'react';
import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import TxLI from './TxLI';
import { useClick } from './hooks/useClick';

interface propsIF {
    searchedTxs: TransactionIF[];
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function TxSearchResults(props: propsIF) {
    const {
        searchedTxs,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
    } = props;

    const handleClick = useClick(
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
    );

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
                                key={`tx-sidebar-search-result-${JSON.stringify(tx)}`}
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
