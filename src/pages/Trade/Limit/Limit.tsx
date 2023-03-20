// START: Import React and Dongles
import { useState, useEffect, Dispatch, SetStateAction, useMemo } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
    tickToPrice,
    CrocEnv,
    pinTickLower,
    pinTickUpper,
    priceHalfAboveTick,
    CrocPoolView,
    ChainSpec,
    priceHalfBelowTick,
} from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import React Functional Components
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitButton from '../../../components/Trade/Limit/LimitButton/LimitButton';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitHeader from '../../../components/Trade/Limit/LimitHeader/LimitHeader';
// import DividerDark from '../../../components/Global/DividerDark/DividerDark';
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
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import {
    setLimitTick,
    setLimitTickCopied,
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
import LimitShareControl from '../../../components/Trade/Limit/LimitShareControl/LimitShareControl';
import { FiCopy } from 'react-icons/fi';
import { memoizeQuerySpotPrice } from '../../../App/functions/querySpotPrice';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';

import { useUrlParams } from '../../InitPool/useUrlParams';
import BypassLimitButton from '../../../components/Trade/Limit/LimitButton/BypassLimitButton';
import TutorialOverlay from '../../../components/Global/TutorialOverlay/TutorialOverlay';
import { limitTutorialSteps } from '../../../utils/tutorial/Limit';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { allDexBalanceMethodsIF } from '../../../App/hooks/useExchangePrefs';

interface propsIF {
    account: string | undefined;
    pool: CrocPoolView | undefined;
    crocEnv: CrocEnv | undefined;
    isUserLoggedIn: boolean | undefined;
    importedTokens: Array<TokenIF>;
    mintSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    provider?: ethers.providers.Provider;
    isOnTradeRoute?: boolean;
    gasPriceInGwei: number | undefined;
    ethMainnetUsdPrice?: number;
    // nativeBalance: string | undefined;
    lastBlockNumber: number;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    poolPriceDisplay: number | undefined;
    // poolPriceNonDisplay: number | undefined;
    tokenAAllowance: string;
    setRecheckTokenAApproval: Dispatch<SetStateAction<boolean>>;
    chainId: string;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
    openModalWallet: () => void;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    poolExists: boolean | undefined;
    chainData: ChainSpec;
    isOrderCopied: boolean;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (
        searchName: string,
        chn: string,
        exact: boolean,
    ) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (
        options?: getRecentTokensParamsIF | undefined,
    ) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    acknowledgeToken: (tkn: TokenIF) => void;
    setResetLimitTick: Dispatch<SetStateAction<boolean>>;

    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;

    isTutorialMode: boolean;
    setIsTutorialMode: Dispatch<SetStateAction<boolean>>;
    dexBalancePrefs: allDexBalanceMethodsIF;
}

const cachedQuerySpotPrice = memoizeQuerySpotPrice();

export default function Limit(props: propsIF) {
    const {
        account,
        provider,
        pool,
        crocEnv,
        isUserLoggedIn,
        importedTokens,
        mintSlippage,
        isPairStable,
        setImportedTokens,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenPair,
        gasPriceInGwei,
        ethMainnetUsdPrice,
        poolPriceDisplay,
        tokenAAllowance,
        setRecheckTokenAApproval,
        chainId,
        chainData,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
        openModalWallet,
        poolExists,
        lastBlockNumber,
        isOrderCopied,
        verifyToken,
        getTokensByName,
        getTokenByAddress,
        importedTokensPlus,
        getRecentTokens,
        addRecentToken,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        acknowledgeToken,
        setResetLimitTick,
        openGlobalPopup,
        bypassConfirm,
        toggleBypassConfirm,
        dexBalancePrefs,
    } = props;

    const { tradeData, navigationMenu, limitTickFromParams } = useTradeData();
    const dispatch = useAppDispatch();

    const [isModalOpen, openModal, closeModal] = useModal();
    const [limitAllowed, setLimitAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(
        dexBalancePrefs.limit.drawFromDexBal.isEnabled,
    );
    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(
        dexBalancePrefs.limit.outputToDexBal.isEnabled,
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
    const slippageTolerancePercentage = tradeData.slippageTolerance;

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

    const { tokenA, tokenB } = useUrlParams();
    const { baseToken, quoteToken } = tradeData;

    const isSellTokenBase = useMemo(
        () => pool?.baseToken === tokenA,
        [pool?.baseToken, tokenA],
    );

    useEffect(() => {
        dispatch(setLimitTick(undefined));
    }, [tokenA + tokenB]);

    useEffect(() => {
        (async () => {
            if (limitTick === undefined && crocEnv && !limitTickCopied) {
                // console.log('resetting limit to default');
                if (!pool) return;

                const spotPrice = await cachedQuerySpotPrice(
                    crocEnv,
                    pool.baseToken,
                    pool.quoteToken,
                    chainData.chainId,
                    lastBlockNumber,
                );

                const gridSize = lookupChain(chainId).gridSize;

                const initialLimitRateNonDisplay =
                    spotPrice * (isSellTokenBase ? 0.985 : 1.015);

                const pinnedTick: number = isSellTokenBase
                    ? pinTickLower(initialLimitRateNonDisplay, gridSize)
                    : pinTickUpper(initialLimitRateNonDisplay, gridSize);

                console.log({ pinnedTick });
                dispatch(setLimitTick(pinnedTick));

                const tickPrice = tickToPrice(pinnedTick);
                const tickDispPrice = pool.toDisplayPrice(tickPrice);

                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;
                    setEndDisplayPrice(displayPriceWithDenom);

                    const limitRateTruncated =
                        displayPriceWithDenom < 2
                            ? displayPriceWithDenom.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                              })
                            : displayPriceWithDenom.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              });
                    console.log({ limitRateTruncated });
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
                        // console.log({ priceHalfAbove });
                        if (isSellTokenBase)
                            setMiddleDisplayPrice(priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        // console.log({ priceFullTickAbove });
                        if (isSellTokenBase)
                            setStartDisplayPrice(priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        // console.log({ priceHalfBelow });
                        if (!isSellTokenBase)
                            setMiddleDisplayPrice(priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        // console.log({ priceFullTickBelow });
                        if (!isSellTokenBase)
                            setStartDisplayPrice(priceFullTickBelow);
                    });
                } else {
                    priceHalfAbove.then((priceHalfAbove) => {
                        // console.log({ priceHalfAbove });
                        if (isSellTokenBase)
                            setMiddleDisplayPrice(1 / priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        // console.log({ priceFullTickAbove });
                        if (isSellTokenBase)
                            setStartDisplayPrice(1 / priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        // console.log({ priceHalfBelow });
                        if (!isSellTokenBase)
                            setMiddleDisplayPrice(1 / priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        // console.log({ priceFullTickBelow });
                        if (!isSellTokenBase)
                            setStartDisplayPrice(1 / priceFullTickBelow);
                    });
                }
            } else if (limitTick) {
                if (!pool) return;
                if (poolPriceNonDisplay === 0) return;

                const gridSize = lookupChain(chainId).gridSize;

                const tickPrice = tickToPrice(limitTick);

                const tickDispPrice = pool.toDisplayPrice(tickPrice);

                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;

                    setEndDisplayPrice(displayPriceWithDenom);
                    const limitRateTruncated =
                        displayPriceWithDenom < 2
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
                        // console.log({ priceHalfAbove });
                        if (isSellTokenBase)
                            setMiddleDisplayPrice(priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        // console.log({ priceFullTickAbove });
                        if (isSellTokenBase)
                            setStartDisplayPrice(priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        // console.log({ priceHalfBelow });
                        if (!isSellTokenBase)
                            setMiddleDisplayPrice(priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        // console.log({ priceFullTickBelow });
                        if (!isSellTokenBase)
                            setStartDisplayPrice(priceFullTickBelow);
                    });
                } else {
                    priceHalfAbove.then((priceHalfAbove) => {
                        // console.log({ priceHalfAbove });
                        if (isSellTokenBase)
                            setMiddleDisplayPrice(1 / priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        // console.log({ priceFullTickAbove });
                        if (isSellTokenBase)
                            setStartDisplayPrice(1 / priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        // console.log({ priceHalfBelow });
                        if (!isSellTokenBase)
                            setMiddleDisplayPrice(1 / priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        // console.log({ priceFullTickBelow });
                        if (!isSellTokenBase)
                            setStartDisplayPrice(1 / priceFullTickBelow);
                    });
                }

                setPriceInputFieldBlurred(false);
                if (limitTickCopied) dispatch(setLimitTickCopied(false));
            }
        })();
    }, [
        limitTickCopied,
        limitTick,
        poolPriceNonDisplay === 0,
        isDenomBase,
        priceInputFieldBlurred,
    ]);

    const [isOrderValid, setIsOrderValid] = useState<boolean>(true);

    useEffect(() => {
        if (!crocEnv) return;
        if (!limitTick) return;

        const testOrder = isTokenAPrimary
            ? crocEnv.sell(tokenA, 0)
            : crocEnv.buy(tokenB, 0);

        const ko = testOrder.atLimit(
            isTokenAPrimary ? tokenB : tokenA,
            limitTick,
        );

        (async () => {
            // console.log({ limitTick });
            if (await ko.willMintFail()) {
                // console.log('Cannot send limit order: Knockout price inside spread');
                setLimitButtonErrorMessage(
                    `Limit ${
                        (isSellTokenBase && !isDenomBase) ||
                        (!isSellTokenBase && isDenomBase)
                            ? 'Above Maximum'
                            : 'Below Minimum'
                    }  Price`,
                );
                setIsOrderValid(false);
                return;
            } else {
                setIsOrderValid(true);
            }
        })();
    }, [limitTick, tokenAInputQty, tokenBInputQty]);

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
    }, [
        JSON.stringify({ base: baseToken.address, quote: quoteToken.address }),
    ]);

    const sendLimitOrder = async () => {
        console.log('Send limit');
        if (!crocEnv || limitTick === undefined) return;
        // if (!provider || !(provider as ethers.providers.WebSocketProvider).getSigner()) {
        //     return;
        // }
        resetConfirmation();
        setIsWaitingForWallet(true);

        console.log({ limitTick });

        const sellToken = tradeData.tokenA.address;
        const buyToken = tradeData.tokenB.address;
        const sellQty = tokenAInputQty;
        const buyQty = tokenBInputQty;

        const qty = isTokenAPrimary ? sellQty : buyQty;

        const order = isTokenAPrimary
            ? crocEnv.sell(sellToken, qty)
            : crocEnv.buy(buyToken, qty);
        // console.log({ limitTick });
        const ko = order.atLimit(
            isTokenAPrimary ? buyToken : sellToken,
            limitTick,
        );
        // console.log({ ko });
        if (await ko.willMintFail()) {
            console.log(
                'Cannot send limit order: Knockout price inside spread',
            );
            setTxErrorMessage('Limit inside market price');
            return;
        }

        let tx;
        try {
            tx = await ko.mint({ surplus: isWithdrawFromDexChecked });
            console.log(tx.hash);
            dispatch(addPendingTx(tx?.hash));
            setNewLimitOrderTransactionHash(tx.hash);
            setIsWaitingForWallet(false);
            if (tx?.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: 'Limit',
                    }),
                );
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.log({ error });
            setTxErrorCode(error.code);
            setTxErrorMessage(error.message);
            setIsWaitingForWallet(false);
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
        }

        const newLimitOrderChangeCacheEndpoint =
            'https://809821320828123.de:5000/new_limit_order_change?';

        if (tx?.hash) {
            fetch(
                newLimitOrderChangeCacheEndpoint +
                    new URLSearchParams({
                        chainId: chainId,
                        tx: tx.hash,
                        user: account ?? '',
                        base: tradeData.baseToken.address,
                        quote: tradeData.quoteToken.address,
                        poolIdx: lookupChain(chainId).poolIndex.toString(),
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
            console.log({ error });
            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                console.log('repriced');
                dispatch(removePendingTx(error.hash));
                const newTransactionHash = error.replacement.hash;
                dispatch(addPendingTx(newTransactionHash));
                setNewLimitOrderTransactionHash(newTransactionHash);
                console.log({ newTransactionHash });
                receipt = error.receipt;

                if (newTransactionHash) {
                    fetch(
                        newLimitOrderChangeCacheEndpoint +
                            new URLSearchParams({
                                chainId: chainId,
                                tx: newTransactionHash,
                                user: account ?? '',
                                base: tradeData.baseToken.address,
                                quote: tradeData.quoteToken.address,
                                poolIdx:
                                    lookupChain(chainId).poolIndex.toString(),
                                positionType: 'knockout',
                                changeType: 'mint',
                                limitTick: limitTick.toString(),
                                isBid: isSellTokenBase.toString(), // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                                liq: '0', // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                            }),
                    );
                }
            } else if (isTransactionFailedError(error)) {
                // console.log({ error });
                receipt = error.receipt;
            }
        }

        if (receipt) {
            dispatch(addReceipt(JSON.stringify(receipt)));
            dispatch(removePendingTx(receipt.transactionHash));
        }
    };

    const handleModalClose = () => {
        closeModal();
        setNewLimitOrderTransactionHash('');
        resetConfirmation();
    };

    const confirmLimitModalProps = {
        onClose: handleModalClose,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay || 0,
        initiateLimitOrderMethod: sendLimitOrder,
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
        isTokenAPrimary: isTokenAPrimary,
        insideTickDisplayPrice: endDisplayPrice,
        newLimitOrderTransactionHash: newLimitOrderTransactionHash,
        txErrorCode: txErrorCode,
        txErrorMessage: txErrorMessage,
        showConfirmation: showConfirmation,
        setShowConfirmation: setShowConfirmation,
        resetConfirmation: resetConfirmation,
        startDisplayPrice: startDisplayPrice,
        middleDisplayPrice: middleDisplayPrice,
        endDisplayPrice: endDisplayPrice,
        bypassConfirm: bypassConfirm,
        toggleBypassConfirm: toggleBypassConfirm,
        showBypassConfirmButton: showBypassConfirmButton,
        setShowBypassConfirmButton: setShowBypassConfirmButton,
    };
    const bypassLimitProps = {
        newLimitOrderTransactionHash: newLimitOrderTransactionHash,
        txErrorCode: txErrorCode,
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
        tokenPair: tokenPair,
        resetConfirmation: resetConfirmation,
        showBypassConfirmButton: showBypassConfirmButton,
        setShowBypassConfirmButton: setShowBypassConfirmButton,
        sendLimitOrder: sendLimitOrder,
        setNewLimitOrderTransactionHash: setNewLimitOrderTransactionHash,
        // onClose: handleModalClose,
        // poolPriceDisplay: poolPriceDisplay || 0,
        // initiateLimitOrderMethod: sendLimitOrder,
        // isTokenAPrimary: isTokenAPrimary,
        // insideTickDisplayPrice: endDisplayPrice,
        // txErrorMessage: txErrorMessage,
        // showConfirmation: showConfirmation,
        // setShowConfirmation: setShowConfirmation,
        // startDisplayPrice: startDisplayPrice,
        // middleDisplayPrice: middleDisplayPrice,
        // endDisplayPrice: endDisplayPrice,
        // bypassConfirm: bypassConfirm,
        // toggleBypassConfirm: toggleBypassConfirm,
    };

    const confirmLimitModalOrNull = isModalOpen ? (
        <Modal onClose={handleModalClose} title='Limit Confirmation'>
            <ConfirmLimitModal {...confirmLimitModalProps} />
        </Modal>
    ) : null;

    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    const loginButton = (
        <button
            onClick={openModalWallet}
            className={styles.authenticate_button}
        >
            Connect Wallet
        </button>
    );

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const approve = async (tokenAddress: string) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv.token(tokenAddress).approve();
            if (tx) dispatch(addPendingTx(tx?.hash));
            if (tx?.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: 'Approval',
                    }),
                );
            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.log({ error });
                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    console.log('repriced');
                    dispatch(removePendingTx(error.hash));

                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));

                    console.log({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    // console.log({ error });
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
            console.log({ error });
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
                    ? `Click to Approve ${tokenPair.dataTokenA.symbol}`
                    : `${tokenPair.dataTokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenPair.dataTokenA.address);
            }}
            flat={true}
        />
    );

    // -------------------------Limit SHARE FUNCTIONALITY---------------------------
    const [shareOptions, setShareOptions] = useState([
        { slug: 'first', name: 'Include Limit 1', checked: false },
        { slug: 'second', name: 'Include Limit 2', checked: false },
        { slug: 'third', name: 'Include Limit 3', checked: false },
        { slug: 'fourth', name: 'Include Limit 4', checked: false },
    ]);

    const handleShareOptionChange = (slug: string) => {
        const copyShareOptions = [...shareOptions];
        const modifiedShareOptions = copyShareOptions.map((option) => {
            if (slug === option.slug) {
                option.checked = !option.checked;
            }

            return option;
        });

        setShareOptions(modifiedShareOptions);
    };

    const shareOptionsDisplay = (
        <div className={styles.option_control_container}>
            <div className={styles.options_control_display_container}>
                <p className={styles.control_title}>Options</p>
                <ul>
                    {shareOptions.map((option, idx) => (
                        <LimitShareControl
                            key={idx}
                            option={option}
                            handleShareOptionChange={handleShareOptionChange}
                        />
                    ))}
                </ul>
            </div>
            <p className={styles.control_title}>URL:</p>
            <p className={styles.url_link}>
                https://ambient.finance/trade/market/0xaaaaaa/93bbbb
                <div style={{ cursor: 'pointer' }}>
                    <FiCopy color='#cdc1ff' />
                </div>
            </p>
        </div>
    );

    const currencyConverterProps = {
        displayPrice: displayPrice,
        previousDisplayPrice: previousDisplayPrice,
        setDisplayPrice: setDisplayPrice,
        setPreviousDisplayPrice: setPreviousDisplayPrice,
        provider: provider,
        setPriceInputFieldBlurred: setPriceInputFieldBlurred,
        pool: pool,
        gridSize: chainData.gridSize,
        isUserLoggedIn: isUserLoggedIn,
        tokenPair: tokenPair,
        poolPriceNonDisplay: poolPriceNonDisplay,
        isSellTokenBase: isSellTokenBase,
        tokensBank: importedTokens,
        setImportedTokens: setImportedTokens,
        chainId: chainId,
        setLimitAllowed: setLimitAllowed,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
        setTokenAInputQty: setTokenAInputQty,
        isSaveAsDexSurplusChecked: isSaveAsDexSurplusChecked,
        setTokenBInputQty: setTokenBInputQty,
        setIsSaveAsDexSurplusChecked: setIsSaveAsDexSurplusChecked,
        setLimitButtonErrorMessage: setLimitButtonErrorMessage,
        isWithdrawFromDexChecked: isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked: setIsWithdrawFromDexChecked,
        limitTickDisplayPrice: endDisplayPrice,
        isDenominationInBase: tradeData.isDenomBase,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        poolExists: poolExists,
        gasPriceInGwei: gasPriceInGwei,
        isOrderCopied: isOrderCopied,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: importedTokensPlus,
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        acknowledgeToken: acknowledgeToken,
        setResetLimitTick: setResetLimitTick,
        openGlobalPopup: openGlobalPopup,
        dexBalancePrefs: dexBalancePrefs,
    };
    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    // -------------------------END OF Limit SHARE FUNCTIONALITY---------------------------
    return (
        <section className={styles.scrollable_container}>
            {props.isTutorialMode && (
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
                <LimitHeader
                    chainId={chainId}
                    mintSlippage={mintSlippage}
                    isPairStable={isPairStable}
                    openGlobalModal={props.openGlobalModal}
                    shareOptionsDisplay={shareOptionsDisplay}
                    bypassConfirm={bypassConfirm}
                    toggleBypassConfirm={toggleBypassConfirm}
                />
                {navigationMenu}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <LimitCurrencyConverter {...currencyConverterProps} />
                </motion.div>
                <div className={styles.header_container}>
                    {/* <DividerDark addMarginTop /> */}
                    {/* <DenominationSwitch /> */}
                </div>
                <LimitExtraInfo
                    isQtyEntered={
                        tokenAInputQty !== '' || tokenBInputQty !== ''
                    }
                    tokenPair={tokenPair}
                    orderGasPriceInDollars={orderGasPriceInDollars}
                    poolPriceDisplay={poolPriceDisplay || 0}
                    slippageTolerance={slippageTolerancePercentage}
                    liquidityProviderFee={tradeData.liquidityFee * 100}
                    didUserFlipDenom={tradeData.didUserFlipDenom}
                    isTokenABase={isSellTokenBase}
                    isDenomBase={isDenomBase}
                    limitRate={endDisplayPrice.toString()}
                    startDisplayPrice={startDisplayPrice}
                    middleDisplayPrice={middleDisplayPrice}
                    endDisplayPrice={endDisplayPrice}
                />
                {isUserLoggedIn === undefined ? null : isUserLoggedIn ===
                  true ? (
                    !isTokenAAllowanceSufficient &&
                    parseFloat(tokenAInputQty) > 0 ? (
                        approvalButton
                    ) : showBypassConfirmButton ? (
                        <BypassLimitButton {...bypassLimitProps} />
                    ) : (
                        <LimitButton
                            onClickFn={
                                bypassConfirm
                                    ? handleLimitButtonClickWithBypass
                                    : openModal
                            }
                            limitAllowed={
                                isOrderValid &&
                                poolPriceNonDisplay !== 0 &&
                                limitAllowed
                            }
                            limitButtonErrorMessage={limitButtonErrorMessage}
                            bypassConfirm={bypassConfirm}
                        />
                    )
                ) : (
                    loginButton
                )}
            </ContentContainer>
            {confirmLimitModalOrNull}
            <TutorialOverlay
                isTutorialEnabled={isTutorialEnabled}
                setIsTutorialEnabled={setIsTutorialEnabled}
                steps={limitTutorialSteps}
            />
        </section>
    );
}
