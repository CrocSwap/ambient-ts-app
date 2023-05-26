import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import TxLI from './TxLI';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';

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
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
    } = useContext(TradeTableContext);

    const navigate = useNavigate();

    const handleClick = (tx: TransactionIF): void => {
        setOutsideControlActive(true);
        setOutsideTabSelected(0);
        setShowAllData(false);
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
