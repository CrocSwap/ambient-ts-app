import styles from './TransactionSubmitted.module.css';
import Animation from '../../Global/Animation/Animation';
import completed from '../../../assets/animations/completed.json';
import addTokenToWallet from './addTokenToWallet';
import Button from '../../Global/Button/Button';

interface TransactionSubmittedProps {
    hash: string;
    tokenBAddress: string;
    tokenBSymbol: string;
    tokenBDecimals: number;
    tokenBImage: string;
}

export default function TransactionSubmitted(props: TransactionSubmittedProps) {
    const { hash, tokenBAddress, tokenBSymbol, tokenBDecimals, tokenBImage } = props;
    const EthersanTx = `https://kovan.etherscan.io/tx/${hash}`;

    const logoURI = tokenBImage;

    const handleAddToMetamask = async () => {
        await addTokenToWallet(tokenBAddress, tokenBSymbol, tokenBDecimals, logoURI);
    };

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
                <Button
                    title={`Add ${tokenBSymbol} to Metamask`}
                    // action={props.onClickFn}
                    action={handleAddToMetamask}
                    disabled={false}
                ></Button>
            </p>
        </div>
    );
}
