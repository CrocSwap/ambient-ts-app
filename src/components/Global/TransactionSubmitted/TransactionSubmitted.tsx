import styles from './TransactionSubmitted.module.css';
import Animation from '../../Global/Animation/Animation';
import completed from '../../../assets/animations/completed.json';
import addTokenToWallet from './addTokenToWallet';
import Button from '../../Global/Button/Button';
import { FiExternalLink } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { getChainExplorer } from '../../../utils/data/chains';

interface TransactionSubmittedProps {
    hash: string;
    tokenBAddress: string;
    tokenBSymbol: string;
    tokenBDecimals: number;
    tokenBImage: string;
    chainId: string | number;
    noAnimation?: boolean;
    limit?: boolean;
    range?: boolean;
}

export default function TransactionSubmitted(props: TransactionSubmittedProps) {
    const {
        hash,
        tokenBAddress,
        tokenBSymbol,
        tokenBDecimals,
        tokenBImage,
        noAnimation,
        limit,
        range,
        chainId,
    } = props;
    const blockExploer = getChainExplorer(chainId);
    const EthersanTx = `${blockExploer}/tx/${hash}`;
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
            <FiExternalLink size={20} color='var(--text-grey-white)' />
        </a>
    );
    return (
        <div className={styles.transaction_submitted}>
            <div
                style={{
                    height: '180px',
                }}
            >
                {!noAnimation && (
                    <div className={styles.completed_animation}>
                        <Animation animData={completed} loop={false} />
                    </div>
                )}
            </div>

            <h2 style={{ marginBottom: '15px' }}>
                {limit
                    ? 'Limit Transaction Successfully Submitted'
                    : range
                    ? 'Range Transaction Successfully Submitted'
                    : 'Swap Transaction Successfully Submitted'}
            </h2>
            <div className={styles.action_buttons}>
                {EthersanTx && etherscanButton}
                {tokenBSymbol === 'ETH' || currentLocation === '/trade/range'
                    ? null
                    : addToMetamaskButton}
            </div>
        </div>
    );
}
