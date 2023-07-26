import { ReactNode } from 'react';
import styles from './WaitingConfirmation.module.css';
interface WaitingConfirmationPropsIF {
    content: ReactNode;
    noAnimation?: boolean;
}

export default function WaitingConfirmation(props: WaitingConfirmationPropsIF) {
    const { content, noAnimation } = props;

    return (
        <div className={styles.wallet_confirm}>
            {!noAnimation && <div className={styles.loader} />}
            {!noAnimation && <h2>Waiting For Confirmation</h2>}
            <div>{content}</div>

            {/* <span className={styles.waiting_detail}>
                <p>Please confirm this transaction in your wallet</p>
            </span> */}
        </div>
    );
}
