import styles from './TransactionSubmitted.module.css';
import Animation from '../../Global/Animation/Animation';
import completed from '../../../assets/animations/completed.json';

import { FiExternalLink } from 'react-icons/fi';

interface TransactionSubmittedProps {
    hash: string;
    content: string;
    noAnimation?: boolean;
}

export default function TxSubmittedSimplify(props: TransactionSubmittedProps) {
    const { hash, content, noAnimation } = props;
    const EthersanTx = `https://goerli.etherscan.io/tx/${hash}`;

    const etherscanButton = (
        <a
            href={EthersanTx}
            target='_blank'
            rel='noreferrer'
            className={styles.view_etherscan}
        >
            View on Etherscan
            <FiExternalLink size={20} color='black' />
        </a>
    );
    return (
        <div
            className={styles.transaction_submitted}
            style={{ height: noAnimation ? 'auto' : '300px' }}
        >
            {!noAnimation && (
                <div className={styles.completed_animation}>
                    <Animation animData={completed} loop={false} />
                </div>
            )}
            <h2 style={{ marginBottom: '15px' }}>{content}</h2>
            <div className={styles.action_buttons}>
                {EthersanTx && etherscanButton}
            </div>
        </div>
    );
}
