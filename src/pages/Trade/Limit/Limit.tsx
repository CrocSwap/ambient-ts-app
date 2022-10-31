// START: Import React and Dongles
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
    tickToPrice,
    CrocEnv,
    pinTickLower,
    pinTickUpper,
    priceHalfBelowTick,
    priceHalfAboveTick,
    CrocPoolView,
} from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import React Functional Components
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitButton from '../../../components/Trade/Limit/LimitButton/LimitButton';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import DenominationSwitch from '../../../components/Swap/DenominationSwitch/DenominationSwitch';
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
import { setLimitTick } from '../../../utils/state/tradeDataSlice';
import { addPendingTx, addReceipt, removePendingTx } from '../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';
import LimitShareControl from '../../../components/Trade/Limit/LimitShareControl/LimitShareControl';
import { FiCopy } from 'react-icons/fi';

interface LimitPropsIF {
    pool: CrocPoolView | undefined;
    crocEnv: CrocEnv | undefined;
    isUserLoggedIn: boolean;
    importedTokens: Array<TokenIF>;
    searchableTokens: Array<TokenIF>;
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
    poolPriceNonDisplay: number | undefined;
    tokenAAllowance: string;
    setRecheckTokenAApproval: Dispatch<SetStateAction<boolean>>;
    chainId: string;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
    openModalWallet: () => void;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    poolExists: boolean | null;
}

