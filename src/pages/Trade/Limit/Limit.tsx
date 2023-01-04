// START: Import React and Dongles
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
    tickToPrice,
    CrocEnv,
    pinTickLower,
    pinTickUpper,
    // priceHalfBelowTick,
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
import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Global/Button/Button';
import ConfirmLimitModal from '../../../components/Trade/Limit/ConfirmLimitModal/ConfirmLimitModal';

// START: Import Local Files
import styles from './Limit.module.css';
import { useTradeData } from '../Trade';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { useModal } from '../../../components/Global/Modal/useModal';
import { SlippagePairIF, TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { setLimitTick, setLimitTickCopied } from '../../../utils/state/tradeDataSlice';
import { addPendingTx, addReceipt, removePendingTx } from '../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';
import LimitShareControl from '../../../components/Trade/Limit/LimitShareControl/LimitShareControl';
import { FiCopy } from 'react-icons/fi';
import { memoizeQuerySpotPrice } from '../../../App/functions/querySpotPrice';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';

interface LimitPropsIF {
    account: string | undefined;
    pool: CrocPoolView | undefined;
    crocEnv: CrocEnv | undefined;
    isUserLoggedIn: boolean | undefined;
    importedTokens: Array<TokenIF>;
    mintSlippage: SlippagePairIF;
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
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (options?: getRecentTokensParamsIF | undefined) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
}

const cachedQuerySpotPrice = memoizeQuerySpotPrice();

export default function Limit(props: LimitPropsIF) {
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
        // isSellTokenBase,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenPair,
        gasPriceInGwei,
        ethMainnetUsdPrice,
        poolPriceDisplay,
        // poolPriceNonDisplay,
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
    } = props;

    const { tradeData, navigationMenu } = useTradeData();
    const dispatch = useAppDispatch();

    const [isModalOpen, openModal, closeModal] = useModal();
    const [limitAllowed, setLimitAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(false);

    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(false);

    const [limitButtonErrorMessage, setLimitButtonErrorMessage] = useState<string>('');
    const [priceInputFieldBlurred, setPriceInputFieldBlurred] = useState(false);

    const [newLimitOrderTransactionHash, setNewLimitOrderTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const [showConfirmation, setShowConfirmation] = useState<boolean>(true);

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode(0);
        setTxErrorMessage('');
    };

    const isTokenAPrimary = tradeData.isTokenAPrimary;
    const limitTick = tradeData.limitTick;
    const isSellTokenBase = tradeData.isTokenABase;
    const poolPriceNonDisplay = tradeData.poolPriceNonDisplay;

    const slippageTolerancePercentage = tradeData.slippageTolerance;

    // const [limitTick, setLimitTick] = useState<number>(0);
    const [endDisplayPrice, setEndDisplayPrice] = useState<number>(0);
    const [startDisplayPrice, setStartDisplayPrice] = useState<number>(0);
    const [middleDisplayPrice, setMiddleDisplayPrice] = useState<number>(0);
    const [orderGasPriceInDollars, setOrderGasPriceInDollars] = useState<string | undefined>();

    // const [initialLoad, setInitialLoad] = useState<boolean>(false);

    const isDenomBase = tradeData.isDenomBase;
    const limitTickCopied = tradeData.limitTickCopied;

    useEffect(() => {
        (async () => {
            // console.log({ limitTickCopied });
            if (limitTick === 0 && crocEnv && !limitTickCopied) {
                // console.log({ limitTick });
                if (!pool) return;
                // if (!provider) return;
                // if (!poolPriceNonDisplay) return;

                // console.log({ poolPriceNonDisplay });

                const spotPrice = await cachedQuerySpotPrice(
                    crocEnv,
                    pool.baseToken,
                    pool.quoteToken,
                    chainData.chainId,
                    lastBlockNumber,
                );
                // console.log({ spotPrice });

                const gridSize = lookupChain(chainId).gridSize;

                // console.log({ isSellTokenBase });
                const initialLimitRateNonDisplay = spotPrice * (isSellTokenBase ? 0.985 : 1.015);

                // console.log({ initialLimitRateNonDisplay });

                const pinnedTick: number = isSellTokenBase
                    ? pinTickLower(initialLimitRateNonDisplay, gridSize)
                    : pinTickUpper(initialLimitRateNonDisplay, gridSize);
                // pinTick.then(setLimitTick);
                // pinTick.then((newTick) => {
                // console.log({ pinnedTick });

                dispatch(setLimitTick(pinnedTick));

                const tickPrice = tickToPrice(pinnedTick);
                const tickDispPrice = pool.toDisplayPrice(tickPrice);

                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;
                    setEndDisplayPrice(displayPriceWithDenom);
                    // console.log({ displayPriceWithDenom });

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
                    // console.log({ limitRateTruncated });
                    const limitRateInputField = document.getElementById('limit-rate-quantity');
                    if (limitRateInputField)
                        (limitRateInputField as HTMLInputElement).value = limitRateTruncated;
                });

                // const priceHalfBelow = pool.toDisplayPrice(priceHalfBelowTick(pinnedTick, gridSize));
                const priceHalfAbove = pool.toDisplayPrice(
                    priceHalfAboveTick(pinnedTick, gridSize),
                );
                const priceHalfBelow = pool.toDisplayPrice(
                    priceHalfBelowTick(pinnedTick, gridSize),
                );
                // const priceFullTickBelow = pool.toDisplayPrice(tickToPrice(pinnedTick - gridSize));
                const priceFullTickAbove = pool.toDisplayPrice(tickToPrice(pinnedTick + gridSize));
                const priceFullTickBelow = pool.toDisplayPrice(tickToPrice(pinnedTick - gridSize));

                if (isDenomBase) {
                    priceHalfAbove.then((priceHalfAbove) => {
                        console.log({ priceHalfAbove });
                        if (isSellTokenBase) setMiddleDisplayPrice(priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        console.log({ priceFullTickAbove });
                        if (isSellTokenBase) setStartDisplayPrice(priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        console.log({ priceHalfBelow });
                        if (!isSellTokenBase) setMiddleDisplayPrice(priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        console.log({ priceFullTickBelow });
                        if (!isSellTokenBase) setStartDisplayPrice(priceFullTickBelow);
                    });
                } else {
                    priceHalfAbove.then((priceHalfAbove) => {
                        console.log({ priceHalfAbove });
                        if (isSellTokenBase) setMiddleDisplayPrice(1 / priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        console.log({ priceFullTickAbove });
                        if (isSellTokenBase) setStartDisplayPrice(1 / priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        console.log({ priceHalfBelow });
                        if (!isSellTokenBase) setMiddleDisplayPrice(1 / priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        console.log({ priceFullTickBelow });
                        if (!isSellTokenBase) setStartDisplayPrice(1 / priceFullTickBelow);
                    });
                }
            } else if (limitTick) {
                if (!pool) return;
                // if (!provider) return;
                if (poolPriceNonDisplay === 0) return;
                // if (!priceInputFieldBlurred) return;

                const gridSize = lookupChain(chainId).gridSize;

                const tickPrice = tickToPrice(limitTick);

                const tickDispPrice = pool.toDisplayPrice(tickPrice);

                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;

                    // const limitPriceWithDenom = isDenomBase ? 1 / tp : tp;
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
                    // console.log({ limitRateTruncated });
                    const limitRateInputField = document.getElementById('limit-rate-quantity');
                    if (limitRateInputField)
                        (limitRateInputField as HTMLInputElement).value = limitRateTruncated;
                });

                // const priceHalfBelow = pool.toDisplayPrice(priceHalfBelowTick(pinnedTick, gridSize));
                const priceHalfAbove = pool.toDisplayPrice(priceHalfAboveTick(limitTick, gridSize));
                const priceHalfBelow = pool.toDisplayPrice(priceHalfBelowTick(limitTick, gridSize));
                // const priceFullTickBelow = pool.toDisplayPrice(tickToPrice(pinnedTick - gridSize));
                const priceFullTickAbove = pool.toDisplayPrice(tickToPrice(limitTick + gridSize));
                const priceFullTickBelow = pool.toDisplayPrice(tickToPrice(limitTick - gridSize));

                if (isDenomBase) {
                    priceHalfAbove.then((priceHalfAbove) => {
                        // console.log({ priceHalfAbove });
                        if (isSellTokenBase) setMiddleDisplayPrice(priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        // console.log({ priceFullTickAbove });
                        if (isSellTokenBase) setStartDisplayPrice(priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        // console.log({ priceHalfBelow });
                        if (!isSellTokenBase) setMiddleDisplayPrice(priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        // console.log({ priceFullTickBelow });
                        if (!isSellTokenBase) setStartDisplayPrice(priceFullTickBelow);
                    });
                } else {
                    priceHalfAbove.then((priceHalfAbove) => {
                        // console.log({ priceHalfAbove });
                        if (isSellTokenBase) setMiddleDisplayPrice(1 / priceHalfAbove);
                    });
                    priceFullTickAbove.then((priceFullTickAbove) => {
                        // console.log({ priceFullTickAbove });
                        if (isSellTokenBase) setStartDisplayPrice(1 / priceFullTickAbove);
                    });
                    priceHalfBelow.then((priceHalfBelow) => {
                        // console.log({ priceHalfBelow });
                        if (!isSellTokenBase) setMiddleDisplayPrice(1 / priceHalfBelow);
                    });
                    priceFullTickBelow.then((priceFullTickBelow) => {
                        // console.log({ priceFullTickBelow });
                        if (!isSellTokenBase) setStartDisplayPrice(1 / priceFullTickBelow);
                    });
                }

                setPriceInputFieldBlurred(false);
                if (limitTickCopied) dispatch(setLimitTickCopied(false));
            }
        })();
    }, [
        pool,
        limitTickCopied,
        // initialLoad,
        chainId,
        limitTick,
        poolPriceNonDisplay,
        isSellTokenBase,
        isDenomBase,
        priceInputFieldBlurred,
    ]);

    const [isOrderValid, setIsOrderValid] = useState<boolean>(true);

    useEffect(() => {
        // if (!provider) return;
        if (!crocEnv) return;
        if (!limitTick) return;

        const sellToken = tradeData.tokenA.address;
        const buyToken = tradeData.tokenB.address;

        // const sellQty = tokenAInputQty;
        // const buyQty = tokenBInputQty;
        // const qty = isTokenAPrimary ? sellQty : buyQty;

        const testOrder = isTokenAPrimary ? crocEnv.sell(sellToken, 0) : crocEnv.buy(buyToken, 0);

        const ko = testOrder.atLimit(isTokenAPrimary ? buyToken : sellToken, limitTick);

        (async () => {
            // console.log({ limitTick });
            if (await ko.willMintFail()) {
                // console.log('Cannot send limit order: Knockout price inside spread');
                setLimitButtonErrorMessage(
                    `Limit ${
                        (isSellTokenBase && !isDenomBase) || (!isSellTokenBase && isDenomBase)
                            ? 'Above'
                            : 'Below'
                    } Market Price`,
                );
                setIsOrderValid(false);
                return;
            } else {
                // setLimitButtonErrorMessage('');
                setIsOrderValid(true);
            }
        })();
    }, [limitTick, tokenAInputQty, tokenBInputQty]);

    const sendLimitOrder = async () => {
        console.log('Send limit');
        if (!crocEnv) return;
        // if (!provider || !(provider as ethers.providers.WebSocketProvider).getSigner()) {
        //     return;
        // }
        resetConfirmation();

        console.log({ limitTick });

        const sellToken = tradeData.tokenA.address;
        const buyToken = tradeData.tokenB.address;
        const sellQty = tokenAInputQty;
        const buyQty = tokenBInputQty;

        const qty = isTokenAPrimary ? sellQty : buyQty;

        const order = isTokenAPrimary ? crocEnv.sell(sellToken, qty) : crocEnv.buy(buyToken, qty);
        // console.log({ limitTick });
        const ko = order.atLimit(isTokenAPrimary ? buyToken : sellToken, limitTick);
        // console.log({ ko });
        if (await ko.willMintFail()) {
            console.log('Cannot send limit order: Knockout price inside spread');
            setTxErrorMessage('Limit inside market price');
            return;
        }

        let tx;
        try {
            tx = await ko.mint({ surplus: isWithdrawFromDexChecked });
            console.log(tx.hash);
            dispatch(addPendingTx(tx?.hash));
            setNewLimitOrderTransactionHash(tx.hash);
        } catch (error) {
            console.log({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
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
                                poolIdx: lookupChain(chainId).poolIndex.toString(),
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
        // setTxErrorCode(0);
        // setTxErrorMessage('');
        resetConfirmation();
    };

    const confirmLimitModalOrNull = isModalOpen ? (
        <Modal onClose={handleModalClose} title='Limit Confirmation'>
            <ConfirmLimitModal
                onClose={handleModalClose}
                tokenPair={tokenPair}
                poolPriceDisplay={poolPriceDisplay || 0}
                initiateLimitOrderMethod={sendLimitOrder}
                tokenAInputQty={tokenAInputQty}
                tokenBInputQty={tokenBInputQty}
                isTokenAPrimary={isTokenAPrimary}
                // limitRate={limitRate}
                insideTickDisplayPrice={endDisplayPrice}
                newLimitOrderTransactionHash={newLimitOrderTransactionHash}
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
    ) : null;

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    const loginButton = (
        <button onClick={openModalWallet} className={styles.authenticate_button}>
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
            console.log({ error });
        } finally {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
        }
    };

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum = gasPriceInGwei * 82459 * 1e-9 * ethMainnetUsdPrice;

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

    // -------------------------END OF Limit SHARE FUNCTIONALITY---------------------------
    return (
        <section className={styles.scrollable_container}>
            <ContentContainer isOnTradeRoute>
                <LimitHeader
                    chainId={chainId}
                    mintSlippage={mintSlippage}
                    isPairStable={isPairStable}
                    openGlobalModal={props.openGlobalModal}
                    shareOptionsDisplay={shareOptionsDisplay}
                />
                <DividerDark addMarginTop />
                {navigationMenu}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <LimitCurrencyConverter
                        provider={provider}
                        setPriceInputFieldBlurred={setPriceInputFieldBlurred}
                        pool={pool}
                        gridSize={chainData.gridSize}
                        isUserLoggedIn={isUserLoggedIn}
                        tokenPair={tokenPair}
                        poolPriceNonDisplay={poolPriceNonDisplay}
                        isSellTokenBase={isSellTokenBase}
                        tokensBank={importedTokens}
                        setImportedTokens={setImportedTokens}
                        chainId={chainId}
                        setLimitAllowed={setLimitAllowed}
                        baseTokenBalance={baseTokenBalance}
                        quoteTokenBalance={quoteTokenBalance}
                        baseTokenDexBalance={baseTokenDexBalance}
                        quoteTokenDexBalance={quoteTokenDexBalance}
                        tokenAInputQty={tokenAInputQty}
                        tokenBInputQty={tokenBInputQty}
                        setTokenAInputQty={setTokenAInputQty}
                        isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                        setTokenBInputQty={setTokenBInputQty}
                        setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                        setLimitButtonErrorMessage={setLimitButtonErrorMessage}
                        isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                        setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                        limitTickDisplayPrice={endDisplayPrice}
                        isDenominationInBase={tradeData.isDenomBase}
                        activeTokenListsChanged={activeTokenListsChanged}
                        indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
                        poolExists={poolExists}
                        gasPriceInGwei={gasPriceInGwei}
                        isOrderCopied={isOrderCopied}
                        verifyToken={verifyToken}
                        getTokensByName={getTokensByName}
                        getTokenByAddress={getTokenByAddress}
                        importedTokensPlus={importedTokensPlus}
                        getRecentTokens={getRecentTokens}
                        addRecentToken={addRecentToken}
                    />
                </motion.div>
                <div className={styles.header_container}>
                    <DividerDark addMarginTop />
                    {/* <DenominationSwitch /> */}
                </div>
                <LimitExtraInfo
                    isQtyEntered={tokenAInputQty !== '' || tokenBInputQty !== ''}
                    tokenPair={tokenPair}
                    orderGasPriceInDollars={orderGasPriceInDollars}
                    poolPriceDisplay={poolPriceDisplay || 0}
                    slippageTolerance={slippageTolerancePercentage}
                    liquidityProviderFee={tradeData.liquidityFee * 100}
                    // quoteTokenIsBuy={true}
                    didUserFlipDenom={tradeData.didUserFlipDenom}
                    isTokenABase={isSellTokenBase}
                    isDenomBase={isDenomBase}
                    limitRate={endDisplayPrice.toString()}
                    startDisplayPrice={startDisplayPrice}
                    middleDisplayPrice={middleDisplayPrice}
                    endDisplayPrice={endDisplayPrice}
                />
                {isUserLoggedIn === undefined ? null : isUserLoggedIn === true ? (
                    !isTokenAAllowanceSufficient && parseFloat(tokenAInputQty) > 0 ? (
                        approvalButton
                    ) : (
                        <LimitButton
                            onClickFn={openModal}
                            limitAllowed={isOrderValid && poolPriceNonDisplay !== 0 && limitAllowed}
                            limitButtonErrorMessage={limitButtonErrorMessage}
                        />
                    )
                ) : (
                    loginButton
                )}
            </ContentContainer>
            {confirmLimitModalOrNull}
        </section>
    );
}
