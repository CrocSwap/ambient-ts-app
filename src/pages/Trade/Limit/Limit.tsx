// START: Import React and Dongles
import { useState, useEffect, useMemo, useContext } from 'react';
import { motion } from 'framer-motion';
import FocusTrap from 'focus-trap-react';

import {
    tickToPrice,
    pinTickLower,
    pinTickUpper,
    priceHalfAboveTick,
    priceHalfBelowTick,
} from '@crocswap-libs/sdk';

// START: Import React Functional Components
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitButton from '../../../components/Trade/Limit/LimitButton/LimitButton';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitHeader from '../../../components/Trade/Limit/LimitHeader/LimitHeader';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Global/Button/Button';
import ConfirmLimitModal from '../../../components/Trade/Limit/ConfirmLimitModal/ConfirmLimitModal';

// START: Import Local Files
import styles from './Limit.module.css';
import { useTradeData } from '../Trade';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { useModal } from '../../../components/Global/Modal/useModal';
import {
    setLimitTick,
    setLimitTickCopied,
    setShouldLimitDirectionReverse,
} from '../../../utils/state/tradeDataSlice';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
} from '../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';
import { FiExternalLink } from 'react-icons/fi';
import BypassLimitButton from '../../../components/Trade/Limit/LimitButton/BypassLimitButton';
import TutorialOverlay from '../../../components/Global/TutorialOverlay/TutorialOverlay';
import { limitTutorialSteps } from '../../../utils/tutorial/Limit';
import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../../constants';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { memoizeQuerySpotPrice } from '../../../App/functions/querySpotPrice';

