import styles from './TransactionDenied.module.css';
// import Animation from '../Animation/Animation';
// import NotFound from '../../../assets/animations/NotFound.json';
import { CircleLoaderFailed } from '../LoadingAnimations/CircleLoader/CircleLoader';
// import { Dispatch, SetStateAction } from 'react';
import Button from '../Button/Button';

// interface TransactionSubmittedProps {
//     hash: string;
//     tokenBAddress: string;
//     tokenBSymbol: string;
//     tokenBDecimals: number;
//     tokenBImage: string;
// }

interface TransactionSubmittedProps {
    resetConfirmation: () => void;
}

export default function TransactionDenied(props: TransactionSubmittedProps) {
    const { resetConfirmation } = props;

    return (
        <div className={styles.removal_pending}>
            <CircleLoaderFailed />
            <p>
                Check the Metamask extension in your browser for notifications, or click &quot;Try
                Again&quot;. You can also click the left arrow above to try again.
            </p>
            <Button title='Try Again' action={resetConfirmation} />
        </div>
        // <div className={styles.transaction_submitted}>
        //     <div className={styles.completed_animation}>
        //         <Animation animData={NotFound} loop={false} />
        //     </div>
        //     <h2>Transaction Denied in Wallet</h2>
        //     <p>
        //         {/* <a href={EthersanTx} target='_blank' rel='noreferrer'>
        //             View on Etherscan
        //         </a> */}
        //         {/* {tokenBSymbol === 'ETH' ? null : addToMetamaskButton} */}
        //     </p>
        // </div>
    );
}
