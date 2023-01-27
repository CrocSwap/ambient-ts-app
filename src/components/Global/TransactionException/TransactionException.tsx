import styles from './TransactionException.module.css';
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

export default function TransactionException(props: TransactionSubmittedProps) {
    const { resetConfirmation } = props;

    return (
        <div className={styles.removal_pending}>
            <h2>Transaction Exception</h2>
            <CircleLoaderFailed />
            <p>
                Check the Metamask extension in your browser for notifications, or click &quot;Try
                Again&quot;.
            </p>
            <Button title='Try Again' action={resetConfirmation} />
        </div>
    );
}