export default function Limit() {
    const {
        tutorial: { isActive: isTutorialActive },
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);
    const {
        crocEnv,
        chainData: { chainId, poolIndex, gridSize, blockExplorer },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei, lastBlockNumber } = useContext(ChainDataContext);
    const { pool } = useContext(PoolContext);
    const { tokens } = useContext(TokenContext);
    const { tokenAAllowance, setRecheckTokenAApproval } =
        useContext(TradeTokenContext);
    const { dexBalLimit, bypassConfirmLimit } = useContext(
        UserPreferenceContext,
    );

    const { tradeData, navigationMenu, limitTickFromParams } = useTradeData();
    const { tokenA, tokenB } = tradeData;
    const { addressCurrent: userAddress, isLoggedIn: isUserConnected } =
        useAppSelector((state) => state.userData);

    const cachedQuerySpotPrice = memoizeQuerySpotPrice();

    const dispatch = useAppDispatch();

    const [isModalOpen, openModal, closeModal] = useModal();
    const [limitAllowed, setLimitAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

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
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const [showConfirmation, setShowConfirmation] = useState<boolean>(true);

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');

        setTxErrorMessage('');
    };

    const isTokenAPrimary = tradeData.isTokenAPrimary;
    const limitTick = tradeData.limitTick;
    const poolPriceNonDisplay = tradeData.poolPriceNonDisplay;

    const [endDisplayPrice, setEndDisplayPrice] = useState<number>(0);
    const [startDisplayPrice, setStartDisplayPrice] = useState<number>(0);
    const [middleDisplayPrice, setMiddleDisplayPrice] = useState<number>(0);
    const [orderGasPriceInDollars, setOrderGasPriceInDollars] = useState<
        string | undefined
    >();

    const [displayPrice, setDisplayPrice] = useState('');
    const [previousDisplayPrice, setPreviousDisplayPrice] = useState('');

    const isDenomBase = tradeData.isDenomBase;
    const limitTickCopied = tradeData.limitTickCopied;
    useEffect(() => {
        if (limitTickFromParams && limitTick === undefined) {
            dispatch(setLimitTick(limitTickFromParams));
        }
    }, [limitTickFromParams, limitTick === undefined]);

    const { baseToken, quoteToken } = tradeData;

    const isSellTokenBase = useMemo(
        () => pool?.baseToken.tokenAddr === tokenA.address,
        [pool?.baseToken, tokenA.address],
    );

    useEffect(() => {
        if (!tradeData.shouldLimitDirectionReverse) {
            dispatch(setLimitTick(undefined));
        }

        dispatch(setShouldLimitDirectionReverse(false));
    }, [tokenA.address, tokenB.address]);

    useEffect(() => {
        (async () => {
            if (limitTick === undefined && crocEnv && !limitTickCopied) {
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

                    const limitRateTruncated =
                        displayPriceWithDenom < 0.0001
                            ? displayPriceWithDenom.toExponential(2)
                            : displayPriceWithDenom < 2
                            ? displayPriceWithDenom.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                              })
                            : displayPriceWithDenom.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
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
            } else if (limitTick) {
                if (!pool) return;
                if (poolPriceNonDisplay === 0) return;

                const tickPrice = tickToPrice(limitTick);

                const tickDispPrice = pool.toDisplayPrice(tickPrice);

                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;

                    setEndDisplayPrice(displayPriceWithDenom);
                    const limitRateTruncated =
                        displayPriceWithDenom < 0.0001
                            ? displayPriceWithDenom.toExponential(2)
                            : displayPriceWithDenom < 2
                            ? displayPriceWithDenom.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                              })
                            : displayPriceWithDenom.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
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
        pool,
        limitTickCopied,
        limitTick,
        poolPriceNonDisplay === 0,
        isDenomBase,
        priceInputFieldBlurred,
    ]);

    const [isOrderValid, setIsOrderValid] = useState<boolean>(true);

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
            if (!crocEnv) {
                return;
            }
            if (!limitTick) return;

            const testOrder = isTokenAPrimary
                ? crocEnv.sell(tokenA.address, 0)
                : crocEnv.buy(tokenB.address, 0);

            const ko = testOrder.atLimit(
                isTokenAPrimary ? tokenB.address : tokenA.address,
                limitTick,
            );

            if (await ko.willMintFail()) {
                updateLimitErrorMessage();
                setIsOrderValid(false);
                return;
            } else {
                setIsOrderValid(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        updateOrderValidityStatus();
    }, [
        isTokenAPrimary,
        limitTick,
        poolPriceNonDisplay,
        tokenA.address + tokenB.address,
        tokenAInputQty === '' && tokenBInputQty === '',
    ]);

    const [showBypassConfirmButton, setShowBypassConfirmButton] =
        useState(false);
    const receiptData = useAppSelector((state) => state.receiptData);

    const sessionReceipts = receiptData.sessionReceipts;

    const pendingTransactions = receiptData.pendingTransactions;

    const receiveReceiptHashes: Array<string> = [];
    // eslint-disable-next-line
    function handleParseReceipt(receipt: any) {
        const parseReceipt = JSON.parse(receipt);
        receiveReceiptHashes.push(parseReceipt?.transactionHash);
    }

    sessionReceipts.map((receipt) => handleParseReceipt(receipt));

    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receiveReceiptHashes.includes(hash),
    );

    const handleLimitButtonClickWithBypass = () => {
        setShowBypassConfirmButton(true);
        sendLimitOrder();
    };

    const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);

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

    const sendLimitOrder = async () => {
        IS_LOCAL_ENV && console.debug('Send limit');
        if (!crocEnv) {
            location.reload();
            return;
        }
        if (limitTick === undefined) return;
        resetConfirmation();
        setIsWaitingForWallet(true);

        IS_LOCAL_ENV && console.debug({ limitTick });

        const sellToken = tradeData.tokenA.address;
        const buyToken = tradeData.tokenB.address;
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
            IS_LOCAL_ENV &&
                console.debug(
                    'Cannot send limit order: Knockout price inside spread',
                );
            setTxErrorMessage('Limit inside market price');
            return;
        }

        let tx;
        try {
            tx = await ko.mint({ surplus: isWithdrawFromDexChecked });
            IS_LOCAL_ENV && console.debug(tx.hash);
            dispatch(addPendingTx(tx?.hash));
            setNewLimitOrderTransactionHash(tx.hash);
            setIsWaitingForWallet(false);
            if (tx?.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: `Add Limit ${tradeData.tokenA.symbol}→${tradeData.tokenB.symbol}`,
                    }),
                );
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error.code);
            setTxErrorMessage(error.message);
            setIsWaitingForWallet(false);
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
        }

        const newLimitOrderChangeCacheEndpoint =
            GRAPHCACHE_URL + '/new_limit_order_change?';

        if (tx?.hash) {
            fetch(
                newLimitOrderChangeCacheEndpoint +
                    new URLSearchParams({
                        chainId: chainId,
                        tx: tx.hash,
                        user: userAddress ?? '',
                        base: tradeData.baseToken.address,
                        quote: tradeData.quoteToken.address,
                        poolIdx: poolIndex.toString(),
                        positionType: 'knockout',
                        changeType: 'mint',
                        limitTick: limitTick.toString(),
                        isBid: isSellTokenBase.toString(), // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                        liq: '0', // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                    }),
            );
        }

        let receipt;
        try {
            if (tx) receipt = await tx.wait();
        } catch (e) {
            const error = e as TransactionError;
            console.error({ error });
            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                IS_LOCAL_ENV && console.debug('repriced');
                dispatch(removePendingTx(error.hash));
                const newTransactionHash = error.replacement.hash;
                dispatch(addPendingTx(newTransactionHash));
                setNewLimitOrderTransactionHash(newTransactionHash);
                IS_LOCAL_ENV && console.debug({ newTransactionHash });
                receipt = error.receipt;

                if (newTransactionHash) {
                    fetch(
                        newLimitOrderChangeCacheEndpoint +
                            new URLSearchParams({
                                chainId: chainId,
                                tx: newTransactionHash,
                                user: userAddress ?? '',
                                base: tradeData.baseToken.address,
                                quote: tradeData.quoteToken.address,
                                poolIdx: poolIndex.toString(),
                                positionType: 'knockout',
                                changeType: 'mint',
                                limitTick: limitTick.toString(),
                                isBid: isSellTokenBase.toString(), // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                                liq: '0', // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                            }),
                    );
                }
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }

        if (receipt) {
            dispatch(addReceipt(JSON.stringify(receipt)));
            dispatch(removePendingTx(receipt.transactionHash));
        }
    };

    const handleModalClose = (): void => {
        closeModal();
        setNewLimitOrderTransactionHash('');
        resetConfirmation();
    };

    const bypassLimitProps = {
        newLimitOrderTransactionHash: newLimitOrderTransactionHash,
        txErrorCode: txErrorCode,
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
        resetConfirmation: resetConfirmation,
        showBypassConfirmButton: showBypassConfirmButton,
        setShowBypassConfirmButton: setShowBypassConfirmButton,
        sendLimitOrder: sendLimitOrder,
        setNewLimitOrderTransactionHash: setNewLimitOrderTransactionHash,
    };

    const [
        tokenAQtyCoveredByWalletBalance,
        setTokenAQtyCoveredByWalletBalance,
    ] = useState<number>(0);

    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= tokenAQtyCoveredByWalletBalance;

    const loginButton = (
        <button onClick={openWagmiModal} className={styles.authenticate_button}>
            Connect Wallet
        </button>
    );

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const approve = async (tokenAddress: string, tokenSymbol: string) => {
        if (!crocEnv) {
            location.reload();
            return;
        }
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
                // The user used "speed up" or something similar
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

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei * 82459 * 1e-9 * ethMainnetUsdPrice;

            setOrderGasPriceInDollars(
                '$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const approvalButton = (
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
    );

    const currencyConverterProps = {
        displayPrice: displayPrice,
        previousDisplayPrice: previousDisplayPrice,
        setDisplayPrice: setDisplayPrice,
        setPreviousDisplayPrice: setPreviousDisplayPrice,
        setPriceInputFieldBlurred: setPriceInputFieldBlurred,
        isSellTokenBase: isSellTokenBase,
        setLimitAllowed: setLimitAllowed,
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
        setTokenAInputQty: setTokenAInputQty,
        isSaveAsDexSurplusChecked: isSaveAsDexSurplusChecked,
        setTokenBInputQty: setTokenBInputQty,
        setIsSaveAsDexSurplusChecked: setIsSaveAsDexSurplusChecked,
        setLimitButtonErrorMessage: setLimitButtonErrorMessage,
        isWithdrawFromDexChecked: isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked: setIsWithdrawFromDexChecked,
        limitTickDisplayPrice: middleDisplayPrice,
        isOrderValid: isOrderValid,
        setTokenAQtyCoveredByWalletBalance: setTokenAQtyCoveredByWalletBalance,
    };
    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    // TODO: @Emily refactor this to take a token data object
    // values if either token needs to be confirmed before transacting
    const needConfirmTokenA = !tokens.verifyToken(tokenA.address);
    const needConfirmTokenB = !tokens.verifyToken(tokenB.address);

    // token acknowledgement needed message (empty string if none needed)
    const ackTokenMessage = useMemo<string>(() => {
        // !Important   any changes to verbiage in this code block must be approved
        // !Important   ... by Doug, get in writing by email or request specific
        // !Important   ... review for a pull request on GitHub
        let text: string;
        if (needConfirmTokenA && needConfirmTokenB) {
            text = `The tokens ${tokenA.symbol || tokenA.name} and ${
                tokenB.symbol || tokenB.name
            } are not listed on any major reputable token list. Please be sure these are the actual tokens you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenA) {
            text = `The token ${
                tokenA.symbol || tokenA.name
            } is not listed on any major reputable token list. Please be sure this is the actual token you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenB) {
            text = `The token ${
                tokenB.symbol || tokenB.name
            } is not listed on any major reputable token list. Please be sure this is the actual token you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else {
            text = '';
        }
        return text;
    }, [needConfirmTokenA, needConfirmTokenB]);
    const formattedAckTokenMessage = ackTokenMessage.replace(
        /\b(not)\b/g,
        '<span style="color: var(--negative); text-transform: uppercase;">$1</span>',
    );

    // value showing if no acknowledgement is necessary
    const areBothAckd: boolean = !needConfirmTokenA && !needConfirmTokenB;

    // logic to acknowledge one or both tokens as necessary
    const ackAsNeeded = (): void => {
        needConfirmTokenA && tokens.ackToken(tokenA);
        needConfirmTokenB && tokens.ackToken(tokenB);
    };

    const liquidityProviderFeeString = (
        tradeData.liquidityFee * 100
    ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <FocusTrap
            focusTrapOptions={{
                clickOutsideDeactivates: true,
            }}
        >
            <section className={styles.scrollable_container}>
                {isTutorialActive && (
                    <div className={styles.tutorial_button_container}>
                        <button
                            className={styles.tutorial_button}
                            onClick={() => setIsTutorialEnabled(true)}
                        >
                            Tutorial Mode
                        </button>
                    </div>
                )}{' '}
                <ContentContainer isOnTradeRoute>
                    <LimitHeader />
                    {navigationMenu}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <LimitCurrencyConverter {...currencyConverterProps} />
                    </motion.div>
                    <div className={styles.header_container}></div>
                    <LimitExtraInfo
                        isQtyEntered={
                            tokenAInputQty !== '' || tokenBInputQty !== ''
                        }
                        orderGasPriceInDollars={orderGasPriceInDollars}
                        liquidityProviderFeeString={liquidityProviderFeeString}
                        isTokenABase={isSellTokenBase}
                        startDisplayPrice={startDisplayPrice}
                        middleDisplayPrice={middleDisplayPrice}
                        endDisplayPrice={endDisplayPrice}
                    />
                    {isUserConnected === undefined ? null : isUserConnected ===
                      true ? (
                        !isTokenAAllowanceSufficient &&
                        parseFloat(tokenAInputQty) > 0 ? (
                            approvalButton
                        ) : showBypassConfirmButton ? (
                            <BypassLimitButton {...bypassLimitProps} />
                        ) : (
                            <>
                                <LimitButton
                                    onClickFn={
                                        areBothAckd
                                            ? bypassConfirmLimit.isEnabled
                                                ? handleLimitButtonClickWithBypass
                                                : openModal
                                            : ackAsNeeded
                                    }
                                    limitAllowed={
                                        isOrderValid &&
                                        poolPriceNonDisplay !== 0 &&
                                        limitAllowed
                                    }
                                    limitButtonErrorMessage={
                                        limitButtonErrorMessage
                                    }
                                    isBypassConfirmEnabled={
                                        bypassConfirmLimit.isEnabled
                                    }
                                    areBothAckd={areBothAckd}
                                />
                                {ackTokenMessage && (
                                    <p
                                        className={styles.acknowledge_text}
                                        dangerouslySetInnerHTML={{
                                            __html: formattedAckTokenMessage,
                                        }}
                                    ></p>
                                )}
                                <div
                                    className={
                                        styles.acknowledge_etherscan_links
                                    }
                                >
                                    {needConfirmTokenA && (
                                        <a
                                            href={
                                                blockExplorer +
                                                'token/' +
                                                tokenA.address
                                            }
                                            rel={'noopener noreferrer'}
                                            target='_blank'
                                            aria-label={`approve ${tokenA.symbol}`}
                                        >
                                            {tokenA.symbol || tokenA.name}{' '}
                                            <FiExternalLink />
                                        </a>
                                    )}
                                    {needConfirmTokenB && (
                                        <a
                                            href={
                                                blockExplorer +
                                                'token/' +
                                                tokenB.address
                                            }
                                            rel={'noopener noreferrer'}
                                            target='_blank'
                                            aria-label={tokenB.symbol}
                                        >
                                            {tokenB.symbol || tokenB.name}{' '}
                                            <FiExternalLink />
                                        </a>
                                    )}
                                </div>
                            </>
                        )
                    ) : (
                        loginButton
                    )}
                </ContentContainer>
                {isModalOpen && (
                    <Modal
                        onClose={handleModalClose}
                        title='Limit Confirmation'
                        centeredTitle
                    >
                        <ConfirmLimitModal
                            onClose={handleModalClose}
                            initiateLimitOrderMethod={sendLimitOrder}
                            tokenAInputQty={tokenAInputQty}
                            tokenBInputQty={tokenBInputQty}
                            isTokenAPrimary={isTokenAPrimary}
                            insideTickDisplayPrice={endDisplayPrice}
                            newLimitOrderTransactionHash={
                                newLimitOrderTransactionHash
                            }
                            txErrorCode={txErrorCode}
                            txErrorMessage={txErrorMessage}
                            showConfirmation={showConfirmation}
                            setShowConfirmation={setShowConfirmation}
                            resetConfirmation={resetConfirmation}
                            startDisplayPrice={startDisplayPrice}
                            middleDisplayPrice={middleDisplayPrice}
                            endDisplayPrice={endDisplayPrice}
                        />
                    </Modal>
                )}
                <TutorialOverlay
                    isTutorialEnabled={isTutorialEnabled}
                    setIsTutorialEnabled={setIsTutorialEnabled}
                    steps={limitTutorialSteps}
                />
            </section>
        </FocusTrap>
    );
}
