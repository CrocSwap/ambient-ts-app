// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { CrocImpact, CrocPoolView } from '@crocswap-libs/sdk';

// START: Import JSX Components
import WaitingConfirmation from '../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../Global/TransactionException/TransactionException';
import Button from '../../Global/Button/Button';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import ConfirmationModalControl from '../../Global/ConfirmationModalControl/ConfirmationModalControl';

// START: Import Other Local Files
import styles from './ConfirmSwapModal.module.css';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import { allSkipConfirmMethodsIF } from '../../../App/hooks/useSkipConfirm';

interface propsIF {
    initiateSwapMethod: () => void;
    poolPriceDisplay: number | undefined;
    isDenomBase: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    priceImpact: CrocImpact | undefined;
    onClose: () => void;
    newSwapTransactionHash: string;
    tokenPair: TokenPairIF;
    txErrorCode: string;
    txErrorMessage: string;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    slippageTolerancePercentage: number;
    effectivePrice: number;
    isSellTokenBase: boolean;
    sellQtyString: string;
    buyQtyString: string;
    bypassConfirm: allSkipConfirmMethodsIF;
    lastBlockNumber: number;
    pool: CrocPoolView | undefined;
}

export default function ConfirmSwapModal(props: propsIF) {
    const {
        initiateSwapMethod,
        isDenomBase,
        baseTokenSymbol,
        quoteTokenSymbol,
        newSwapTransactionHash,
        tokenPair,
        txErrorCode,
        resetConfirmation,
        showConfirmation,
        setShowConfirmation,
        slippageTolerancePercentage,
        effectivePrice,
        isSellTokenBase,
        sellQtyString,
        buyQtyString,
        bypassConfirm,
        lastBlockNumber,
        pool,
    } = props;

    const transactionApproved = newSwapTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const sellTokenData = tokenPair.dataTokenA;

    const buyTokenData = tokenPair.dataTokenB;

    const [isDenomBaseLocal, setIsDenomBaseLocal] = useState(isDenomBase);

    const [baselineBlockNumber, setBaselineBlockNumber] =
        useState<number>(lastBlockNumber);

    const [baselineBuyTokenPrice, setBaselineBuyTokenPrice] = useState<
        number | undefined
    >();

    const [currentBuyTokenPrice, setCurrentBuyTokenPrice] = useState<
        number | undefined
    >();

    const [isWaitingForPriceChangeAckt, setIsWaitingForPriceChangeAckt] =
        useState<boolean>(false);

    const setBaselinePriceAsync = async () => {
        if (!pool) return;
        const newBaselinePrice = await pool.displayPrice(baselineBlockNumber);
        console.log({ newBaselinePrice });
        const baselineBuyTokenPrice = isSellTokenBase
            ? 1 / newBaselinePrice
            : newBaselinePrice;
        setBaselineBuyTokenPrice(baselineBuyTokenPrice);
    };

    const setCurrentPriceAsync = async () => {
        if (!pool) return;
        const currentBasePrice = await pool.displayPrice(lastBlockNumber);
        console.log({ currentBasePrice });
        const currentBuyTokenPrice = isSellTokenBase
            ? 1 / currentBasePrice
            : currentBasePrice;
        setCurrentBuyTokenPrice(currentBuyTokenPrice);
    };

    useEffect(() => {
        if (!isWaitingForPriceChangeAckt) setBaselinePriceAsync();
    }, [isWaitingForPriceChangeAckt]);

    useEffect(() => {
        setCurrentPriceAsync();
    }, [lastBlockNumber]);

    const buyTokenPriceChangePercentage = useMemo(() => {
        if (!currentBuyTokenPrice || !baselineBuyTokenPrice) return;

        const changePercentage =
            ((currentBuyTokenPrice - baselineBuyTokenPrice) /
                baselineBuyTokenPrice) *
            100;

        if (changePercentage > 0) {
            setIsWaitingForPriceChangeAckt(true);
        } else {
            setIsWaitingForPriceChangeAckt(false);
        }

        const changePercentageString = changePercentage.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            },
        );
        return changePercentageString;
    }, [currentBuyTokenPrice, baselineBuyTokenPrice]);

    // useEffect(() => {
    //     console.log({ baselineBlockNumber });
    //     console.log({ baselineBuyTokenPrice });
    //     console.log({ buyTokenPriceChangePercentage });
    // }, [
    //     baselineBuyTokenPrice,
    //     baselineBlockNumber,
    //     buyTokenPriceChangePercentage,
    // ]);

    const isPriceInverted =
        (isDenomBaseLocal && !isSellTokenBase) ||
        (!isDenomBaseLocal && isSellTokenBase);

    const effectivePriceWithDenom = effectivePrice
        ? isPriceInverted
            ? 1 / effectivePrice
            : effectivePrice
        : undefined;

    const displayEffectivePriceString =
        !effectivePriceWithDenom ||
        effectivePriceWithDenom === Infinity ||
        effectivePriceWithDenom === 0
            ? '…'
            : effectivePriceWithDenom < 2
            ? effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const buyCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{buyQtyString}</h2>

            <div className={styles.logo_display}>
                {buyTokenData.logoURI ? (
                    <img src={buyTokenData.logoURI} alt={buyTokenData.symbol} />
                ) : (
                    <NoTokenIcon
                        tokenInitial={buyTokenData.symbol.charAt(0)}
                        width='30px'
                    />
                )}

                <h2>{buyTokenData.symbol}</h2>
            </div>
        </div>
    );

    const priceIncreaseComponentOrNull =
        buyTokenPriceChangePercentage &&
        parseFloat(buyTokenPriceChangePercentage) > 0 ? (
            <div className={styles.row}>
                <p>
                    WARNING: THE PRICE OF {buyTokenData.symbol} HAS INCREASED BY{' '}
                    {buyTokenPriceChangePercentage + '%'}
                </p>
                <button
                    onClick={() => {
                        setBaselineBlockNumber(lastBlockNumber);
                        setIsWaitingForPriceChangeAckt(false);
                    }}
                >
                    Understood
                </button>
            </div>
        ) : null;

    const sellCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{sellQtyString}</h2>
            <div className={styles.logo_display}>
                {sellTokenData.logoURI ? (
                    <img
                        src={sellTokenData.logoURI}
                        alt={sellTokenData.symbol}
                    />
                ) : (
                    <NoTokenIcon
                        tokenInitial={sellTokenData.symbol.charAt(0)}
                        width='30px'
                    />
                )}

                <h2>{sellTokenData.symbol}</h2>
            </div>
        </div>
    );

    // this is the starting state for the bypass confirmation toggle switch
    // if the modal is being shown, we can assume bypass is disabled
    const [tempBypassConfirm, setTempBypassConfirm] = useState<boolean>(false);

    const fullTxDetails2 = (
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
                    <p>Expected Output</p>
                    <p>
                        {buyQtyString} {buyTokenData.symbol}
                    </p>
                </div>
                <div className={styles.row}>
                    <p>Effective Conversion Rate</p>
                    <p
                        onClick={() => {
                            setIsDenomBaseLocal(!isDenomBaseLocal);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {isDenomBaseLocal
                            ? `${displayEffectivePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                            : `${displayEffectivePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                    </p>
                </div>
                <div className={styles.row}>
                    <p>Slippage Tolerance</p>
                    <p>{slippageTolerancePercentage}%</p>
                </div>
                {priceIncreaseComponentOrNull}
            </div>
            <ConfirmationModalControl
                tempBypassConfirm={tempBypassConfirm}
                setTempBypassConfirm={setTempBypassConfirm}
            />
        </div>
    );

    // REGULAR CONFIRMATION MESSAGE STARTS HERE
    const confirmSendMessage = (
        <WaitingConfirmation
            content={`Swapping ${sellQtyString} ${sellTokenData.symbol} for ${buyQtyString} ${buyTokenData.symbol}.`}
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
            hash={newSwapTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
        />
    );

    // END OF REGULAR CONFIRMATION MESSAGE

    const confirmationDisplay = isTransactionException
        ? transactionException
        : isTransactionDenied
        ? transactionDenied
        : transactionApproved
        ? transactionSubmitted
        : confirmSendMessage;

    return (
        <div
            className={styles.modal_container}
            aria-label='Swap Confirmation modal'
        >
            <section
                className={styles.modal_content}
                aria-live='polite'
                aria-atomic='true'
                aria-relevant='additions text'
            >
                {showConfirmation ? fullTxDetails2 : confirmationDisplay}
            </section>
            <footer className={styles.modal_footer}>
                {showConfirmation && (
                    <Button
                        title='Send Swap'
                        action={() => {
                            // if this modal is launched we can infer user wants confirmation
                            // if user enables bypass, update all settings in parallel
                            // otherwise do not not make any change to persisted preferences
                            if (tempBypassConfirm) {
                                bypassConfirm.swap.enable();
                                bypassConfirm.limit.enable();
                                bypassConfirm.range.enable();
                                bypassConfirm.repo.enable();
                            }
                            initiateSwapMethod();
                            setShowConfirmation(false);
                        }}
                        flat
                        disabled={isWaitingForPriceChangeAckt}
                    />
                )}
            </footer>
        </div>
    );
}
