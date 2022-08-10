import styles from './TransactionSubmitted.module.css';
import Animation from '../../Global/Animation/Animation';
import completed from '../../../assets/animations/completed.json';
import addTokenToWallet from './addTokenToWallet';
import Button from '../../Global/Button/Button';
import { FiExternalLink } from 'react-icons/fi';

interface TransactionSubmittedProps {
    hash: string;
    tokenBAddress: string;
    tokenBSymbol: string;
    tokenBDecimals: number;
    tokenBImage: string;
}

export default function TransactionSubmitted(props: TransactionSubmittedProps) {
    const { hash, tokenBAddress, tokenBSymbol, tokenBDecimals, tokenBImage } = props;
    const EthersanTx = `https://goerli.etherscan.io/tx/${hash}`;

    const logoURI = tokenBImage;

    const handleAddToMetamask = async () => {
        await addTokenToWallet(tokenBAddress, tokenBSymbol, tokenBDecimals, logoURI);
    };

    const addToMetamaskButton = (
        <Button
            title={`Add ${tokenBSymbol} to Metamask`}
            // action={props.onClickFn}
            action={handleAddToMetamask}
            disabled={false}
        ></Button>
    );

    const etherscanButton = (
        <a href={EthersanTx} target='_blank' rel='noreferrer' className={styles.view_etherscan}>
            View on Etherscan
            <FiExternalLink size={20} color='black' />
        </a>
    );
    return (
        <div className={styles.transaction_submitted}>
            <div className={styles.completed_animation}>
                <Animation animData={completed} loop={false} />
            </div>
            <h2>Transaction Submitted</h2>
            <p>
                {EthersanTx && etherscanButton}
                {tokenBSymbol === 'ETH' ? null : addToMetamaskButton}
            </p>
        </div>
    );
}
