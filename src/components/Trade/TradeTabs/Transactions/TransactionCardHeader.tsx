// import { tradeData } from '../../../../utils/state/tradeDataSlice';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
import styles from './TransactionCardHeader.module.css';

interface TransactionCardHeaderProps {
    tradeData: tradeData;
}

export default function TransactionCardHeader(props: TransactionCardHeaderProps) {
    const { tradeData } = props;

    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                <p>ID</p>
                <p className={styles.wallet}>Wallet</p>
                <p className={styles.price}>Price</p>
                <p className={styles.side}>Side</p>
                <p className={styles.type}>Type</p>
                {/* <p className={styles.tokens}>Base/Quote</p> */}
                <p className={styles.token}>{baseTokenSymbol}</p>
                <p className={styles.token}>{quoteTokenSymbol}</p>
            </div>

            <div></div>
        </div>
    );
}
