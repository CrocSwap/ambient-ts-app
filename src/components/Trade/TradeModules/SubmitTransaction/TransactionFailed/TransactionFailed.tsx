import styles from './TransactionFailed.module.css';
import Button from '../../../../Global/Button/Button';
import { CircleLoaderFailed } from '../../../../Global/LoadingAnimations/CircleLoader/CircleLoader';

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
