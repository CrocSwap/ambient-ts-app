// todo: SEE RETURN STATEMENT

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

    const mobileHeaderDisplay = (
        <div className={styles.mobile_header_display}>
            <div className={styles.mobile_header_content}>
                <p>ID/Wallet</p>
                <p>{baseTokenSymbol}</p>
                <p>{quoteTokenSymbol}</p>
            </div>
            <div />
        </div>
    );

    return (
        // <>
        //     {mobileHeaderDisplay}
        //     <div className={styles.main_container}>
        //         <div className={styles.row_container}>
        //             <p>ID</p>
        //             <p className={styles.wallet}>Wallet</p>
        //             <p className={styles.price}>Price</p>
        //             <p className={styles.side}>Side</p>
        //             <p className={styles.type}>Type</p>
        //             {/* <p className={styles.tokens}>
        //             {baseTokenSymbol}/{quoteTokenSymbol}
        //         </p> */}
        //             <p className={styles.token}>Value</p>
        //             <p className={styles.token}>{baseTokenSymbol}</p>
        //             <p className={styles.token}>{quoteTokenSymbol}</p>
        //         </div>

        //         <div></div>
        //     </div>
        // </>
        <p>
            This file has been refactored and updated to TransactionHeader.tsx on 10/13/2022. It is
            no longer in use. If not uncommented by 12/13/2022, it can be safely deleted, along with
            TransactionCardHeader.module.css. -Jr
        </p>
    );
}
