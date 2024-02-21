import styles from './TransactionSubmitted.module.css';
import Animation from '../../../../Global/Animation/Animation';
import completed from '../../../../../assets/animations/completed.json';
import addTokenToWallet from './addTokenToWallet';
import { useLocation } from 'react-router-dom';
import { FlexContainer, Text } from '../../../../../styled/Common';
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
    stepperComponent?: boolean;
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
        <p onClick={handleAddToMetaMask} className={styles.view_etherscan}>
            {`Import ${tokenBSymbol} into Connected Wallet`}
        </p>
    );

    const etherscanButton = (
        <a
            href={txUrlOnBlockExplorer}
            target='_blank'
            rel='noreferrer'
            className={styles.view_etherscan}
            aria-label='view on explorer'
        >
            View on Block Explorer
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
            <FlexContainer flexDirection='column' gap={16}>
                <Text
                    color='text1'
                    fontSize='header2'
                    style={{ textAlign: 'center', width: '100%' }}
                >
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
                </Text>
                <div
                    className={`${styles.action_buttons} ${
                        noAnimation && styles.bypass_buttons
                    }`}
                >
                    <FlexContainer
                        justifyContent='center'
                        flexDirection='column'
                        gap={16}
                        alignItems='center'
                    >
                        {txUrlOnBlockExplorer && etherscanButton}
                        {tokenBSymbol === 'ETH' ||
                        currentLocation === '/trade/pool'
                            ? null
                            : addToMetaMaskButton}
                    </FlexContainer>
                </div>
            </FlexContainer>
        </div>
    );
}
