import styles from './TransactionDenied.module.css';
import { CircleLoaderFailed } from '../../../../Global/LoadingAnimations/CircleLoader/CircleLoader';

interface PropsIF {
    noAnimation?: boolean;
}

export default function TransactionDenied(props: PropsIF) {
    const { noAnimation } = props;

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
            <p>Please check your wallet for notifications or try again.</p>
        </div>
    );
}
