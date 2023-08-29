// START: Import React and Dongles
import { useContext, useState } from 'react';

// START: Import JSX Components
import Button from '../../Global/Button/Button';

// START: Import Other Local Files
import { TokenIF } from '../../../utils/interfaces/exports';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import uriToHttp from '../../../utils/functions/uriToHttp';
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
    showConfirmation: boolean;
    statusText: string;
    onClose?: () => void;
    initiate: () => Promise<void>;
    resetConfirmation: () => void;
    poolTokenDisplay?: React.ReactNode;
    transactionDetails?: React.ReactNode;
    acknowledgeUpdate?: React.ReactNode;
    extraNotes?: React.ReactNode;
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
        statusText,
        showConfirmation,
        resetConfirmation,
        poolTokenDisplay,
        acknowledgeUpdate,
        extraNotes,
    } = props;

    const {
        bypassConfirmLimit,
        bypassConfirmRange,
        bypassConfirmRepo,
        bypassConfirmSwap,
    } = useContext(UserPreferenceContext);

    const [skipFutureConfirmation, setSkipFutureConfirmation] =
        useState<boolean>(false);

    const formattedTokenAQuantity = getFormattedNumber({
        value: tokenAQuantity ? parseFloat(tokenAQuantity) : undefined,
        abbrevThreshold: 1000000000,
    });

    const formattedTokenBQuantity = getFormattedNumber({
        value: tokenBQuantity ? parseFloat(tokenBQuantity) : undefined,
        abbrevThreshold: 1000000000,
    });

    const tokenDisplay = (
        <>
            <ConfirmationQuantityContainer>
                <Text fontSize='header2' color='text1'>
                    {formattedTokenAQuantity}
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
                    {formattedTokenBQuantity}
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
                background='dark1'
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
                                    disabled={!!acknowledgeUpdate}
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
                            resetConfirmation={resetConfirmation}
                            sendTransaction={initiate}
                            transactionPendingDisplayString={statusText}
                        />
                    )}
                </footer>
            </ModalContainer>
        </Modal>
    );
}
