import styles from './TransactionFailed.module.css';
// import Animation from '../Animation/Animation';
// import NotFound from '../../../assets/animations/NotFound.json';
import { CircleLoaderFailed } from '../LoadingAnimations/CircleLoader/CircleLoader';
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
    noAnimation?: boolean;
    initiateTx?: () => void;
}

export default function TransactionFailed(props: TransactionSubmittedProps) {
    const { resetConfirmation, noAnimation, initiateTx } = props;

    return (
        <div className={styles.removal_pending} style={{ height: noAnimation ? 'auto' : '300px' }}>
            <div className={styles.animation_container}>
                {!noAnimation && <CircleLoaderFailed size='8rem' />}
                <h2>Transaction Failed.</h2>
            </div>
            <p>
                Check the Metamask extension in your browser for notifications, or click &quot;Try
                Again&quot;.
            </p>
            <Button
                title='Try Again'
                action={() => {
                    if (initiateTx) initiateTx();
                    resetConfirmation();
                }}
                flat
            />
        </div>
    );
}
