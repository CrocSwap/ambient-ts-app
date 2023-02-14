// import Divider from '../../../Global/Divider/Divider';
import RepositionPriceInfo from '../RepositionPriceInfo/RepositionPriceInfo';
import styles from './ConfirmRepositionModal.module.css';
import Button from '../../../Global/Button/Button';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { Dispatch, SetStateAction } from 'react';
import { CrocEnv } from '@crocswap-libs/sdk';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import { TokenPairIF } from '../../../../utils/interfaces/TokenPairIF';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';

interface ConfirmRepositionModalProps {
    onClose: () => void;
    crocEnv: CrocEnv | undefined;
    position: PositionIF;
    newRepositionTransactionHash: string;
    tokenPair: TokenPairIF;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
    rangeWidthPercentage: number;
    currentPoolPriceTick: number;
    currentPoolPriceDisplay: string;
    onSend: () => void;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    txErrorCode: string;
    txErrorMessage: string;
}

export default function ConfirmRepositionModal(props: ConfirmRepositionModalProps) {
    const {
        crocEnv,
        position,
        tokenPair,
        ambientApy,
        dailyVol,
        currentPoolPriceDisplay,
        currentPoolPriceTick,
        rangeWidthPercentage,
        onSend,
        setMinPrice,
        setMaxPrice,
        showConfirmation,
        setShowConfirmation,
        newRepositionTransactionHash,
        resetConfirmation,
        txErrorCode,
        // txErrorMessage,
    } = props;

    // const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;

    const transactionApproved = newRepositionTransactionHash !== '';

    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';

    const sendButton = (
        <Button
            title='Send Reposition'
            action={() => {
                setShowConfirmation(false);

                onSend();
            }}
            flat={true}
        />
    );

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newRepositionTransactionHash}
            tokenBSymbol={tokenB.symbol}
            tokenBAddress={tokenB.address}
            tokenBDecimals={tokenB.decimals}
            tokenBImage={tokenB.logoURI}
        />
    );

    const confirmSendMessage = (
        <WaitingConfirmation content={'Repositioning'} />
        //  <WaitingConfirmation
        //      content={`Minting a Position with ${tokenAQty ? tokenAQty : '0'} ${
        //          tokenA.symbol
        //      } and ${tokenBQty ? tokenBQty : '0'} ${
        //          tokenB.symbol
        //      }. Please check the ${'Metamask'} extension in your browser for notifications.`}
        //  />
    );

    const transactionDenied = <TransactionDenied resetConfirmation={resetConfirmation} />;
    const transactionException = <TransactionException resetConfirmation={resetConfirmation} />;

    const confirmationDisplay =
        isTransactionException || isGasLimitException || isInsufficientFundsException
            ? transactionException
            : isTransactionDenied
            ? transactionDenied
            : transactionApproved
            ? transactionSubmitted
            : confirmSendMessage;

    const fullTxDetails = (
        <div>
            {/* <h1>confirm reposition token content here</h1> */}
            {/* <Divider /> */}
            <RepositionPriceInfo
                crocEnv={crocEnv}
                position={position}
                rangeWidthPercentage={rangeWidthPercentage}
                currentPoolPriceTick={currentPoolPriceTick}
                currentPoolPriceDisplay={currentPoolPriceDisplay}
                ambientApy={ambientApy}
                dailyVol={dailyVol}
                setMaxPrice={setMaxPrice}
                setMinPrice={setMinPrice}
                isConfirmModal={true}
            />
        </div>
    );

    return (
        <div className={styles.confirm_range_modal_container}>
            <div>{showConfirmation ? fullTxDetails : confirmationDisplay}</div>
            <footer className={styles.modal_footer}>{showConfirmation ? sendButton : null}</footer>
        </div>
    );
}
