import { Transaction } from '../../types';
// import { feeTierPercent, isAddress } from '../../utils';
// import { formatDollarAmount } from '../../utils/numbers';

interface TransactionProps {
    transaction: Transaction;
    key: number;
}

export default function TransactionRow(props: TransactionProps) {
    // const TransactionData = props.transaction;

    // function getTokenLogoURL(address: string) {
    //     const checkSummed = isAddress(address);
    //     return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    // }

    return (
        // <tr>
        //     <td data-column='id' >
        //         {props.key+1}
        //     </td>

        //     <td></td>
        //     <td></td>
        //     <td data-column='symbol'></td>
        //     <td data-column='Range Status'></td>
        //     <td data-column='Range Status'></td>
        // </tr>
        <p>Not in use?</p>
    );
}
