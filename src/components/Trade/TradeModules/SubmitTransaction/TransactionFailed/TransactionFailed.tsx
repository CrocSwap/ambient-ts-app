import Button from '../../../../Form/Button';
import { CircleLoaderFailed } from '../../../../Global/LoadingAnimations/CircleLoader/CircleLoader';
import styles from './TransactionFailed.module.css';

interface PropsIF {
    resetConfirmation: () => void;
    noAnimation?: boolean;
    initiateTx?: () => void;
}

export default function TransactionFailed(props: PropsIF) {
    const { resetConfirmation, noAnimation, initiateTx } = props;

    return (
        <div
            className={styles.removal_pending}
            style={{ height: noAnimation ? 'auto' : '300px' }}
        >
            <div className={styles.animation_container}>
                {!noAnimation && <CircleLoaderFailed size='8rem' />}
                <h2>Transaction Failed.</h2>
            </div>
            <p>Please check your wallet for notifications or try again.</p>
            <Button
                idForDOM='tx_failed_try_again_button'
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
