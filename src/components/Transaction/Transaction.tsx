// FILE WILL BE DELETED: KEEPING IT HERE IN THE MEANTME JUST IN CASE WE NEED ANYTHING FROM HERE

// import styles from './Transaction.module.css';

// import { ISwap } from '../../utils/state/graphDataSlice';
// import truncateAddress from '../../utils/truncateAddress';

// interface TransactionProps {
//     // portfolio?: boolean;
//     // notOnTradeRoute?: boolean;
//     swap: ISwap;
//     isShowAllEnabled: boolean;
//     tokenAAddress: string;
//     tokenBAddress: string;
//     isAuthenticated: boolean;
//     account?: string;
//     // isDenomBase: boolean;
// }

// export default function Transaction(props: TransactionProps) {
//     const {
//         swap,
//         isShowAllEnabled,
//         tokenAAddress,
//         tokenBAddress,
//         account,
//         //  notOnTradeRoute,
//         isAuthenticated,
//     } = props;

//     const ownerId = swap ? swap.user : null;
//     const accountAddress = account ? account.toLowerCase() : null;

//     const transactionBaseAddressLowerCase = swap.base.toLowerCase();
//     const transactionQuoteAddressLowerCase = swap.quote.toLowerCase();

//     const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
//     const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

//     const truncatedSwapID = truncateAddress(props.swap.id, 16);

//     const transactionMatchesSelectedTokens =
//         (transactionBaseAddressLowerCase === tokenAAddressLowerCase ||
//             transactionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
//         (transactionBaseAddressLowerCase === tokenBAddressLowerCase ||
//             transactionQuoteAddressLowerCase === tokenBAddressLowerCase);

//     const displayAllOrOwned = isShowAllEnabled || (ownerId === accountAddress && isAuthenticated);
//     // const notDisplayAllOrOwned = !isShowAllEnabled || (ownerId === accountAddress && isAuthenticated);

//     const transactionRowOrNull =
//         transactionMatchesSelectedTokens && displayAllOrOwned ? (
//             <tr>
//                 <td data-column='Position ID' className={styles.position_id}>
//                     {truncatedSwapID}
//                 </td>
//                 <td data-column='Limit Price' className={styles.transaction_price}>
//                     3200.00
//                 </td>
//                 <td data-column='From' className={styles.from}>
//                     4.00ETH
//                 </td>
//                 <td data-column='To' className={styles.to}>
//                     12,00.00 USDC
//                 </td>
//                 <td data-column='' className={styles.option_buttons}>
//                     <button className={styles.option_button}>Edit</button>
//                     <button className={styles.option_button}>Remove</button>
//                 </td>
//             </tr>
//         ) : null;

//     return transactionRowOrNull;
// }

import styles from './Transaction.module.css';

export default function Transaction() {
    return <div className={styles.row}></div>;
}
