import styles from './TransactionSubmitted.module.css';
import Animation from '../../../../Global/Animation/Animation';
import completed from '../../../../../assets/animations/completed.json';
import addTokenToWallet from './addTokenToWallet';
import Button from '../../../../Form/Button';
import { FiExternalLink } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { getChainExplorer } from '../../../../../ambient-utils/dataLayer';

interface PropsIF {
    type:
        | 'Swap'
        | 'Limit'
        | 'Range'
        | 'Reposition'
        | 'Remove'
        | 'Harvest'
        | 'Claim'
        | 'Reset';
    hash: string;
    tokenBAddress: string;
    tokenBSymbol: string;
    tokenBDecimals: number;
    tokenBImage: string;
    chainId: string | number;
    isConfirmed: boolean;
    isTransactionFailed: boolean;
    noAnimation?: boolean;
}

export default function TransactionSubmitted(props: PropsIF) {
    const {
        type,
        hash,
        tokenBAddress,
        tokenBSymbol,
        tokenBDecimals,
        tokenBImage,
        noAnimation,
        chainId,
        isConfirmed,
        isTransactionFailed,
    } = props;

    const blockExplorer = getChainExplorer(chainId);
    const txUrlOnBlockExplorer = `${blockExplorer}tx/${hash}`;
    const currentLocation = useLocation()?.pathname;

    const logoURI = tokenBImage;

    const handleAddToMetaMask = async () => {
        await addTokenToWallet(
            tokenBAddress,
            tokenBSymbol,
            tokenBDecimals,
            logoURI,
        );
    };

    const addToMetaMaskButton = (
        <Button
            idForDOM='import_token_B_into_wallet_button'
            flat
            title={`Import ${tokenBSymbol} into Connected Wallet`}
            action={handleAddToMetaMask}
            disabled={false}
        />
    );

    const etherscanButton = (
        <a
            href={txUrlOnBlockExplorer}
            target='_blank'
            rel='noreferrer'
            className={styles.view_etherscan}
            aria-label='view on block explorer'
        >
            View on Block Explorer
            <FiExternalLink size={18} color='var(--text1)' />
        </a>
    );
    return (
        <div
            className={`${styles.transaction_submitted} ${
                noAnimation && styles.noAnimation_submitted
            }`}
        >
            <div
                style={{
                    height: noAnimation ? 'auto' : '180px',
                }}
            >
                {!noAnimation && (
                    <div className={styles.completed_animation}>
                        <Animation animData={completed} loop={false} />
                    </div>
                )}
            </div>

            <h2 style={{ marginBottom: '15px' }}>
                {type === 'Limit'
                    ? `Limit Order ${
                          isTransactionFailed
                              ? 'Failed'
                              : isConfirmed
                              ? 'Success!'
                              : 'Submitted'
                      }`
                    : type === 'Range'
                    ? `Pool ${
                          isTransactionFailed
                              ? 'Failed'
                              : isConfirmed
                              ? 'Success!'
                              : 'Submitted'
                      }`
                    : type === 'Reposition'
                    ? `Reposition ${
                          isTransactionFailed
                              ? 'Failed'
                              : isConfirmed
                              ? 'Success!'
                              : 'Submitted'
                      }`
                    : type === 'Harvest'
                    ? `Harvest ${
                          isTransactionFailed
                              ? 'Failed'
                              : isConfirmed
                              ? 'Success!'
                              : 'Submitted'
                      }`
                    : type === 'Reset'
                    ? `Reset ${
                          isTransactionFailed
                              ? 'Failed'
                              : isConfirmed
                              ? 'Success!'
                              : 'Submitted'
                      }`
                    : type === 'Remove'
                    ? `Removal ${
                          isTransactionFailed
                              ? 'Failed'
                              : isConfirmed
                              ? 'Success!'
                              : 'Submitted'
                      }`
                    : type === 'Claim'
                    ? `Claim ${
                          isTransactionFailed
                              ? 'Failed'
                              : isConfirmed
                              ? 'Success!'
                              : 'Submitted'
                      }`
                    : `Swap ${
                          isTransactionFailed
                              ? 'Failed'
                              : isConfirmed
                              ? 'Success!'
                              : 'Submitted'
                      }`}
            </h2>
            <div
                className={`${styles.action_buttons} ${
                    noAnimation && styles.bypass_buttons
                }`}
            >
                {txUrlOnBlockExplorer && etherscanButton}
                {tokenBSymbol === 'ETH' || currentLocation === '/trade/pool'
                    ? null
                    : addToMetaMaskButton}
            </div>
        </div>
    );
}
