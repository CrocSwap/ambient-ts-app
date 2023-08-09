import styles from './TransactionSubmitted.module.css';
import Animation from '../../../../Global/Animation/Animation';
import completed from '../../../../../assets/animations/completed.json';
import { FiExternalLink } from 'react-icons/fi';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';

interface PropsIF {
    hash: string;
    content: string;
    noAnimation?: boolean;
}

export default function TxSubmittedSimplify(props: PropsIF) {
    const { hash, content, noAnimation } = props;
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    const EthersanTx = `${blockExplorer}tx/${hash}`;

    const etherscanButton = (
        <a
            href={EthersanTx}
            target='_blank'
            rel='noreferrer'
            className={styles.view_etherscan}
            aria-label='view on etherscan'
        >
            View on Etherscan
            <FiExternalLink size={20} color='var(--text1)' />
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
