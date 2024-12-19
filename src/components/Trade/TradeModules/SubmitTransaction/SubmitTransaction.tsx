import { useContext, useEffect, useState } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { uriToHttp } from '../../../../ambient-utils/dataLayer';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { FlexContainer } from '../../../../styled/Common';
import {
    SubmitTransactionButton,
    SubmitTransactionExtraButton,
} from '../../../../styled/Components/TradeModules';
import {
    isTransactionDeniedError,
    parseErrorMessage,
} from '../../../../utils/TransactionError';
import {
    CircleLoaderCompleted,
    CircleLoaderFailed,
} from '../../../Global/LoadingAnimations/CircleLoader/CircleLoader';
import Spinner from '../../../Global/Spinner/Spinner';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionDenied from './TransactionDenied/TransactionDenied';
import TransactionException from './TransactionException/TransactionException';
import TransactionFailed from './TransactionFailed/TransactionFailed';
import TransactionSubmitted from './TransactionSubmitted/TransactionSubmitted';

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
    txError: Error | undefined;
    resetConfirmation: () => void;
    sendTransaction: () => Promise<void>;
    transactionPendingDisplayString: string;
    disableSubmitAgain?: boolean;
}
export default function SubmitTransaction(props: propsIF) {
    const {
        type,
        newTransactionHash,
        txError,
        resetConfirmation,
        sendTransaction,
        transactionPendingDisplayString,
        disableSubmitAgain,
    } = props;

    const { pendingTransactions, sessionReceipts } = useContext(ReceiptContext);

    const isTransactionApproved = newTransactionHash !== '';
    const isTransactionDenied = isTransactionDeniedError(txError);
    const isTransactionException =
        txError !== undefined && !isTransactionDenied;
    const isTransactionPending = !(
        isTransactionApproved ||
        isTransactionDenied ||
        isTransactionException
    );
    const isTransactionConfirmed =
        isTransactionApproved &&
        !pendingTransactions.includes(newTransactionHash);

    const { tokenB } = useContext(TradeDataContext);

    const confirmSendMessage = (
        <WaitingConfirmation
            noAnimation
            content={transactionPendingDisplayString}
        />
    );

    function handleReset() {
        resetConfirmation();
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
    const transactionException = <TransactionException txError={txError} />;

    const [isTransactionFailed, setIsTransactionFailed] =
        useState<boolean>(false);

    // set isTransactionFailed to true if last receipt failed
    useEffect(() => {
        const lastReceipt =
            sessionReceipts.length > 0 ? sessionReceipts[0] : null;
        if (
            lastReceipt?.status === 0 &&
            lastReceipt.hash === newTransactionHash
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
        ? parseErrorMessage(txError).toLowerCase().includes('gas')
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

    const [showExtraInfo, setShowExtraInfo] = useState(false);

    useEffect(() => {
        if (isTransactionException) {
            setShowExtraInfo(true);
        }
    }, [isTransactionException]);

    return (
        <FlexContainer flexDirection='column' gap={8}>
            <SubmitTransactionButton
                onClick={() => setShowExtraInfo(!showExtraInfo)}
                style={{ textTransform: 'none' }}
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
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={8}
            >
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
                        }}
                    >
                        Retry
                    </SubmitTransactionExtraButton>
                )}
            </FlexContainer>
        </FlexContainer>
    );
}
