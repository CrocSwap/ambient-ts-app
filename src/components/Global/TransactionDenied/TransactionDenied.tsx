import styles from './TransactionDenied.module.css';
import Animation from '../Animation/Animation';
import NotFound from '../../../assets/animations/NotFound.json';
// import Button from '../Button/Button';

// interface TransactionSubmittedProps {
//     hash: string;
//     tokenBAddress: string;
//     tokenBSymbol: string;
//     tokenBDecimals: number;
//     tokenBImage: string;
// }

export default function TransactionDenied() {
    // const { hash, tokenBAddress, tokenBSymbol, tokenBDecimals, tokenBImage } = props;
    // const EthersanTx = `https://goerli.etherscan.io/tx/${hash}`;

    // const logoURI = tokenBImage;

    // const addToMetamaskButton = (
    //     // <Button
    //     //     title={`Add ${tokenBSymbol} to Metamask`}
    //     //     // action={props.onClickFn}
    //     //     action={handleAddToMetamask}
    //     //     disabled={false}
    //     // ></Button>
    // );
    return (
        <div className={styles.transaction_submitted}>
            <div className={styles.completed_animation}>
                <Animation animData={NotFound} loop={false} />
            </div>
            <h2>Transaction Denied in Wallet</h2>
            <p>
                {/* <a href={EthersanTx} target='_blank' rel='noreferrer'>
                    View on Etherscan
                </a> */}
                {/* {tokenBSymbol === 'ETH' ? null : addToMetamaskButton} */}
            </p>
        </div>
    );
}
