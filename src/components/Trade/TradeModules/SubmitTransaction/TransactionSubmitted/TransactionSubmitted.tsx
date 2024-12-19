import { useWeb3ModalProvider } from '@web3modal/ethers/react';
import { FiExternalLink } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { brand } from '../../../../../ambient-utils/constants';
import { getChainExplorer } from '../../../../../ambient-utils/dataLayer';
import Button from '../../../../Form/Button';
import addTokenToWallet from './addTokenToWallet';
import styles from './TransactionSubmitted.module.css';

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
    const isFuta = brand === 'futa';

    const logoURI = tokenBImage;

    const { walletProvider } = useWeb3ModalProvider();
    const handleAddToMetaMask = async () => {
        await addTokenToWallet(
            tokenBAddress,
            tokenBSymbol,
            tokenBDecimals,
            logoURI,
            walletProvider,
        );
    };

    const addToMetaMaskButton = (
        <Button
            idForDOM='import_token_B_into_wallet_button'
            flat
            title={`import ${tokenBSymbol} into Connected Wallet`}
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
            style={{ color: isFuta ? 'var(--dark1)' : 'var(--text1)' }}
        >
            View on Block Explorer
            <FiExternalLink
                size={18}
                color={isFuta ? 'var(--dark1)' : 'var(--text1)'}
            />
        </a>
    );
    return (
        <div
            className={`${styles.transaction_submitted} ${
                noAnimation && styles.noAnimation_submitted
            }`}
        >
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
