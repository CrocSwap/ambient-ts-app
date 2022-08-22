import { ReactNode } from 'react';
import styles from './WaitingConfirmation.module.css';

interface WaitingConfirmationPropsIF {
    content: ReactNode;
}

export default function WaitingConfirmation(props: WaitingConfirmationPropsIF) {
    const { content } = props;

    // TODO:  @Junior seriously you're killing me with these wrappers  -Emily
    return (
        <div className={styles.wallet_confirm}>
            <div className={styles.loading_animation}>
                {/* <Animation animData={loading4} /> */}
            </div>
            <span className={styles.waiting_detail}>
                <h2>Waiting For Confirmation</h2>
            </span>
            <span className={styles.waiting_detail}>
                <h4>{content}</h4>
            </span>
            <span className={styles.waiting_detail}>
                <p>Please confirm this transaction in your wallet</p>
            </span>
        </div>
    );
}
