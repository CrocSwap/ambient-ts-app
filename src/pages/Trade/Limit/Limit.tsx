import {
    pinTickLower,
    pinTickUpper,
    tickToPrice,
    priceHalfAboveTick,
    priceHalfBelowTick,
} from '@crocswap-libs/sdk';
import { useContext, useState, useEffect, useRef } from 'react';
import {
    getFormattedNumber,
    getTxReceipt,
    submitLimitOrder,
} from '../../../ambient-utils/dataLayer';
import { useTradeData } from '../../../App/hooks/useTradeData';
import Button from '../../../components/Form/Button';
import { useModal } from '../../../components/Global/Modal/useModal';
import ConfirmLimitModal from '../../../components/Trade/Limit/ConfirmLimitModal/ConfirmLimitModal';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitRate from '../../../components/Trade/Limit/LimitRate/LimitRate';
import LimitTokenInput from '../../../components/Trade/Limit/LimitTokenInput/LimitTokenInput';
import SubmitTransaction from '../../../components/Trade/TradeModules/SubmitTransaction/SubmitTransaction';
import TradeModuleHeader from '../../../components/Trade/TradeModules/TradeModuleHeader';
import { TradeModuleSkeleton } from '../../../components/Trade/TradeModules/TradeModuleSkeleton';
import {
    IS_LOCAL_ENV,
    NUM_GWEI_IN_ETH,
    ZERO_ADDRESS,
} from '../../../ambient-utils/constants';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
    parseErrorMessage,
} from '../../../utils/TransactionError';
import { limitTutorialSteps } from '../../../utils/tutorial/Limit';
import { useApprove } from '../../../App/functions/approve';
import { GraphDataContext } from '../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import {
    GAS_DROPS_ESTIMATE_LIMIT_FROM_DEX,
    GAS_DROPS_ESTIMATE_LIMIT_FROM_WALLET,
    GAS_DROPS_ESTIMATE_LIMIT_NATIVE,
    LIMIT_BUFFER_MULTIPLIER_MAINNET,
    LIMIT_BUFFER_MULTIPLIER_SCROLL,
    NUM_GWEI_IN_WEI,
} from '../../../ambient-utils/constants/';
import { ReceiptContext } from '../../../contexts/ReceiptContext';
import { getPositionHash } from '../../../ambient-utils/dataLayer/functions/getPositionHash';
import { UserDataContext } from '../../../contexts/UserDataContext';

