import styles from './ConfirmLimitModal.module.css';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import Button from '../../../Global/Button/Button';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import TokensArrow from '../../../Global/TokensArrow/TokensArrow';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import ConfirmationModalControl from '../../../Global/ConfirmationModalControl/ConfirmationModalControl';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

interface propsIF {
    initiateLimitOrderMethod: () => void;
    tokenAInputQty: string;
    tokenBInputQty: string;
    insideTickDisplayPrice: number;
    newLimitOrderTransactionHash: string;
    txErrorCode: string;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    startDisplayPrice: number;
    middleDisplayPrice: number;
    endDisplayPrice: number;
}

export default function ConfirmLimitModal(props: propsIF) {
    const {
        initiateLimitOrderMethod,
        newLimitOrderTransactionHash,
        txErrorCode,
        resetConfirmation,
        showConfirmation,
        setShowConfirmation,
        startDisplayPrice,
        middleDisplayPrice,
        endDisplayPrice,
        tokenAInputQty,
        tokenBInputQty,
    } = props;

    const { poolPriceDisplay } = useContext(PoolContext);
    const {
        bypassConfirmLimit,
        bypassConfirmRange,
        bypassConfirmRepo,
        bypassConfirmSwap,
    } = useContext(UserPreferenceContext);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const displayPoolPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;

    const displayPoolPriceString = getFormattedNumber({
        value: displayPoolPriceWithDenom,
    });

    const txApproved = newLimitOrderTransactionHash !== '';
    const isTxDenied = txErrorCode === 'ACTION_REJECTED';
    const isTxException = txErrorCode !== '' && !isTxDenied;

    const localeSellString = getFormattedNumber({
        value: parseFloat(tokenAInputQty),
    });
    const localeBuyString = getFormattedNumber({
        value: parseFloat(tokenBInputQty),
    });

    const sellTokenData = tradeData.tokenA;
    const buyTokenData = tradeData.tokenB;

    const buyCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{localeBuyString}</h2>

            <div className={styles.logo_display}>
                <TokenIcon
                    src={buyTokenData.logoURI}
                    alt={buyTokenData.symbol}
                    size='3xl'
                />
                <h2>{buyTokenData.symbol}</h2>
            </div>
        </div>
    );
    const sellCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{localeSellString}</h2>

            <div className={styles.logo_display}>
                <TokenIcon
                    src={sellTokenData.logoURI}
                    alt={sellTokenData.symbol}
                    size='3xl'
                />
                <h2>{sellTokenData.symbol}</h2>
            </div>
        </div>
    );

    const startPriceString = getFormattedNumber({
        value: startDisplayPrice,
    });
    const middlePriceString = getFormattedNumber({
        value: middleDisplayPrice,
    });
    const endPriceString = getFormattedNumber({
        value: endDisplayPrice,
    });

    // this is the starting state for the bypass confirmation toggle switch
    // if this modal is being shown, we can assume bypass is disabled
    const [currentSkipConfirm, setCurrentSkipConfirm] =
        useState<boolean>(false);

    const fullTxDetails = (
        <div className={styles.main_container}>
            <section>
                {sellCurrencyRow}
                <div className={styles.arrow_container}>
                    <TokensArrow onlyDisplay />
                </div>
                {buyCurrencyRow}
            </section>
            <div className={styles.extra_info_container}>
                <div className={styles.row}>
                    <p>Current Price</p>
                    <p>
                        {isDenomBase
                            ? `${displayPoolPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                            : `${displayPoolPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                    </p>
                </div>
                <div className={styles.row}>
                    <p>Fill Start</p>
                    <p>
                        {isDenomBase
                            ? `${startPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                            : `${startPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                    </p>
                </div>
                <div className={styles.row}>
                    <p>Fill Middle</p>
                    <p>
                        {isDenomBase
                            ? `${middlePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                            : `${middlePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                    </p>
                </div>
                <div className={styles.row}>
                    <p>Fill End</p>
                    <p>
                        {isDenomBase
                            ? `${endPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                            : `${endPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                    </p>
                </div>
            </div>
            <div className={styles.confSwap_detail_note}>
                {`${tradeData.tokenB.symbol} will be available for withdrawal after the limit order is filled. 
                ${tradeData.tokenA.symbol} can be withdrawn at any time before fill completion.`}
            </div>
            <ConfirmationModalControl
                tempBypassConfirm={currentSkipConfirm}
                setTempBypassConfirm={setCurrentSkipConfirm}
            />
        </div>
    );

    // REGULAR CONFIRMATION MESSAGE STARTS HERE
    const confirmSendMessage = (
        <WaitingConfirmation
            content={` Submitting Limit Order to Swap ${localeSellString} ${sellTokenData.symbol} for ${localeBuyString} ${buyTokenData.symbol}.`}
        />
    );

    const txDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );
    const txException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const txSubmitted = (
        <TransactionSubmitted
            hash={newLimitOrderTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
            chainId={buyTokenData.chainId}
            limit
        />
    );

    const confirmationDisplay: JSX.Element = isTxException
        ? txException
        : isTxDenied
        ? txDenied
        : txApproved
        ? txSubmitted
        : confirmSendMessage;

    return (
        <div className={styles.modal_container}>
            <section className={styles.modal_content}>
                {showConfirmation ? fullTxDetails : confirmationDisplay}
            </section>
            <footer className={styles.modal_footer}>
                {showConfirmation && (
                    <Button
                        title='Submit Limit Order'
                        // if this modal is launched we can infer user wants confirmation
                        // if user enables bypass, update all settings in parallel
                        // otherwise do not not make any change to persisted preferences
                        action={() => {
                            if (currentSkipConfirm) {
                                bypassConfirmSwap.enable();
                                bypassConfirmLimit.enable();
                                bypassConfirmRange.enable();
                                bypassConfirmRepo.enable();
                            }
                            initiateLimitOrderMethod();
                            setShowConfirmation(false);
                        }}
                        flat
                    />
                )}
            </footer>
        </div>
    );
}
