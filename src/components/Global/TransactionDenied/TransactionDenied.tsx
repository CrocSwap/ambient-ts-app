import styles from './TransactionDenied.module.css';
import { CircleLoaderFailed } from '../LoadingAnimations/CircleLoader/CircleLoader';
import Button from '../Button/Button';

interface TransactionSubmittedProps {
    resetConfirmation: () => void;
    noAnimation?: boolean;
    initiateTx?: () => void;
}

export default function TransactionDenied(props: TransactionSubmittedProps) {
    const { resetConfirmation, noAnimation, initiateTx } = props;

    return (
        <div
            className={`${styles.removal_pending} ${
                noAnimation && styles.removal_pending_bypass
            }`}
            style={{ height: noAnimation ? 'auto' : '300px' }}
        >
            <div
                className={styles.animation_container}
                style={{ minHeight: noAnimation ? 'auto' : '180px' }}
            >
                {!noAnimation && <CircleLoaderFailed size='8rem' />}
                <h2>Transaction Denied in Wallet</h2>
            </div>
            <p>
                Please check your wallet for notifications, or click &quot;Try
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