export default function Limit() {
    const {
        crocEnv,
        chainData: { chainId, gridSize, poolIndex },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei, isActiveNetworkBlast, isActiveNetworkScroll } =
        useContext(ChainDataContext);
    const {
        pool,
        isPoolInitialized,
        isTradeDollarizationEnabled,
        usdPriceInverse,
        poolData,
    } = useContext(PoolContext);
    const { userAddress } = useContext(UserDataContext);
    const { tokens } = useContext(TokenContext);
    const {
        tokenAAllowance,
        baseToken: {
            balance: baseTokenBalance,
            dexBalance: baseTokenDexBalance,
        },
        quoteToken: {
            balance: quoteTokenBalance,
            dexBalance: quoteTokenDexBalance,
        },
    } = useContext(TradeTokenContext);
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        addPositionUpdate,
        removePendingTx,
        updateTransactionHash,
        pendingTransactions,
    } = useContext(ReceiptContext);
    const { mintSlippage, dexBalLimit, bypassConfirmLimit } = useContext(
        UserPreferenceContext,
    );
    const { basePrice, quotePrice } = poolData;

    const [isOpen, openModal, closeModal] = useModal();
    const {
        baseToken,
        quoteToken,
        tokenA,
        tokenB,
        isTokenAPrimary,
        isDenomBase,
        setLimitTick,
        limitTick,
        poolPriceNonDisplay,
        primaryQuantity,
        setPrimaryQuantity,
        isTokenABase,
    } = useContext(TradeDataContext);
    const { liquidityFee } = useContext(GraphDataContext);
    const { urlParamMap, updateURL } = useTradeData();

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
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [txErrorJSON, setTxErrorJSON] = useState('');
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [endDisplayPrice, setEndDisplayPrice] = useState<number>(0);
    const [startDisplayPrice, setStartDisplayPrice] = useState<number>(0);
    const [middleDisplayPrice, setMiddleDisplayPrice] = useState<number>(0);
    const [orderGasPriceInDollars, setOrderGasPriceInDollars] = useState<
        string | undefined
    >();
    const [displayPrice, setDisplayPrice] = useState('');
    const [previousDisplayPrice, setPreviousDisplayPrice] = useState('');
    const [isOrderValid, setIsOrderValid] = useState<boolean>(true);

    const [
        amountToReduceNativeTokenQtyMainnet,
        setAmountToReduceNativeTokenQtyMainnet,
    ] = useState<number>(0.001);

    const [amountToReduceNativeTokenQtyL2, setAmountToReduceNativeTokenQtyL2] =
        useState<number>(0.0003);

    const amountToReduceNativeTokenQty =
        chainId === '0x82750' || chainId === '0x8274f' || chainId === '0x13e31'
            ? amountToReduceNativeTokenQtyL2
            : amountToReduceNativeTokenQtyMainnet;

    const activeTxHash = useRef<string>('');

    // reset activeTxHash when the pair changes or user updates quantity
    useEffect(() => {
        activeTxHash.current = '';
    }, [tokenA.address + tokenB.address, primaryQuantity]);

    useEffect(() => {
        if (isTokenAPrimary) {
            setLimitButtonErrorMessage('...');
            setTokenBInputQty('');
        } else {
            setLimitButtonErrorMessage('...');
            setTokenAInputQty('');
        }
    }, [tokenA.address + tokenB.address]);

    // TODO: is possible we can convert this to use the TradeTokenContext
    // However, unsure if the fact that baseToken comes from pool affects this
    const isSellTokenBase = pool?.baseToken.tokenAddr === tokenA.address;

    const tokenABalance = isSellTokenBase
        ? baseTokenBalance
        : quoteTokenBalance;
    const tokenADexBalance = isSellTokenBase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;
    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - parseFloat(tokenAInputQty || '0');
    const isTokenADexSurplusSufficient =
        tokenASurplusMinusTokenARemainderNum >= 0;
    const tokenAQtyCoveredByWalletBalance = isWithdrawFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum < 0
            ? tokenASurplusMinusTokenARemainderNum * -1
            : 0
        : parseFloat(tokenAInputQty || '0');
    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= tokenAQtyCoveredByWalletBalance;

    const isTokenAWalletBalanceSufficient =
        parseFloat(tokenABalance) >= tokenAQtyCoveredByWalletBalance;

    // TODO: @Emily refactor this to take a token data object
    // values if either token needs to be confirmed before transacting
    const needConfirmTokenA = !tokens.verify(tokenA.address);
    const needConfirmTokenB = !tokens.verify(tokenB.address);
    // value showing if no acknowledgement is necessary
    const areBothAckd: boolean = !needConfirmTokenA && !needConfirmTokenB;

    const liquidityProviderFeeString = (liquidityFee * 100).toLocaleString(
        'en-US',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    // TODO: logic to determine start, middle, end display prices should be refactored into an ambient-utils function
    useEffect(() => {
        if (limitTick === undefined && poolPriceNonDisplay && crocEnv) {
            if (!pool) return;

            // if the spot price is 0, the pool is uninitialized and we can't calculate a limit price
            if (poolPriceNonDisplay === 0) return;

            const initialLimitRateNonDisplay =
                poolPriceNonDisplay * (isSellTokenBase ? 0.985 : 1.015);

            const pinnedTick: number = isSellTokenBase
                ? pinTickLower(initialLimitRateNonDisplay, gridSize)
                : pinTickUpper(initialLimitRateNonDisplay, gridSize);

            IS_LOCAL_ENV && console.debug({ pinnedTick });

            setLimitTick(pinnedTick);

            const tickPrice = tickToPrice(pinnedTick);
            const tickDispPrice = pool.toDisplayPrice(tickPrice);

            tickDispPrice.then((tp) => {
                const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;
                setEndDisplayPrice(displayPriceWithDenom);

                const dollarizedDisplayPrice = displayPriceWithDenom
                    ? isDenomBase
                        ? quotePrice
                            ? displayPriceWithDenom * quotePrice
                            : undefined
                        : basePrice
                        ? displayPriceWithDenom * basePrice
                        : undefined
                    : usdPriceInverse && displayPriceWithDenom
                    ? usdPriceInverse * displayPriceWithDenom
                    : undefined;

                const limitRateTruncated = isTradeDollarizationEnabled
                    ? getFormattedNumber({
                          value: dollarizedDisplayPrice,
                          removeCommas: true,
                          isInput: true,
                          prefix: '$',
                      })
                    : getFormattedNumber({
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
        } else if (limitTick !== undefined) {
            if (!pool) return;

            const tickPrice = tickToPrice(limitTick);

            const tickDispPrice = pool.toDisplayPrice(tickPrice);

            tickDispPrice.then((tp) => {
                const displayPriceWithDenom = isDenomBase ? tp : 1 / tp;

                setEndDisplayPrice(displayPriceWithDenom);

                const dollarizedDisplayPrice = displayPriceWithDenom
                    ? isDenomBase
                        ? quotePrice
                            ? displayPriceWithDenom * quotePrice
                            : undefined
                        : basePrice
                        ? displayPriceWithDenom * basePrice
                        : undefined
                    : usdPriceInverse && displayPriceWithDenom
                    ? usdPriceInverse * displayPriceWithDenom
                    : undefined;

                const limitRateTruncated = isTradeDollarizationEnabled
                    ? getFormattedNumber({
                          value: dollarizedDisplayPrice,
                          removeCommas: true,
                          isInput: true,
                          prefix: '$',
                      })
                    : getFormattedNumber({
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
                    if (isSellTokenBase) setMiddleDisplayPrice(priceHalfAbove);
                });
                priceFullTickAbove.then((priceFullTickAbove) => {
                    if (isSellTokenBase)
                        setStartDisplayPrice(priceFullTickAbove);
                });
                priceHalfBelow.then((priceHalfBelow) => {
                    if (!isSellTokenBase) setMiddleDisplayPrice(priceHalfBelow);
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
        }
    }, [
        !!crocEnv,
        pool,
        limitTick,
        isDenomBase,
        priceInputFieldBlurred,
        isSellTokenBase,
        poolPriceNonDisplay,
        isTradeDollarizationEnabled,
        usdPriceInverse,
        basePrice,
        quotePrice,
    ]);

    // patch limit tick into URL if it is missing, this value isn't available
    // ... on firstload so we need to update the URL once the SDK returns it
    useEffect(() => {
        // key for limit tick in the URL param map
        const LIMIT_TICK_KEY = 'limitTick';
        const urlHasLimitTick: boolean = urlParamMap.has(LIMIT_TICK_KEY);
        // if we have a limit tick and it's not present in the URL, trigger an update
        if (!urlHasLimitTick && limitTick !== undefined) {
            updateURL({ update: [[LIMIT_TICK_KEY, limitTick]] });
        }
    }, [limitTick]);

    const updateOrderValidityStatus = async () => {
        try {
            if (!crocEnv) return;
            if (limitTick === undefined) return;
            if (tokenAInputQty === '' && tokenBInputQty === '') return;

            const tknA: string = urlParamMap.get('tokenA') as string;
            const tknB: string = urlParamMap.get('tokenB') as string;
            const limitTickParam: string = urlParamMap.get(
                'limitTick',
            ) as string;
            if (limitTickParam && limitTickParam !== limitTick.toString())
                return;
            const testOrder = isTokenAPrimary
                ? crocEnv.sell(tknA, 0)
                : crocEnv.buy(tknB, 0);

            const ko = testOrder.atLimit(
                isTokenAPrimary ? tknB : tknA,
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
        limitTick,
        poolPriceNonDisplay,
        tokenAInputQty === '' && tokenBInputQty === '',
        urlParamMap,
    ]);

    useEffect(() => {
        setNewLimitOrderTransactionHash('');
    }, [baseToken.address + quoteToken.address]);

    const isSellTokenNativeToken = tokenA.address === ZERO_ADDRESS;

    useEffect(() => {
        handleLimitButtonMessage(parseFloat(tokenAInputQty));
    }, [
        isOrderValid,
        tokenAInputQty,
        isPoolInitialized,
        poolPriceNonDisplay,
        limitTick,
        isSellTokenBase,
        isSellTokenNativeToken,
        tokenAQtyCoveredByWalletBalance,
        tokenABalance,
        amountToReduceNativeTokenQty,
        pendingTransactions,
        activeTxHash,
    ]);

    useEffect(() => {
        setIsWithdrawFromDexChecked(parseFloat(tokenADexBalance) > 0);
    }, [tokenADexBalance]);

    const [l1GasFeeLimitInGwei] = useState<number>(
        isActiveNetworkScroll ? 700000 : isActiveNetworkBlast ? 300000 : 0,
    );
    const [extraL1GasFeeLimit] = useState(
        isActiveNetworkScroll ? 1.5 : isActiveNetworkBlast ? 0.5 : 0,
    );

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const averageLimitCostInGasDrops = isSellTokenNativeToken
                ? GAS_DROPS_ESTIMATE_LIMIT_NATIVE
                : isWithdrawFromDexChecked
                ? isTokenADexSurplusSufficient
                    ? GAS_DROPS_ESTIMATE_LIMIT_FROM_DEX
                    : GAS_DROPS_ESTIMATE_LIMIT_FROM_WALLET
                : GAS_DROPS_ESTIMATE_LIMIT_FROM_WALLET;

            const costOfMainnetLimitInETH =
                gasPriceInGwei * averageLimitCostInGasDrops * NUM_GWEI_IN_WEI;

            setAmountToReduceNativeTokenQtyMainnet(
                LIMIT_BUFFER_MULTIPLIER_MAINNET * costOfMainnetLimitInETH,
            );

            const l1CostOfScrollLimitInETH =
                l1GasFeeLimitInGwei / NUM_GWEI_IN_ETH;

            const l2CostOfScrollLimitInETH =
                gasPriceInGwei * averageLimitCostInGasDrops * NUM_GWEI_IN_WEI;

            const costOfScrollLimitInETH =
                l1CostOfScrollLimitInETH + l2CostOfScrollLimitInETH;

            setAmountToReduceNativeTokenQtyL2(
                LIMIT_BUFFER_MULTIPLIER_SCROLL * costOfScrollLimitInETH,
            );

            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageLimitCostInGasDrops *
                NUM_GWEI_IN_WEI *
                ethMainnetUsdPrice;

            setOrderGasPriceInDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum + extraL1GasFeeLimit,
                    isUSD: true,
                }),
            );
        }
    }, [
        gasPriceInGwei,
        ethMainnetUsdPrice,
        isSellTokenNativeToken,
        isWithdrawFromDexChecked,
        isTokenADexSurplusSufficient,
        l1GasFeeLimitInGwei,
        extraL1GasFeeLimit,
    ]);

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setTxErrorCode('');
        setTxErrorMessage('');
        setTxErrorJSON('');
        setNewLimitOrderTransactionHash('');
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

    const sendLimitOrder = async () => {
        if (!crocEnv) return;
        if (limitTick === undefined) return;
        resetConfirmation();
        setShowConfirmation(true);

        const sellToken = tokenA.address;
        const buyToken = tokenB.address;

        const sellQty = tokenAInputQty;
        const buyQty = tokenBInputQty;

        const qty = isTokenAPrimary ? sellQty : buyQty;
        const type = isTokenAPrimary ? 'sell' : 'buy';

        const posHash = getPositionHash(undefined, {
            isPositionTypeAmbient: false,
            user: userAddress ?? '',
            baseAddress: baseToken.address,
            quoteAddress: quoteToken.address,
            poolIdx: poolIndex,
            bidTick: isSellTokenBase ? limitTick : limitTick - gridSize,
            askTick: isSellTokenBase ? limitTick + gridSize : limitTick,
        });

        let tx;
        try {
            tx = await submitLimitOrder({
                crocEnv,
                qty,
                sellTokenAddress: sellToken,
                buyTokenAddress: buyToken,
                type,
                limit: limitTick,
                isWithdrawFromDexChecked,
            });

            if (!tx) return;

            activeTxHash.current = tx?.hash;

            addPendingTx(tx?.hash);
            setNewLimitOrderTransactionHash(tx.hash);
            addTransactionByType({
                userAddress: userAddress || '',
                txHash: tx.hash,
                txAction:
                    tokenB.address.toLowerCase() ===
                    quoteToken.address.toLowerCase()
                        ? 'Buy'
                        : 'Sell',
                txType: 'Limit',
                txDescription: `Add Limit ${tokenA.symbol}→${tokenB.symbol}`,
                txDetails: {
                    baseAddress: baseToken.address,
                    quoteAddress: quoteToken.address,
                    baseTokenDecimals: baseToken.decimals,
                    quoteTokenDecimals: quoteToken.decimals,
                    poolIdx: poolIndex,
                    baseSymbol: baseToken.symbol,
                    quoteSymbol: quoteToken.symbol,
                    lowTick: isSellTokenBase ? limitTick : limitTick - gridSize,
                    highTick: isSellTokenBase
                        ? limitTick + gridSize
                        : limitTick,
                    isBid: isSellTokenBase,
                },
            });

            addPositionUpdate({
                txHash: tx.hash,
                positionID: posHash,
                isLimit: true,
                unixTimeAdded: Math.floor(Date.now() / 1000),
            });
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(parseErrorMessage(error));
            setTxErrorJSON(JSON.stringify(error));
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
        }

        let receipt;
        try {
            if (tx) receipt = await getTxReceipt(tx);
        } catch (e) {
            const error = e as TransactionError;
            console.error({ error });
            // The user used 'speed up' or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                IS_LOCAL_ENV && console.debug('repriced');
                removePendingTx(error.hash);
                const newTransactionHash = error.replacement.hash;
                activeTxHash.current = newTransactionHash;
                addPendingTx(newTransactionHash);
                addPositionUpdate({
                    txHash: newTransactionHash,
                    positionID: posHash,
                    isLimit: true,
                    unixTimeAdded: Math.floor(Date.now() / 1000),
                });
                updateTransactionHash(error.hash, error.replacement.hash);
                setNewLimitOrderTransactionHash(newTransactionHash);
                IS_LOCAL_ENV && console.debug({ newTransactionHash });
                receipt = error.receipt;
            } else if (isTransactionFailedError(error)) {
                activeTxHash.current = '';
                receipt = error.receipt;
            }
        }

        if (receipt) {
            addReceipt(JSON.stringify(receipt));
            removePendingTx(receipt.transactionHash);
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
                    if (
                        pendingTransactions.some(
                            (tx) => tx === activeTxHash.current,
                        )
                    ) {
                        setTokenAInputQty('');
                        setTokenBInputQty('');
                        setPrimaryQuantity('');
                        activeTxHash.current = '';
                    }
                    setLimitAllowed(false);
                    setLimitButtonErrorMessage(
                        `${tokenA.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else if (
                    isSellTokenNativeToken &&
                    tokenAQtyCoveredByWalletBalance +
                        amountToReduceNativeTokenQty >
                        parseFloat(tokenABalance) + 0.0000000001 // offset to account for floating point math inconsistencies
                ) {
                    setLimitAllowed(false);
                    setLimitButtonErrorMessage(
                        `${
                            tokenA.address === ZERO_ADDRESS ? 'ETH ' : ''
                        } Wallet Balance Insufficient to Cover Gas`,
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
                } else if (
                    isSellTokenNativeToken &&
                    tokenAQtyCoveredByWalletBalance +
                        amountToReduceNativeTokenQty >
                        parseFloat(tokenABalance) + 0.0000000001 // offset to account for floating point math inconsistencies
                ) {
                    setLimitAllowed(false);
                    setLimitButtonErrorMessage(
                        `${
                            tokenA.address === ZERO_ADDRESS ? 'ETH ' : ''
                        } Wallet Balance Insufficient to Cover Gas`,
                    );
                } else {
                    setLimitAllowed(true);
                }
            }
        }
    };

    const handleModalOpen = () => {
        resetConfirmation();
        openModal();
    };

    const handleModalClose = (): void => {
        resetConfirmation();
        closeModal();
    };
    const { approve, isApprovalPending } = useApprove();

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
        needConfirmTokenA && tokens.acknowledge(tokenA);
        needConfirmTokenB && tokens.acknowledge(tokenB);
    };

    const usdValueTokenA = isTokenABase
        ? poolData.basePrice
        : poolData.quotePrice;
    const usdValueTokenB = isTokenABase
        ? poolData.quotePrice
        : poolData.basePrice;

    const percentDiffUsdValue =
        usdValueTokenA && usdValueTokenB
            ? ((usdValueTokenB * parseFloat(tokenBInputQty) -
                  usdValueTokenA * parseFloat(tokenAInputQty)) /
                  (usdValueTokenA * parseFloat(tokenAInputQty))) *
              100
            : 0;

    return (
        <TradeModuleSkeleton
            chainId={chainId}
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
                    amountToReduceNativeTokenQty={amountToReduceNativeTokenQty}
                    usdValueTokenA={usdValueTokenA}
                    usdValueTokenB={usdValueTokenB}
                    percentDiffUsdValue={percentDiffUsdValue}
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
                    updateURL={updateURL}
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
                isOpen ? (
                    <ConfirmLimitModal
                        onClose={handleModalClose}
                        initiateLimitOrderMethod={sendLimitOrder}
                        tokenAInputQty={tokenAInputQty}
                        tokenBInputQty={tokenBInputQty}
                        insideTickDisplayPrice={endDisplayPrice}
                        newLimitOrderTransactionHash={
                            newLimitOrderTransactionHash
                        }
                        txErrorCode={txErrorCode}
                        txErrorMessage={txErrorMessage}
                        txErrorJSON={txErrorJSON}
                        showConfirmation={showConfirmation}
                        resetConfirmation={resetConfirmation}
                        startDisplayPrice={startDisplayPrice}
                        middleDisplayPrice={middleDisplayPrice}
                        endDisplayPrice={endDisplayPrice}
                        limitAllowed={limitAllowed}
                        limitButtonErrorMessage={limitButtonErrorMessage}
                        percentDiffUsdValue={percentDiffUsdValue}
                    />
                ) : (
                    <></>
                )
            }
            button={
                <Button
                    idForDOM='confirm_limit_order_button'
                    style={{ textTransform: 'none' }}
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
                                ? sendLimitOrder
                                : handleModalOpen
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
                showConfirmation && bypassConfirmLimit.isEnabled ? (
                    <SubmitTransaction
                        type='Limit'
                        newTransactionHash={newLimitOrderTransactionHash}
                        txErrorCode={txErrorCode}
                        txErrorMessage={txErrorMessage}
                        txErrorJSON={txErrorJSON}
                        resetConfirmation={resetConfirmation}
                        sendTransaction={sendLimitOrder}
                        transactionPendingDisplayString={`Submitting Limit Order to Swap ${tokenAInputQty} ${tokenA.symbol} for ${tokenBInputQty} ${tokenB.symbol}`}
                    />
                ) : undefined
            }
            approveButton={
                isPoolInitialized &&
                !isTokenAAllowanceSufficient &&
                isTokenAWalletBalanceSufficient &&
                parseFloat(tokenAInputQty) > 0 ? (
                    <Button
                        idForDOM='approve_limit_order_button'
                        style={{ textTransform: 'none' }}
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
