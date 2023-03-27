import styles from './ConfirmLimitModal.module.css';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import Button from '../../../Global/Button/Button';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import TokensArrow from '../../../Global/TokensArrow/TokensArrow';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import ConfirmationModalControl from '../../../Global/ConfirmationModalControl/ConfirmationModalControl';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import { allSkipConfirmMethodsIF } from '../../../../App/hooks/useSkipConfirm';

interface propsIF {
    onClose: () => void;
    initiateLimitOrderMethod: () => void;
    tokenPair: TokenPairIF;
    poolPriceDisplay: number;
    tokenAInputQty: string;
    tokenBInputQty: string;
    isTokenAPrimary: boolean;
    insideTickDisplayPrice: number;
    newLimitOrderTransactionHash: string;
    txErrorCode: string;
    txErrorMessage: string;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    startDisplayPrice: number;
    middleDisplayPrice: number;
    endDisplayPrice: number;
    bypassConfirm: allSkipConfirmMethodsIF;
}

export default function ConfirmLimitModal(props: propsIF) {
    const {
        tokenPair,
        poolPriceDisplay,
        initiateLimitOrderMethod,
        insideTickDisplayPrice,
        newLimitOrderTransactionHash,
        txErrorCode,
        resetConfirmation,
        showConfirmation,
        setShowConfirmation,
        startDisplayPrice,
        middleDisplayPrice,
        endDisplayPrice,
        bypassConfirm,
    } = props;
    const [transactionApproved, setTransactionApproved] =
        useState<boolean>(false);

    useEffect(() => {
        if (newLimitOrderTransactionHash) {
            setTransactionApproved(true);
        }
    }, [newLimitOrderTransactionHash]);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const displayPoolPriceWithDenom = isDenomBase
        ? 1 / poolPriceDisplay
        : poolPriceDisplay;

    const displayPoolPriceString =
        displayPoolPriceWithDenom === Infinity ||
        displayPoolPriceWithDenom === 0
            ? '…'
            : displayPoolPriceWithDenom < 2
            ? displayPoolPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : displayPoolPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const trunctatedInsideTickDisplayPrice =
        insideTickDisplayPrice < 2
            ? insideTickDisplayPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : insideTickDisplayPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';

    const sellTokenQty = (
        document.getElementById('sell-limit-quantity') as HTMLInputElement
    )?.value;
    const buyTokenQty = (
        document.getElementById('buy-limit-quantity') as HTMLInputElement
    )?.value;

    const sellTokenData = tokenPair.dataTokenA;

    const buyTokenData = tokenPair.dataTokenB;

    const explanationText = (
        <div
            className={styles.confSwap_detail_note}
        >{`${tokenPair.dataTokenB.symbol} will be available for withdrawl after the order is filled. ${tokenPair.dataTokenA.symbol} collateral can be withdrawn at any time before the limit order is filled.`}</div>
    );

    const buyCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{buyTokenQty}</h2>

            <div className={styles.logo_display}>
                {buyTokenData.logoURI ? (
                    <img src={buyTokenData.logoURI} alt={buyTokenData.symbol} />
                ) : (
                    <NoTokenIcon
                        tokenInitial={buyTokenData.symbol.charAt(0)}
                        width='35px'
                    />
                )}
                <h2>{buyTokenData.symbol}</h2>
            </div>
        </div>
    );
    const sellCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{sellTokenQty}</h2>

            <div className={styles.logo_display}>
                {sellTokenData.logoURI ? (
                    <img
                        src={sellTokenData.logoURI}
                        alt={sellTokenData.symbol}
                    />
                ) : (
                    <NoTokenIcon
                        tokenInitial={sellTokenData.symbol.charAt(0)}
                        width='35px'
                    />
                )}
                <h2>{sellTokenData.symbol}</h2>
            </div>
        </div>
    );

    const limitRateRow = (
        <div className={styles.limit_row_container}>
            <h2>@ {trunctatedInsideTickDisplayPrice}</h2>
        </div>
    );

    const startPriceString = !startDisplayPrice
        ? '…'
        : startDisplayPrice < 2
        ? startDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
          })
        : startDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const middlePriceString = !middleDisplayPrice
        ? '…'
        : middleDisplayPrice < 2
        ? middleDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
          })
        : middleDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const endPriceString = !endDisplayPrice
        ? '…'
        : endDisplayPrice < 2
        ? endDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
          })
        : endDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const extraInfoData = (
        <div className={styles.extra_info_container}>
            {/* <div className={styles.convRate}>
                {isDenomBase
                    ? `${trunctatedInsideTickDisplayPrice} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                    : `${trunctatedInsideTickDisplayPrice} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
            </div> */}
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
    );

    const [currentSkipConfirm, setCurrentSkipConfirm] = useState<boolean>(
        bypassConfirm.limit.isEnabled,
    );

    const toggleFor = 'limit';

    const fullTxDetails = (
        <div className={styles.main_container}>
            <section>
                {limitRateRow}
                {sellCurrencyRow}
                <div className={styles.arrow_container}>
                    <TokensArrow />
                </div>
                {buyCurrencyRow}
            </section>
            {extraInfoData}
            {explanationText}
            <ConfirmationModalControl
                tempBypassConfirm={currentSkipConfirm}
                setTempBypassConfirm={setCurrentSkipConfirm}
                toggleFor={toggleFor}
            />
        </div>
    );

    // REGULAR CONFIRMATION MESSAGE STARTS HERE
    const confirmSendMessage = (
        <WaitingConfirmation
            content={` Submitting Limit Order to Swap ${sellTokenQty} ${
                sellTokenData.symbol
            } for ${buyTokenQty} ${
                buyTokenData.symbol
            }. Please check the ${'Metamask'} extension in your browser for notifications.`}
        />
    );

    const transactionDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );
    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newLimitOrderTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
            limit
        />
    );

    const confirmationDisplay =
        isTransactionException ||
        isGasLimitException ||
        isInsufficientFundsException
            ? transactionException
            : isTransactionDenied
            ? transactionDenied
            : transactionApproved
            ? transactionSubmitted
            : confirmSendMessage;

    return (
        <div className={styles.modal_container}>
            <section className={styles.modal_content}>
                {showConfirmation ? fullTxDetails : confirmationDisplay}
            </section>
            <footer className={styles.modal_footer}>
                {showConfirmation && (
                    <Button
                        title='Send Limit'
                        action={() => {
                            bypassConfirm.limit.setValue(currentSkipConfirm);
                            initiateLimitOrderMethod();
                            setShowConfirmation(false);
                        }}
                        flat={true}
                    />
                )}
            </footer>
        </div>
    );
}
