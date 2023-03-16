import styles from './TransactionSubmitted.module.css';
import Animation from '../../Global/Animation/Animation';
import completed from '../../../assets/animations/completed.json';
import addTokenToWallet from './addTokenToWallet';
import Button from '../../Global/Button/Button';
import { FiExternalLink } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

interface TransactionSubmittedProps {
    hash: string;
    tokenBAddress: string;
    tokenBSymbol: string;
    tokenBDecimals: number;
    tokenBImage: string;
    noAnimation?: boolean;
}

export default function TransactionSubmitted(props: TransactionSubmittedProps) {
    const {
        hash,
        tokenBAddress,
        tokenBSymbol,
        tokenBDecimals,
        tokenBImage,
        noAnimation,
    } = props;
    const EthersanTx = `https://goerli.etherscan.io/tx/${hash}`;
    const currentLocation = useLocation()?.pathname;

    const logoURI = tokenBImage;

    const handleAddToMetamask = async () => {
        await addTokenToWallet(
            tokenBAddress,
            tokenBSymbol,
            tokenBDecimals,
            logoURI,
        );
    };

    const addToMetamaskButton = (
        <Button
            flat
            title={`Add ${tokenBSymbol} to Metamask`}
            // action={props.onClickFn}
            action={handleAddToMetamask}
            disabled={false}
        ></Button>
    );

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
            <h2 style={{ marginBottom: '15px' }}>Transaction Submitted</h2>
            <div className={styles.action_buttons}>
                {EthersanTx && etherscanButton}
                {tokenBSymbol === 'ETH' || currentLocation === '/trade/range'
                    ? null
                    : addToMetamaskButton}
            </div>
        </div>
    );
}