export default function Limit(props: LimitPropsIF) {
    const {
        pool,
        crocEnv,
        isUserLoggedIn,
        importedTokens,
        searchableTokens,
        mintSlippage,
        isPairStable,
        setImportedTokens,
        isSellTokenBase,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenPair,
        gasPriceInGwei,
        ethMainnetUsdPrice,
        poolPriceDisplay,
        poolPriceNonDisplay,
        tokenAAllowance,
        setRecheckTokenAApproval,
        chainId,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
        openModalWallet,
        poolExists,
    } = props;

    const { tradeData, navigationMenu } = useTradeData();
    const dispatch = useAppDispatch();
    const { account, isWeb3Enabled, isAuthenticated } = useMoralis();
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

    const slippageTolerancePercentage = tradeData.slippageTolerance;

    // const [limitTick, setLimitTick] = useState<number>(0);
    const [endDisplayPrice, setEndDisplayPrice] = useState<number>(0);
    const [startDisplayPrice, setStartDisplayPrice] = useState<number>(0);
    const [middleDisplayPrice, setMiddleDisplayPrice] = useState<number>(0);
    const [orderGasPriceInDollars, setOrderGasPriceInDollars] = useState<string | undefined>();

    const [initialLoad, setInitialLoad] = useState<boolean>(true);

    const isDenomBase = tradeData.isDenomBase;

    useEffect(() => {
        setInitialLoad(true);
    }, [
        JSON.stringify({
            isDenomBase: isDenomBase,
            tokenA: tradeData.tokenA.address,
            tokenB: tradeData.tokenB.address,
        }),
    ]);

    useEffect(() => {
        if (initialLoad) {
            // console.log({ initialLoad });
            if (!pool) return;
            // if (!provider) return;
            if (!poolPriceNonDisplay) return;

            console.log({ isDenomBase });

            const gridSize = lookupChain(chainId).gridSize;

            // const croc = crocEnv ? crocEnv : new CrocEnv(provider);

            const initialLimitRateNonDisplay =
                poolPriceNonDisplay * (isSellTokenBase ? 0.985 : 1.015);

            // console.log({ initialLimitRateNonDisplay });
            // const initialLimitRateWithDenom = isDenomBase
            //     ? 1 / initialLimitRateNonInverted
            //     : initialLimitRateNonInverted;

            // console.log({ initialLimitRateWithDenom });

            // const limitWei = pool.fromDisplayPrice(initialLimitRateNonInverted);
            const pinnedTick: number = isSellTokenBase
                ? pinTickLower(initialLimitRateNonDisplay, gridSize)
                : pinTickUpper(initialLimitRateNonDisplay, gridSize);
            // pinTick.then(setLimitTick);
            // pinTick.then((newTick) => {
            // console.log({ pinnedTick });

            dispatch(setLimitTick(pinnedTick));
            // });
            const tickPrice = tickToPrice(pinnedTick);
            const tickDispPrice = pool.toDisplayPrice(tickPrice);
            // const tickDispPrice = pool.toDisplayPrice(isDenomBase ? 1 / tickPrice : tickPrice);

            // tickDispPrice.then((initialPinnedPrice) => console.log({ initialPinnedPrice }));

            tickDispPrice.then((tp) => {
                const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;
                setEndDisplayPrice(displayPriceWithDenom);
                // console.log({ displayPriceWithDenom });
                // dispatch(setLimitPrice(isDenomBase ? (1 / tp).toString() : tp.toString()));
                setInitialLoad(false);
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

            const priceHalfBelow = pool.toDisplayPrice(priceHalfBelowTick(pinnedTick, gridSize));

            priceHalfBelow.then((priceHalfBelow) => {
                if (!isDenomBase) {
                    setMiddleDisplayPrice(priceHalfBelow);
                }
                // console.log({ priceHalfBelow });
            });

            const priceHalfAbove = pool.toDisplayPrice(priceHalfAboveTick(pinnedTick, gridSize));

            priceHalfAbove.then((priceHalfAbove) => {
                if (isDenomBase) {
                    setMiddleDisplayPrice(1 / priceHalfAbove);
                }
                // console.log({ priceHalfAbove });
            });

            const priceFullTickBelow = pool.toDisplayPrice(tickToPrice(pinnedTick - gridSize));

            priceFullTickBelow.then((priceFullTickBelow) => {
                if (!isDenomBase) {
                    setStartDisplayPrice(priceFullTickBelow);
                }
                // console.log({ priceFullTickBelow });
            });

            const priceFullTickAbove = pool.toDisplayPrice(tickToPrice(pinnedTick + gridSize));

            priceFullTickAbove.then((priceFullTickAbove) => {
                if (isDenomBase) {
                    setStartDisplayPrice(1 / priceFullTickAbove);
                }
                // console.log({ priceFullTickAbove });
            });
        } else {
            if (!pool) return;
            // if (!provider) return;
            if (poolPriceNonDisplay === 0) return;
            // if (!priceInputFieldBlurred) return;

            const gridSize = lookupChain(chainId).gridSize;

            // const croc = crocEnv ? crocEnv : new CrocEnv(provider);

            // const pool = crocEnv.pool(tradeData.baseToken.address, tradeData.quoteToken.address);

            // const limitWei = isDenomBase
            //     ? pool.fromDisplayPrice(1 / parseFloat(limitRate))
            //     : pool.fromDisplayPrice(parseFloat(limitRate));

            // const pinTick = limitWei.then((lw) =>
            //     !isSellTokenBase ? pinTickLower(lw, gridSize) : pinTickUpper(lw, gridSize),
            // );
            // pinTick.then(setLimitTick);
            // pinTick.then((newTick) => {
            //     console.log({ newTick });
            //     console.log({ limitRate });
            //     setLimitTick(newTick);
            // });

            const tickPrice = tickToPrice(limitTick);
            // const tickDispPrice = tickPrice.then((tp) => pool.toDisplayPrice(tp));

            // tickDispPrice.then((pricePinnedInsideDesiredPrice) =>
            //     console.log({ pricePinnedInsideDesiredPrice }),
            // );

            const tickDispPrice = pool.toDisplayPrice(tickPrice);
            // const tickDispPrice = isDenomBase
            //     ? pool.toDisplayPrice(1 / tickPrice)
            //     : pool.toDisplayPrice(tickPrice);

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

            const priceHalfBelow = isDenomBase
                ? pool.toDisplayPrice(1 / priceHalfBelowTick(limitTick, gridSize))
                : pool.toDisplayPrice(priceHalfBelowTick(limitTick, gridSize));

            priceHalfBelow.then((priceHalfBelow) => {
                if (!isDenomBase) {
                    setMiddleDisplayPrice(priceHalfBelow);
                }
                // console.log({ priceHalfBelow });
            });

            const priceHalfAbove = isDenomBase
                ? pool.toDisplayPrice(1 / priceHalfAboveTick(limitTick, gridSize))
                : pool.toDisplayPrice(priceHalfAboveTick(limitTick, gridSize));

            priceHalfAbove.then((priceHalfAbove) => {
                if (isDenomBase) {
                    setMiddleDisplayPrice(1 / priceHalfAbove);
                }
                // console.log({ priceHalfAbove });
            });

            const priceFullTickBelow = isDenomBase
                ? pool.toDisplayPrice(1 / tickToPrice(limitTick - gridSize))
                : pool.toDisplayPrice(tickToPrice(limitTick - gridSize));

            priceFullTickBelow.then((priceFullTickBelow) => {
                if (!isDenomBase) {
                    setStartDisplayPrice(priceFullTickBelow);
                }
                // console.log({ priceFullTickBelow });
            });

            const priceFullTickAbove = isDenomBase
                ? pool.toDisplayPrice(1 / tickToPrice(limitTick + gridSize))
                : pool.toDisplayPrice(tickToPrice(limitTick + gridSize));

            priceFullTickAbove.then((priceFullTickAbove) => {
                if (isDenomBase) {
                    setStartDisplayPrice(1 / priceFullTickAbove);
                }
                // console.log({ priceFullTickAbove });
            });

            setPriceInputFieldBlurred(false);
        }
    }, [
        initialLoad,
        chainId,
        limitTick,
        poolPriceDisplay,
        isSellTokenBase,
        isDenomBase,
        priceInputFieldBlurred,
    ]);

    const [isOrderValid, setIsOrderValid] = useState<boolean>(true);

    useEffect(() => {
        // if (!provider) return;
        if (!crocEnv) return;
        if (!limitTick) return;
        // const croc = crocEnv ? crocEnv : new CrocEnv(provider);

        const sellToken = tradeData.tokenA.address;
        const buyToken = tradeData.tokenB.address;

        // const sellQty = tokenAInputQty;
        // const buyQty = tokenBInputQty;
        // const qty = isTokenAPrimary ? sellQty : buyQty;

        const testOrder = isTokenAPrimary ? crocEnv.sell(sellToken, 0) : crocEnv.buy(buyToken, 0);

        const ko = testOrder.atLimit(isTokenAPrimary ? buyToken : sellToken, limitTick);

        (async () => {
            console.log({ limitTick });
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

        const sellToken = tradeData.tokenA.address;
        const buyToken = tradeData.tokenB.address;
        const sellQty = tokenAInputQty;
        const buyQty = tokenBInputQty;

        const qty = isTokenAPrimary ? sellQty : buyQty;

        // const croc = crocEnv ? crocEnv : new CrocEnv(provider);

        const order = isTokenAPrimary ? crocEnv.sell(sellToken, qty) : crocEnv.buy(buyToken, qty);
        // const seller = new CrocEnv(provider).sell(sellToken, qty);
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
            />
        </Modal>
    ) : null;

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    const loginButton = <Button title='Login' action={openModalWallet} />;
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
                '~$' +
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
                        setPriceInputFieldBlurred={setPriceInputFieldBlurred}
                        pool={pool}
                        isUserLoggedIn={isUserLoggedIn}
                        tokenPair={tokenPair}
                        searchableTokens={searchableTokens}
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
                    />
                </motion.div>
                <div className={styles.header_container}>
                    <DividerDark addMarginTop />
                    <DenominationSwitch />
                </div>
                <LimitExtraInfo
                    tokenPair={tokenPair}
                    orderGasPriceInDollars={orderGasPriceInDollars}
                    poolPriceDisplay={poolPriceDisplay || 0}
                    slippageTolerance={slippageTolerancePercentage}
                    liquidityProviderFee={0}
                    quoteTokenIsBuy={true}
                    didUserFlipDenom={tradeData.didUserFlipDenom}
                    isTokenABase={isSellTokenBase}
                    isDenomBase={isDenomBase}
                    limitRate={endDisplayPrice.toString()}
                    startDisplayPrice={startDisplayPrice}
                    middleDisplayPrice={middleDisplayPrice}
                    endDisplayPrice={endDisplayPrice}
                />
                {isAuthenticated && isWeb3Enabled ? (
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
