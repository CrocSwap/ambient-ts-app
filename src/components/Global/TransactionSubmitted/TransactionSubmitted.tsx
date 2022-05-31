import styles from './TransactionSubmitted.module.css';
import Animation from '../../Global/Animation/Animation';
import completed from '../../../assets/animations/completed.json';

interface TransactionSubmittedProps {
    hash: string;
}

export default function TransactionSubmitted(props: TransactionSubmittedProps) {
    const { hash } = props;
    const EthersanTx = `https://ropsten.etherscan.io/tx/${hash}`;

    return (
        <div className={styles.transaction_submitted}>
            <div className={styles.completed_animation}>
                <Animation animData={completed} loop={false} />
            </div>
            <h2>Transaction Submitted</h2>
            <p>
                <a href={EthersanTx} target='_blank' rel='noreferrer'>
                    View on Etherscan
                </a>
            </p>
        </div>
    );
}
