import {
    pinTickLower,
    pinTickUpper,
    tickToPrice,
    priceHalfAboveTick,
    priceHalfBelowTick,
} from '@crocswap-libs/sdk';
import { useContext, useState, useEffect } from 'react';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import { getReceiptTxHashes } from '../../../App/functions/getReceiptTxHashes';
import { useTradeData } from '../../../App/hooks/useTradeData';
import Button from '../../../components/Global/Button/Button';
import Modal from '../../../components/Global/Modal/Modal';
import { useModal } from '../../../components/Global/Modal/useModal';
import ConfirmLimitModal from '../../../components/Trade/Limit/ConfirmLimitModal/ConfirmLimitModal';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitRate from '../../../components/Trade/Limit/LimitRate/LimitRate';
import LimitTokenInput from '../../../components/Trade/Limit/LimitTokenInput/LimitTokenInput';
import BypassConfirmButton from '../../../components/Trade/TradeModules/BypassConfirmButton/BypassConfirmButton';
import TradeModuleHeader from '../../../components/Trade/TradeModules/TradeModuleHeader';
import { TradeModuleSkeleton } from '../../../components/Trade/TradeModules/TradeModuleSkeleton';
import { IS_LOCAL_ENV } from '../../../constants';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import {
    useAppSelector,
    useAppDispatch,
} from '../../../utils/hooks/reduxToolkit';
import {
    addPendingTx,
    addTransactionByType,
    removePendingTx,
    addReceipt,
} from '../../../utils/state/receiptDataSlice';
import {
    setLimitTick,
    setLimitTickCopied,
} from '../../../utils/state/tradeDataSlice';
import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
} from '../../../utils/TransactionError';
import { limitTutorialSteps } from '../../../utils/tutorial/Limit';

