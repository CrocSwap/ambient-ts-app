import { ReactNode } from 'react';
import Spinner from '../Spinner/Spinner';
import styles from './WaitingConfirmation.module.css';
interface WaitingConfirmationPropsIF {
    content: ReactNode;
    noAnimation?: boolean;
}

export default function WaitingConfirmation(props: WaitingConfirmationPropsIF) {
    const { content, noAnimation } = props;

    return (
        <div className={styles.wallet_confirm}>
            {!noAnimation && <Spinner size={150} bg='var(--dark1)' />}
            {!noAnimation && <h2>Waiting For Confirmation</h2>}
            <div>{content}</div>
        </div>
    );
}
