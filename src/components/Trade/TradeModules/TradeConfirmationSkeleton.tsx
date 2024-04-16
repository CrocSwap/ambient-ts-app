// START: Import React and Dongles
import { useContext, useState } from 'react';

// START: Import JSX Components
import Button from '../../Form/Button';

// START: Import Other Local Files
import { TokenIF } from '../../../ambient-utils/types';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import ConfirmationModalControl from '../../Global/ConfirmationModalControl/ConfirmationModalControl';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import SubmitTransaction from './SubmitTransaction/SubmitTransaction';
import Modal from '../../Global/Modal/Modal';
import { FlexContainer, Text } from '../../../styled/Common';
import {
    ConfirmationDetailsContainer,
    ConfirmationQuantityContainer,
    ModalContainer,
} from '../../../styled/Components/TradeModules';

interface propsIF {
    type: 'Swap' | 'Limit' | 'Range' | 'Reposition';
    tokenA: { token: TokenIF; quantity?: string };
    tokenB: { token: TokenIF; quantity?: string };
    transactionHash: string;
    txErrorCode: string;
    txErrorMessage: string;
    txErrorJSON: string;
    showConfirmation: boolean;
    statusText: string;
    onClose?: () => void;
    initiate: () => Promise<void>;
    resetConfirmation: () => void;
    poolTokenDisplay?: React.ReactNode;
    transactionDetails?: React.ReactNode;
    acknowledgeUpdate?: React.ReactNode;
    extraNotes?: React.ReactNode;
    priceImpactWarning?: JSX.Element | undefined;
    isAllowed?: boolean;
    percentDiffUsdValue?: number | undefined;
}

export default function TradeConfirmationSkeleton(props: propsIF) {
    const {
        onClose = () => null,
        type,
        initiate,
        tokenA: { token: tokenA, quantity: tokenAQuantity },
        tokenB: { token: tokenB, quantity: tokenBQuantity },
        transactionDetails,
        transactionHash,
        txErrorCode,
        txErrorMessage,
        txErrorJSON,
        statusText,
        showConfirmation,
        resetConfirmation,
        poolTokenDisplay,
        acknowledgeUpdate,
        extraNotes,
        priceImpactWarning,
        isAllowed,
        percentDiffUsdValue,
    } = props;

    const {
        bypassConfirmLimit,
        bypassConfirmRange,
        bypassConfirmRepo,
        bypassConfirmSwap,
    } = useContext(UserPreferenceContext);

    const [skipFutureConfirmation, setSkipFutureConfirmation] =
        useState<boolean>(false);

    const showWarning =
        percentDiffUsdValue !== undefined && percentDiffUsdValue < -10;

    const formattedUsdDifference =
        percentDiffUsdValue !== undefined
            ? getFormattedNumber({
                  value: percentDiffUsdValue,
                  isPercentage: true,
              }) + '%'
            : undefined;

    const tokenDisplay = (
        <>
            <ConfirmationQuantityContainer>
                <Text fontSize='header2' color='text1'>
                    {tokenAQuantity}
                </Text>
                <FlexContainer
                    alignItems='center'
                    justifyContent='space-between'
                    margin='0 0 0 1rem'
                >
                    <TokenIcon
                        token={tokenA}
                        src={uriToHttp(tokenA.logoURI)}
                        alt={tokenA.symbol}
                        size='2xl'
                    />
                    <Text fontSize='header2' color='text1'>
                        {tokenA.symbol}
                    </Text>
                </FlexContainer>
            </ConfirmationQuantityContainer>
            <FlexContainer
                fullWidth
                justifyContent='center'
                alignItems='center'
            >
                <TokensArrow onlyDisplay />
            </FlexContainer>
            <ConfirmationQuantityContainer>
                <Text fontSize='header2' color='text1'>
                    <span>{tokenBQuantity}</span>
                    {showWarning && (
                        <span
                            style={
                                showWarning
                                    ? { color: 'var(--other-red)' }
                                    : undefined
                            }
                        >
                            {`${' '}(${formattedUsdDifference})`}
                        </span>
                    )}
                </Text>
                <FlexContainer
                    alignItems='center'
                    justifyContent='space-between'
                    margin='0 0 0 1rem'
                >
                    <TokenIcon
                        token={tokenB}
                        src={uriToHttp(tokenB.logoURI)}
                        alt={tokenB.symbol}
                        size='2xl'
                    />
                    <Text fontSize='header2' color='text1'>
                        {tokenB.symbol}
                    </Text>
                </FlexContainer>
            </ConfirmationQuantityContainer>
        </>
    );

    return (
        <Modal
            title={`${type === 'Range' ? 'Pool' : type} Confirmation`}
            onClose={onClose}
        >
            <ModalContainer
                flexDirection='column'
                padding='16px'
                gap={8}
                aria-label='Transaction Confirmation modal'
            >
                {type === 'Swap' || type === 'Limit'
                    ? tokenDisplay
                    : poolTokenDisplay}
                {transactionDetails && (
                    <ConfirmationDetailsContainer
                        flexDirection='column'
                        gap={8}
                        padding='8px'
                    >
                        {transactionDetails}
                    </ConfirmationDetailsContainer>
                )}
                {priceImpactWarning}
                {extraNotes && extraNotes}
                <footer>
                    {!showConfirmation ? (
                        !acknowledgeUpdate ? (
                            <>
                                <ConfirmationModalControl
                                    tempBypassConfirm={skipFutureConfirmation}
                                    setTempBypassConfirm={
                                        setSkipFutureConfirmation
                                    }
                                />
                                <Button
                                    idForDOM='set_skip_confirmation_button'
                                    style={{ textTransform: 'none' }}
                                    title={statusText}
                                    action={() => {
                                        // if this modal is launched we can infer user wants confirmation
                                        // if user enables bypass, update all settings in parallel
                                        // otherwise do not not make any change to persisted preferences
                                        if (skipFutureConfirmation) {
                                            bypassConfirmSwap.enable();
                                            bypassConfirmLimit.enable();
                                            bypassConfirmRange.enable();
                                            bypassConfirmRepo.enable();
                                        }
                                        initiate();
                                    }}
                                    flat
                                    disabled={
                                        isAllowed === false ||
                                        !!acknowledgeUpdate
                                    }
                                />
                            </>
                        ) : (
                            acknowledgeUpdate
                        )
                    ) : (
                        <SubmitTransaction
                            type={type}
                            newTransactionHash={transactionHash}
                            txErrorCode={txErrorCode}
                            txErrorMessage={txErrorMessage}
                            txErrorJSON={txErrorJSON}
                            resetConfirmation={resetConfirmation}
                            sendTransaction={initiate}
                            transactionPendingDisplayString={statusText}
                            disableSubmitAgain
                        />
                    )}
                </footer>
            </ModalContainer>
        </Modal>
    );
}