export default function Limit() {
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const {
        crocEnv,
        chainData: { chainId, gridSize },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei, lastBlockNumber } = useContext(ChainDataContext);
    const { pool, isPoolInitialized } = useContext(PoolContext);
    const { tokens } = useContext(TokenContext);
    const {
        tokenAAllowance,
        setRecheckTokenAApproval,
        baseToken: {
            balance: baseTokenBalance,
            dexBalance: baseTokenDexBalance,
        },
        quoteToken: {
            balance: quoteTokenBalance,
            dexBalance: quoteTokenDexBalance,
        },
    } = useContext(TradeTokenContext);
    const { mintSlippage, dexBalLimit, bypassConfirmLimit } = useContext(
        UserPreferenceContext,
    );

    const dispatch = useAppDispatch();
    const [isModalOpen, openModal, closeModal] = useModal();
    const {
        baseToken,
        quoteToken,
        tokenA,
        tokenB,
        isTokenAPrimary,
        limitTick,
        poolPriceNonDisplay,
        liquidityFee,
        isDenomBase,
        limitTickCopied,
        primaryQuantity,
    } = useAppSelector((state) => state.tradeData);
    const { sessionReceipts, pendingTransactions } = useAppSelector(
        (state) => state.receiptData,
    );
    const { limitTickFromParams } = useTradeData();

    const [limitAllowed, setLimitAllowed] = useState<boolean>(false);
    const [tokenAInputQty, setTokenAInputQty] = useState<string>(
        isTokenAPrimary ? primaryQuantity : '',
    );
    const [tokenBInputQty, setTokenBInputQty] = useState<string>(
        !isTokenAPrimary ? primaryQuantity : '',
    );
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] =
        useState(false);
    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(
        dexBalLimit.outputToDexBal.isEnabled,
    );
    const [limitButtonErrorMessage, setLimitButtonErrorMessage] =
        useState<string>('');
    const [priceInputFieldBlurred, setPriceInputFieldBlurred] = useState(false);
    const [newLimitOrderTransactionHash, setNewLimitOrderTransactionHash] =
        useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [showConfirmation, setShowConfirmation] = useState<boolean>(true);
    const [endDisplayPrice, setEndDisplayPrice] = useState<number>(0);
    const [startDisplayPrice, setStartDisplayPrice] = useState<number>(0);
    const [middleDisplayPrice, setMiddleDisplayPrice] = useState<number>(0);
    const [orderGasPriceInDollars, setOrderGasPriceInDollars] = useState<
        string | undefined
    >();
    const [displayPrice, setDisplayPrice] = useState('');
    const [previousDisplayPrice, setPreviousDisplayPrice] = useState('');
    const [isOrderValid, setIsOrderValid] = useState<boolean>(true);
    const [showBypassConfirmButton, setShowBypassConfirmButton] =
        useState(false);
    const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);
    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const isSellTokenBase = pool?.baseToken.tokenAddr === tokenA.address;

    let receiveReceiptHashes: Array<string> = [];
    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receiveReceiptHashes.includes(hash),
    );

    const tokenABalance = isSellTokenBase
        ? baseTokenBalance
        : quoteTokenBalance;
    const tokenADexBalance = isSellTokenBase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;
    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - parseFloat(tokenAInputQty || '0');
    const tokenAQtyCoveredByWalletBalance = isWithdrawFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum < 0
            ? tokenASurplusMinusTokenARemainderNum * -1
            : 0
        : parseFloat(tokenAInputQty || '0');
    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= tokenAQtyCoveredByWalletBalance;

    // TODO: @Emily refactor this to take a token data object
    // values if either token needs to be confirmed before transacting
    const needConfirmTokenA = !tokens.verifyToken(tokenA.address);
    const needConfirmTokenB = !tokens.verifyToken(tokenB.address);
    // value showing if no acknowledgement is necessary
    const areBothAckd: boolean = !needConfirmTokenA && !needConfirmTokenB;

    const liquidityProviderFeeString = (liquidityFee * 100).toLocaleString(
        'en-US',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    // trigger re-pinning to a default tick
    useEffect(() => {
        dispatch(setLimitTick(undefined));
    }, [tokenA.address]);

    useEffect(() => {
        if (limitTickFromParams && limitTick === undefined) {
            dispatch(setLimitTick(limitTickFromParams));
        }
    }, [limitTickFromParams, limitTick === undefined]);

    useEffect(() => {
        (async () => {
            if (
                limitTick === undefined &&
                !!poolPriceNonDisplay &&
                crocEnv &&
                !limitTickCopied
            ) {
                if (!pool) return;

                const spotPrice = await cachedQuerySpotPrice(
                    crocEnv,
                    pool.baseToken.tokenAddr,
                    pool.quoteToken.tokenAddr,
                    chainId,
                    lastBlockNumber,
                );

                const initialLimitRateNonDisplay =
                    spotPrice * (isSellTokenBase ? 0.985 : 1.015);

                const pinnedTick: number = isSellTokenBase
                    ? pinTickLower(initialLimitRateNonDisplay, gridSize)
                    : pinTickUpper(initialLimitRateNonDisplay, gridSize);

                IS_LOCAL_ENV && console.debug({ pinnedTick });
                dispatch(setLimitTick(pinnedTick));

                const tickPrice = tickToPrice(pinnedTick);
                const tickDispPrice = pool.toDisplayPrice(tickPrice);

                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;
                    setEndDisplayPrice(displayPriceWithDenom);

                    const limitRateTruncated = getFormattedNumber({
                        value: displayPriceWithDenom,
                        isInput: true,
                        removeCommas: true,
                    });

                    setDisplayPrice(limitRateTruncated);
                    setPreviousDisplayPrice(limitRateTruncated);
                });

                const priceHalfAbove = pool.toDisplayPrice(
                    priceHalfAboveTick(pinnedTick, gridSize),
                );
                const priceHalfBelow = pool.toDisplayPrice(
                    priceHalfBelowTick(pinnedTick, gridSize),
                );
                const priceFullTickAbove = pool.toDisplayPrice(
                    tickToPrice(pinnedTick + gridSize),
                );
                const priceFullTickBelow = pool.toDisplayPrice(
                    tickToPrice(pinnedTick - gridSize),
                );

                if (isDenomBase) {
                    if (isSellTokenBase) {
                        priceHalfAbove.then((priceHalfAbove) => {
                            setMiddleDisplayPrice(priceHalfAbove);
                        });
                        priceFullTickAbove.then((priceFullTickAbove) => {
                            setStartDisplayPrice(priceFullTickAbove);
                        });
                    } else {
                        priceHalfBelow.then((priceHalfBelow) => {
                            setMiddleDisplayPrice(priceHalfBelow);
                        });
                        priceFullTickBelow.then((priceFullTickBelow) => {
                            setStartDisplayPrice(priceFullTickBelow);
                        });
                    }
                } else {
                    if (isSellTokenBase) {
                        priceHalfAbove.then((priceHalfAbove) => {
                            setMiddleDisplayPrice(1 / priceHalfAbove);
                        });
                        priceFullTickAbove.then((priceFullTickAbove) => {
                            setStartDisplayPrice(1 / priceFullTickAbove);
                        });
                    } else {
                        priceHalfBelow.then((priceHalfBelow) => {
                            setMiddleDisplayPrice(1 / priceHalfBelow);
                        });
                        priceFullTickBelow.then((priceFullTickBelow) => {
                            setStartDisplayPrice(1 / priceFullTickBelow);
                        });
                    }
                }
            } else if (limitTick) {
                if (!pool) return;

                const tickPrice = tickToPrice(limitTick);

                const tickDispPrice = pool.toDisplayPrice(tickPrice);

                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;

                    setEndDisplayPrice(displayPriceWithDenom);
                    const limitRateTruncated = getFormattedNumber({
                        value: displayPriceWithDenom,
                        isInput: true,
                        removeCommas: true,
                    });
                    setDisplayPrice(limitRateTruncated);
                    setPreviousDisplayPrice(limitRateTruncated);
                });

                const priceHalfAbove = pool.toDisplayPrice(
                    priceHalfAboveTick(limitTick, gridSize),
                );
                const priceHalfBelow = pool.toDisplayPrice(
                    priceHalfBelowTick(limitTick, gridSize),
                );
                const priceFullTickAbove = pool.toDisplayPrice(
                    tickToPrice(limitTick + gridSize),
                );
                const priceFullTickBelow = pool.toDisplayPrice(
                    tickToPrice(limitTick - gridSize),
                );

                if (isDenomBase) {
                    priceHalfAbove.then((priceHalfAbove) => {
                        if (isSellTokenBase)
                            setMiddleDisplayPrice(priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        if (isSellTokenBase)
                            setStartDisplayPrice(priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        if (!isSellTokenBase)
                            setMiddleDisplayPrice(priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        if (!isSellTokenBase)
                            setStartDisplayPrice(priceFullTickBelow);
                    });
                } else {
                    priceHalfAbove.then((priceHalfAbove) => {
                        if (isSellTokenBase)
                            setMiddleDisplayPrice(1 / priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        if (isSellTokenBase)
                            setStartDisplayPrice(1 / priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        if (!isSellTokenBase)
                            setMiddleDisplayPrice(1 / priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        if (!isSellTokenBase)
                            setStartDisplayPrice(1 / priceFullTickBelow);
                    });
                }

                setPriceInputFieldBlurred(false);
                if (limitTickCopied) dispatch(setLimitTickCopied(false));
            }
        })();
    }, [
        !!crocEnv,
        pool,
        limitTickCopied,
        limitTick,
        isDenomBase,
        priceInputFieldBlurred,
        isSellTokenBase,
        !!poolPriceNonDisplay,
    ]);

    useEffect(() => {
        updateOrderValidityStatus();
    }, [
        limitTick,
        poolPriceNonDisplay,
        tokenAInputQty === '' && tokenBInputQty === '',
    ]);

    useEffect(() => {
        receiveReceiptHashes = getReceiptTxHashes(sessionReceipts);
    }, [sessionReceipts]);

    useEffect(() => {
        if (
            !currentPendingTransactionsArray.length &&
            !isWaitingForWallet &&
            txErrorCode === ''
        ) {
            setShowBypassConfirmButton(false);
        }
    }, [
        currentPendingTransactionsArray.length,
        isWaitingForWallet,
        txErrorCode === '',
    ]);

    useEffect(() => {
        setNewLimitOrderTransactionHash('');
        setShowBypassConfirmButton(false);
    }, [baseToken.address + quoteToken.address]);

    useEffect(() => {
        handleLimitButtonMessage(parseFloat(tokenAInputQty));
    }, [isOrderValid, tokenAInputQty, isPoolInitialized, poolPriceNonDisplay]);

    useEffect(() => {
        setIsWithdrawFromDexChecked(parseFloat(tokenADexBalance) > 0);
    }, [tokenADexBalance]);

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const averageLimitCostInGasDrops = 193000;
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageLimitCostInGasDrops *
                1e-9 *
                ethMainnetUsdPrice;

            setOrderGasPriceInDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');
    };

    const updateLimitErrorMessage = () =>
        setLimitButtonErrorMessage(
            `Limit ${
                (isSellTokenBase && !isDenomBase) ||
                (!isSellTokenBase && isDenomBase)
                    ? 'Above Maximum'
                    : 'Below Minimum'
            }  Price`,
        );

    const updateOrderValidityStatus = async () => {
        try {
            if (!crocEnv) return;
            if (!limitTick) return;

            console.log({
                tokenAInputQty,
                tokenBInputQty,
                isTokenAPrimary,
                tokenA,
                tokenB,
                limitTick,
            });

            if (tokenAInputQty === '' && tokenBInputQty === '') return;

            const testOrder = isTokenAPrimary
                ? crocEnv.sell(tokenA.address, 0)
                : crocEnv.buy(tokenB.address, 0);

            const ko = testOrder.atLimit(
                isTokenAPrimary ? tokenB.address : tokenA.address,
                limitTick,
            );

            if (await ko.willMintFail()) {
                console.log('will fail');
                updateLimitErrorMessage();
                setIsOrderValid(false);
                return;
            } else {
                console.log('will not fail');
                setIsOrderValid(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLimitButtonClickWithBypass = () => {
        setShowBypassConfirmButton(true);
        sendLimitOrder();
    };

    const sendLimitOrder = async () => {
        if (!crocEnv) return;
        if (limitTick === undefined) return;
        resetConfirmation();
        setIsWaitingForWallet(true);

        const sellToken = tokenA.address;
        const buyToken = tokenB.address;
        const sellQty = tokenAInputQty;
        const buyQty = tokenBInputQty;

        const qty = isTokenAPrimary ? sellQty : buyQty;

        const order = isTokenAPrimary
            ? crocEnv.sell(sellToken, qty)
            : crocEnv.buy(buyToken, qty);
        const ko = order.atLimit(
            isTokenAPrimary ? buyToken : sellToken,
            limitTick,
        );
        if (await ko.willMintFail()) {
            return;
        }

        let tx;
        try {
            tx = await ko.mint({ surplus: isWithdrawFromDexChecked });
            dispatch(addPendingTx(tx?.hash));
            setNewLimitOrderTransactionHash(tx.hash);
            setIsWaitingForWallet(false);
            if (tx?.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: `Add Limit ${tokenA.symbol}→${tokenB.symbol}`,
                    }),
                );
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error.code);
            setIsWaitingForWallet(false);
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
        }

        let receipt;
        try {
            if (tx) receipt = await tx.wait();
        } catch (e) {
            const error = e as TransactionError;
            console.error({ error });
            // The user used 'speed up' or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                IS_LOCAL_ENV && console.debug('repriced');
                dispatch(removePendingTx(error.hash));
                const newTransactionHash = error.replacement.hash;
                dispatch(addPendingTx(newTransactionHash));
                setNewLimitOrderTransactionHash(newTransactionHash);
                IS_LOCAL_ENV && console.debug({ newTransactionHash });
                receipt = error.receipt;
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }

        if (receipt) {
            dispatch(addReceipt(JSON.stringify(receipt)));
            dispatch(removePendingTx(receipt.transactionHash));
        }
    };

    const handleLimitButtonMessage = (tokenAAmount: number) => {
        if (!isPoolInitialized) {
            setLimitAllowed(false);
            if (isPoolInitialized === undefined)
                setLimitButtonErrorMessage('...');
            if (isPoolInitialized === false)
                setLimitButtonErrorMessage('Pool Not Initialized');
        } else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Enter an Amount');
        } else if (!isOrderValid) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage(
                `Limit ${
                    (isSellTokenBase && !isDenomBase) ||
                    (!isSellTokenBase && isDenomBase)
                        ? 'Above Maximum'
                        : 'Below Minimum'
                }  Price`,
            );
        } else {
            if (isWithdrawFromDexChecked) {
                if (
                    tokenAAmount >
                    parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                ) {
                    setLimitAllowed(false);
                    setLimitButtonErrorMessage(
                        `${tokenA.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else {
                    setLimitAllowed(true);
                }
            } else {
                if (tokenAAmount > parseFloat(tokenABalance)) {
                    setLimitAllowed(false);
                    setLimitButtonErrorMessage(
                        `${tokenA.symbol} Amount Exceeds Wallet Balance`,
                    );
                } else {
                    setLimitAllowed(true);
                }
            }
        }
    };

    const handleModalClose = (): void => {
        closeModal();
        setNewLimitOrderTransactionHash('');
        resetConfirmation();
    };

    const approve = async (tokenAddress: string, tokenSymbol: string) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv.token(tokenAddress).approve();
            if (tx) dispatch(addPendingTx(tx?.hash));
            if (tx?.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: `Approval of ${tokenSymbol}`,
                    }),
                );
            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.error({ error });
                // The user used 'speed up' or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    IS_LOCAL_ENV && console.debug('repriced');
                    dispatch(removePendingTx(error.hash));

                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));

                    IS_LOCAL_ENV && console.debug({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }
            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
            }
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
        } finally {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
        }
    };

    const toggleDexSelection = (tokenAorB: 'A' | 'B') => {
        if (tokenAorB === 'A') {
            setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked);
        } else {
            if (isSaveAsDexSurplusChecked) dexBalLimit.outputToDexBal.disable();
            else dexBalLimit.outputToDexBal.enable();
            setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked);
        }
    };

    // logic to acknowledge one or both tokens as necessary
    const ackAsNeeded = (): void => {
        needConfirmTokenA && tokens.ackToken(tokenA);
        needConfirmTokenB && tokens.ackToken(tokenB);
    };

    return (
        <TradeModuleSkeleton
            header={
                <TradeModuleHeader
                    slippage={mintSlippage}
                    bypassConfirm={bypassConfirmLimit}
                    settingsTitle='Limit Order'
                />
            }
            input={
                <LimitTokenInput
                    tokenAInputQty={{
                        value: tokenAInputQty,
                        set: setTokenAInputQty,
                    }}
                    tokenBInputQty={{
                        value: tokenBInputQty,
                        set: setTokenBInputQty,
                    }}
                    isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                    isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                    limitTickDisplayPrice={middleDisplayPrice}
                    handleLimitButtonMessage={handleLimitButtonMessage}
                    toggleDexSelection={toggleDexSelection}
                />
            }
            inputOptions={
                <LimitRate
                    previousDisplayPrice={previousDisplayPrice}
                    displayPrice={displayPrice}
                    setDisplayPrice={setDisplayPrice}
                    setPreviousDisplayPrice={setPreviousDisplayPrice}
                    isSellTokenBase={isSellTokenBase}
                    setPriceInputFieldBlurred={setPriceInputFieldBlurred}
                    fieldId='limit-rate'
                />
            }
            transactionDetails={
                <LimitExtraInfo
                    showExtraInfoDropdown={
                        tokenAInputQty !== '' || tokenBInputQty !== ''
                    }
                    orderGasPriceInDollars={orderGasPriceInDollars}
                    liquidityProviderFeeString={liquidityProviderFeeString}
                    isTokenABase={isSellTokenBase}
                    startDisplayPrice={startDisplayPrice}
                    middleDisplayPrice={middleDisplayPrice}
                    endDisplayPrice={endDisplayPrice}
                />
            }
            modal={
                isModalOpen ? (
                    <Modal
                        onClose={handleModalClose}
                        title='Limit Confirmation'
                        centeredTitle
                    >
                        <ConfirmLimitModal
                            initiateLimitOrderMethod={sendLimitOrder}
                            tokenAInputQty={tokenAInputQty}
                            tokenBInputQty={tokenBInputQty}
                            insideTickDisplayPrice={endDisplayPrice}
                            newLimitOrderTransactionHash={
                                newLimitOrderTransactionHash
                            }
                            txErrorCode={txErrorCode}
                            showConfirmation={showConfirmation}
                            setShowConfirmation={setShowConfirmation}
                            resetConfirmation={resetConfirmation}
                            startDisplayPrice={startDisplayPrice}
                            middleDisplayPrice={middleDisplayPrice}
                            endDisplayPrice={endDisplayPrice}
                        />
                    </Modal>
                ) : undefined
            }
            button={
                <Button
                    title={
                        areBothAckd
                            ? limitAllowed
                                ? bypassConfirmLimit.isEnabled
                                    ? 'Submit Limit Order'
                                    : 'Confirm'
                                : limitButtonErrorMessage
                            : 'Acknowledge'
                    }
                    action={
                        areBothAckd
                            ? bypassConfirmLimit.isEnabled
                                ? handleLimitButtonClickWithBypass
                                : openModal
                            : ackAsNeeded
                    }
                    disabled={
                        (!limitAllowed ||
                            !isOrderValid ||
                            poolPriceNonDisplay === 0) &&
                        areBothAckd
                    }
                    flat
                />
            }
            bypassConfirm={
                showBypassConfirmButton ? (
                    <BypassConfirmButton
                        newTransactionHash={newLimitOrderTransactionHash}
                        txErrorCode={txErrorCode}
                        resetConfirmation={resetConfirmation}
                        setShowBypassConfirmButton={setShowBypassConfirmButton}
                        sendTransaction={sendLimitOrder}
                        setNewTransactionHash={setNewLimitOrderTransactionHash}
                        transactionPendingDisplayString={`Submitting Limit Order to Swap ${tokenAInputQty} ${tokenA.symbol} for ${tokenBInputQty} ${tokenB.symbol}`}
                    />
                ) : undefined
            }
            approveButton={
                !isTokenAAllowanceSufficient &&
                parseFloat(tokenAInputQty) > 0 ? (
                    <Button
                        title={
                            !isApprovalPending
                                ? `Approve ${tokenA.symbol}`
                                : `${tokenA.symbol} Approval Pending`
                        }
                        disabled={isApprovalPending}
                        action={async () => {
                            await approve(tokenA.address, tokenA.symbol);
                        }}
                        flat={true}
                    />
                ) : undefined
            }
            tutorialSteps={limitTutorialSteps}
        />
    );
}
