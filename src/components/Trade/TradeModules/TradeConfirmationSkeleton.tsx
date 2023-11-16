// START: Import React and Dongles
import { useContext, useState } from 'react';

// START: Import JSX Components
import Button from '../../Form/Button';

// START: Import Other Local Files
import { TokenIF } from '../../../utils/interfaces/exports';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import uriToHttp from '../../../utils/functions/uriToHttp';
import ConfirmationModalControl from '../../Global/ConfirmationModalControl/ConfirmationModalControl';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import SubmitTransaction from './SubmitTransaction/SubmitTransaction';
import { FlexContainer, Text } from '../../../styled/Common';
import {
    ConfirmationDetailsContainer,
    ConfirmationQuantityContainer,
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
    activeStep?: number;
    setActiveStep?: React.Dispatch<React.SetStateAction<number>>;
    steps?: {
        label: string;
    }[];
    handleSetActiveContent?: (newActiveContent: string) => void;
}

export default function TradeConfirmationSkeleton(props: propsIF) {
    const {
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
        activeStep,
        setActiveStep,
        steps,
        handleSetActiveContent,
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

    const confirmationContent = (
        <>
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
        </>
    );

    const [showStepperComponent, setShowStepperComponent] = useState(false);

    const tokensDisplay = (
        <FlexContainer gap={8} alignItems='center'>
            <TokenIcon
                token={tokenA}
                src={uriToHttp(tokenA.logoURI)}
                alt={tokenA.symbol}
                size='s'
            />
            <Text fontSize='body' color='text2' align='center'>
                {formattedTokenAQuantity} {tokenA.symbol}
            </Text>
            →
            <TokenIcon
                token={tokenB}
                src={uriToHttp(tokenB.logoURI)}
                alt={tokenB.symbol}
                size='s'
            />
            <Text fontSize='body' color='text2' align='center'>
                {formattedTokenBQuantity} {tokenB.symbol}
            </Text>
        </FlexContainer>
    );
    console.log({ showConfirmation });

    return (
        <FlexContainer
            flexDirection='column'
            gap={8}
            background='dark1'
            aria-label='Transaction Confirmation modal'
        >
            {!showStepperComponent && confirmationContent}
            <footer>
                {!showConfirmation ? (
                    !acknowledgeUpdate ? (
                        <>
                            <ConfirmationModalControl
                                tempBypassConfirm={skipFutureConfirmation}
                                setTempBypassConfirm={setSkipFutureConfirmation}
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
                                    console.log('showing stepper');
                                    setShowStepperComponent(true);
                                    initiate();
                                }}
                                flat
                                disabled={!!acknowledgeUpdate}
                                idForDOM='trade_conf_skeleton_btn'
                            />
                        </>
                    ) : (
                        acknowledgeUpdate
                    )
                ) : (
                    <FlexContainer flexDirection='column' alignItems='center'>
                        <SubmitTransaction
                            type={type}
                            newTransactionHash={transactionHash}
                            txErrorCode={txErrorCode}
                            resetConfirmation={resetConfirmation}
                            sendTransaction={initiate}
                            transactionPendingDisplayString={statusText}
                            disableSubmitAgain
                            activeStep={activeStep}
                            setActiveStep={setActiveStep}
                            steps={steps}
                            stepperComponent
                            stepperTokensDisplay={tokensDisplay}
                            handleSetActiveContent={handleSetActiveContent}
                        />
                    </FlexContainer>
                )}
            </footer>
        </FlexContainer>
    );
}
