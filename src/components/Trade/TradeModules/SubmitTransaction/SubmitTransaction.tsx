import { useContext, useEffect, useState } from 'react';
import { RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';
import { uriToHttp } from '../../../../ambient-utils/dataLayer';
import {
    CircleLoaderFailed,
    CircleLoaderCompleted,
} from '../../../Global/LoadingAnimations/CircleLoader/CircleLoader';
import Spinner from '../../../Global/Spinner/Spinner';
import TransactionDenied from './TransactionDenied/TransactionDenied';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionException from './TransactionException/TransactionException';
import TransactionFailed from './TransactionFailed/TransactionFailed';
import TransactionSubmitted from './TransactionSubmitted/TransactionSubmitted';
import {
    SubmitTransactionButton,
    SubmitTransactionExtraButton,
} from '../../../../styled/Components/TradeModules';
import { FlexContainer, Text } from '../../../../styled/Common';
import StepperComponent from '../../../Global/MultiStepTransaction/StepperComponent';
import Button from '../../../Form/Button';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import styles from './SubmitTransaction.module.css';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';

interface propsIF {
    type:
        | 'Swap'
        | 'Limit'
        | 'Range'
        | 'Reposition'
        | 'Remove'
        | 'Harvest'
        | 'Claim'
        | 'Reset';
    newTransactionHash: string;
    txErrorCode: string;
    txErrorMessage: string;
    resetConfirmation: () => void;
    sendTransaction: () => Promise<void>;
    transactionPendingDisplayString: string;
    disableSubmitAgain?: boolean;

    activeStep?: number;
    setActiveStep?: React.Dispatch<React.SetStateAction<number>>;
    steps?: {
        label: string;
    }[];
    stepperComponent?: boolean;
    stepperTokensDisplay?: React.ReactNode;
    handleSetActiveContent?: (newActiveContent: string) => void;
    setShowStepperComponent?: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function SubmitTransaction(props: propsIF) {
    const {
        type,
        newTransactionHash,
        txErrorCode,
        txErrorMessage,
        resetConfirmation,
        sendTransaction,
        transactionPendingDisplayString,
        disableSubmitAgain,
        activeStep,
        setActiveStep,
        steps,
        stepperComponent,
        stepperTokensDisplay,
        handleSetActiveContent,
        setShowStepperComponent,
    } = props;

    const { pendingTransactions, sessionReceipts } = useContext(ReceiptContext);

    const isTransactionApproved = newTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;
    const isTransactionPending = !(
        isTransactionApproved ||
        isTransactionDenied ||
        isTransactionException
    );
    const isTransactionConfirmed =
        isTransactionApproved &&
        !pendingTransactions.includes(newTransactionHash);

    const { tokenB, activateConfirmation } = useContext(TradeDataContext);

    // const {isConfirmationActive,  activateConfirmation,deactivateConfirmation } =
    // useContext(TradeDataContext);

    const confirmSendMessage = (
        <WaitingConfirmation
            noAnimation
            content={transactionPendingDisplayString}
        />
    );

    function handleReset() {
        resetConfirmation();
        setShowStepperComponent && setShowStepperComponent(false);
        handleSetActiveContent && handleSetActiveContent('main');
        setActiveStep && setActiveStep(0);
        setShowExtraInfo(false);
    }

    const transactionDenied = <TransactionDenied noAnimation />;
    const transactionFailed = (
        <TransactionFailed
            noAnimation
            resetConfirmation={handleReset}
            initiateTx={sendTransaction}
        />
    );
    const transactionException = (
        <TransactionException txErrorMessage={txErrorMessage} />
    );

    const [isTransactionFailed, setIsTransactionFailed] =
        useState<boolean>(false);

    // set isTransactionFailed to true if last receipt failed
    useEffect(() => {
        const lastReceipt =
            sessionReceipts.length > 0 ? JSON.parse(sessionReceipts[0]) : null;
        if (
            lastReceipt?.status === 0 &&
            lastReceipt.transactionHash === newTransactionHash
        ) {
            setIsTransactionFailed(true);
        } else {
            setIsTransactionFailed(false);
        }
    }, [sessionReceipts, newTransactionHash]);

    const transactionSubmitted = (
        <TransactionSubmitted
            type={type}
            hash={newTransactionHash}
            tokenBSymbol={tokenB.symbol}
            tokenBAddress={tokenB.address}
            tokenBDecimals={tokenB.decimals}
            tokenBImage={uriToHttp(tokenB.logoURI)}
            chainId={tokenB.chainId}
            isConfirmed={isTransactionConfirmed}
            isTransactionFailed={isTransactionFailed}
            noAnimation
            stepperComponent
        />
    );
    const confirmationDisplay = isTransactionException
        ? transactionException
        : isTransactionDenied
        ? transactionDenied
        : isTransactionApproved
        ? transactionSubmitted
        : isTransactionFailed
        ? transactionFailed
        : confirmSendMessage;

    const buttonColor =
        isTransactionException || isTransactionDenied || isTransactionFailed
            ? 'var(--negative)'
            : isTransactionApproved
            ? 'var(--positive)'
            : 'var(--accent1)';

    const animationDisplay = isTransactionException ? (
        <CircleLoaderFailed size='30px' />
    ) : isTransactionDenied || isTransactionFailed ? (
        <CircleLoaderFailed size='30px' />
    ) : isTransactionApproved ? (
        <CircleLoaderCompleted size='30px' />
    ) : (
        <Spinner size='30' bg='var(--dark2)' />
    );

    const buttonText = isTransactionException
        ? txErrorMessage?.toLowerCase().includes('gas')
            ? 'Wallet Balance Insufficient to Cover Gas'
            : 'Transaction Exception'
        : isTransactionDenied
        ? 'Transaction Denied'
        : isTransactionFailed
        ? 'Transaction Failed'
        : isTransactionConfirmed
        ? 'Transaction Confirmed'
        : isTransactionApproved
        ? 'Transaction Submitted'
        : transactionPendingDisplayString;

    const resetOrRetryButton = (
        <FlexContainer alignItems='center' justifyContent='flex-end' gap={8}>
            {!isTransactionPending && (
                <SubmitTransactionExtraButton
                    onClick={() => {
                        resetConfirmation();
                    }}
                >
                    {disableSubmitAgain
                        ? 'Reset'
                        : 'Submit another transaction'}
                </SubmitTransactionExtraButton>
            )}
            {(isTransactionDenied || isTransactionException) && (
                <SubmitTransactionExtraButton
                    onClick={() => {
                        resetConfirmation();
                        sendTransaction();
                        activateConfirmation(type);
                    }}
                >
                    Retry
                </SubmitTransactionExtraButton>
            )}
        </FlexContainer>
    );

    const [showExtraInfo, setShowExtraInfo] = useState(false);

    const isError =
        isTransactionDenied || isTransactionException || isTransactionFailed;

    const stepperActionButton = (
        <Button
            title={
                isError
                    ? 'Try again'
                    : isTransactionConfirmed
                    ? 'Send another transaction'
                    : 'Placeholder text'
            }
            action={() => {
                isError
                    ? (resetConfirmation(),
                      sendTransaction(),
                      activateConfirmation(type))
                    : handleReset();
            }}
            flat
            idForDOM='stepper_action_button'
        />
    );

    const stepperMessage = isTransactionPending ? (
        <Text color='text2' fontSize='body' style={{ textAlign: 'center' }}>
            Proceed in your wallet
        </Text>
    ) : isTransactionException ? (
        transactionException
    ) : isTransactionDenied ? (
        transactionDenied
    ) : isTransactionConfirmed ? (
        transactionSubmitted
    ) : (
        <Text placeholder fontSize='body'>
            ...
        </Text>
    );

    if (stepperComponent)
        return (
            <FlexContainer
                flexDirection='column'
                gap={16}
                justifyContent='space-between'
                height='100%'
            >
                <FlexContainer
                    justifyContent='center'
                    alignItems='center'
                    height='100%'
                >
                    <StepperComponent
                        orientation='vertical'
                        steps={steps}
                        activeStep={activeStep}
                        setActiveStep={setActiveStep}
                        isError={isError}
                    />
                </FlexContainer>
                <FlexContainer
                    flexDirection='column'
                    gap={16}
                    style={{ height: '160px' }}
                >
                    {stepperTokensDisplay}
                    {stepperMessage}
                </FlexContainer>
                <footer
                    style={{ marginTop: 'auto', padding: '0 32px' }}
                    className={
                        isError || isTransactionConfirmed
                            ? styles.action_button_enabled
                            : styles.action_button_disabled
                    }
                >
                    {stepperActionButton}
                </footer>
            </FlexContainer>
        );

    return (
        <FlexContainer flexDirection='column' gap={8}>
            <SubmitTransactionButton
                onClick={() => setShowExtraInfo(!showExtraInfo)}
            >
                <div>{animationDisplay}</div>
                <div style={{ color: buttonColor }}>{buttonText}</div>
                {!isTransactionPending ? (
                    showExtraInfo ? (
                        <RiArrowUpSLine size={20} />
                    ) : (
                        <RiArrowDownSLine size={20} />
                    )
                ) : (
                    <div />
                )}
            </SubmitTransactionButton>

            {showExtraInfo && (
                <FlexContainer
                    fullWidth
                    alignItems='center'
                    justifyContent='center'
                    padding='12px'
                    background='dark2'
                    rounded
                >
                    {confirmationDisplay}
                </FlexContainer>
            )}
            {resetOrRetryButton}
        </FlexContainer>
    );
}
