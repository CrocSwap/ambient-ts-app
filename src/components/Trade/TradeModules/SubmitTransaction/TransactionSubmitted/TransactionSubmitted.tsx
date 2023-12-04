import styles from './TransactionSubmitted.module.css';
import Animation from '../../../../Global/Animation/Animation';
import completed from '../../../../../assets/animations/completed.json';
import addTokenToWallet from './addTokenToWallet';
import { useLocation } from 'react-router-dom';
import { FlexContainer, Text } from '../../../../../styled/Common';
import { getChainExplorer } from '../../../../../ambient-utils/dataLayer';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface PropsIF {
    type:
        | 'Swap'
        | 'Limit'
        | 'Range'
        | 'Reposition'
        | 'Remove'
        | 'Harvest'
        | 'Reset';
    hash: string;
    tokenBAddress: string;
    tokenBSymbol: string;
    tokenBDecimals: number;
    tokenBImage: string;
    chainId: string | number;
    isConfirmed: boolean;
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
        stepperComponent,
    } = props;

    const [showActionButtons, setShowActionButtons] = useState(false);

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
            View on Explorer
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
            <FlexContainer
                justifyContent='center'
                gap={8}
                alignItems='center'
                style={{ marginBottom: '15px' }}
            >
                <Text color='text1' fontSize='header2'>
                    {type === 'Limit'
                        ? isConfirmed
                            ? 'Limit Order Success!'
                            : 'Successfully Submitted'
                        : type === 'Range'
                        ? isConfirmed
                            ? 'Pool Success!'
                            : 'Successfully Submitted'
                        : type === 'Reposition'
                        ? `Reposition ${
                              isConfirmed
                                  ? 'Confirmed'
                                  : 'Successfully Submitted'
                          }`
                        : type === 'Reset'
                        ? `Reset ${
                              isConfirmed
                                  ? 'Confirmed'
                                  : 'Successfully Submitted'
                          }`
                        : type === 'Remove'
                        ? `Removal ${
                              isConfirmed
                                  ? 'Confirmed'
                                  : 'Successfully Submitted'
                          }`
                        : isConfirmed
                        ? 'Swap Success!'
                        : 'Successfully Submitted'}
                </Text>
                {stepperComponent &&
                    (showActionButtons ? (
                        <FaChevronUp
                            onClick={() =>
                                setShowActionButtons(!showActionButtons)
                            }
                        />
                    ) : (
                        <FaChevronDown
                            onClick={() =>
                                setShowActionButtons(!showActionButtons)
                            }
                        />
                    ))}
            </FlexContainer>
            <div
                className={`${styles.action_buttons} ${
                    noAnimation && styles.bypass_buttons
                }`}
            >
                {(stepperComponent && showActionButtons) ||
                !stepperComponent ? (
                    <>
                        {txUrlOnBlockExplorer && etherscanButton}
                        {tokenBSymbol === 'ETH' ||
                        currentLocation === '/trade/pool'
                            ? null
                            : addToMetaMaskButton}
                    </>
                ) : null}
            </div>
        </div>
    );
}
