import { CrocImpact, bigNumToFloat } from '@crocswap-libs/sdk';
import { useContext, useState, useEffect, memo, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    getFormattedNumber,
    getPriceImpactString,
    isStablePair,
    getTxReceipt,
    performSwap,
} from '../../../ambient-utils/dataLayer';
import Button from '../../../components/Form/Button';
import { useModal } from '../../../components/Global/Modal/useModal';
import TooltipComponent from '../../../components/Global/TooltipComponent/TooltipComponent';
import ConfirmSwapModal from '../../../components/Swap/ConfirmSwapModal/ConfirmSwapModal';
import SwapExtraInfo from '../../../components/Swap/SwapExtraInfo/SwapExtraInfo';
import SwapTokenInput from '../../../components/Swap/SwapTokenInput/SwapTokenInput';
import SubmitTransaction from '../../../components/Trade/TradeModules/SubmitTransaction/SubmitTransaction';
import TradeModuleHeader from '../../../components/Trade/TradeModules/TradeModuleHeader';
import { TradeModuleSkeleton } from '../../../components/Trade/TradeModules/TradeModuleSkeleton';
import {
    IS_LOCAL_ENV,
    NUM_GWEI_IN_ETH,
    NUM_WEI_IN_GWEI,
    ZERO_ADDRESS,
} from '../../../ambient-utils/constants';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { FlexContainer } from '../../../styled/Common';
import { WarningContainer } from '../../../styled/Components/TradeModules';

import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
    parseErrorMessage,
} from '../../../utils/TransactionError';
import { swapTutorialSteps } from '../../../utils/tutorial/Swap';
import { useApprove } from '../../../App/functions/approve';
import { useUrlParams } from '../../../utils/hooks/useUrlParams';
import { GraphDataContext } from '../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import {
    GAS_DROPS_ESTIMATE_SWAP_FROM_DEX,
    GAS_DROPS_ESTIMATE_SWAP_FROM_WALLET_TO_DEX,
    GAS_DROPS_ESTIMATE_SWAP_FROM_WALLET_TO_WALLET,
    GAS_DROPS_ESTIMATE_SWAP_NATIVE,
    GAS_DROPS_ESTIMATE_SWAP_TO_FROM_DEX,
    NUM_GWEI_IN_WEI,
    SWAP_BUFFER_MULTIPLIER_MAINNET,
    SWAP_BUFFER_MULTIPLIER_SCROLL,
} from '../../../ambient-utils/constants/';
import { ReceiptContext } from '../../../contexts/ReceiptContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { calcL1Gas } from '../../../App/functions/calcL1Gas';
import { BigNumber } from 'ethers';

interface propsIF {
    isOnTradeRoute?: boolean;
}

function Swap(props: propsIF) {
    const { isOnTradeRoute } = props;
    const {
        crocEnv,
        chainData: { chainId, poolIndex },
        ethMainnetUsdPrice,
        provider,
    } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);
    const { gasPriceInGwei, isActiveNetworkBlast, isActiveNetworkScroll } =
        useContext(ChainDataContext);
    const { isPoolInitialized, poolData } = useContext(PoolContext);
    const { tokens } = useContext(TokenContext);

    const {
        tokenAAllowance,
        tokenABalance,
        tokenADexBalance,
        isTokenABase: isSellTokenBase,
    } = useContext(TradeTokenContext);
    const { swapSlippage, dexBalSwap, bypassConfirmSwap } = useContext(
        UserPreferenceContext,
    );
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
        pendingTransactions,
    } = useContext(ReceiptContext);

    // get URL pathway for user relative to index
    const { pathname } = useLocation();
    !pathname.includes('/trade') && useUrlParams(tokens, chainId, provider);
    const [isModalOpen, openModal, closeModal] = useModal();
    // use URL pathway to determine if user is in swap or market page
    // depending on location we pull data on the tx in progress differently
    // TODO: confirm this doesn't break data that needs to be different when on trade page
    const { liquidityFee } = useContext(GraphDataContext);
    const {
        tokenA,
        tokenB,
        baseToken,
        quoteToken,
        isTokenAPrimary,
        isDenomBase,
        primaryQuantity,
        setPrimaryQuantity,
        areDefaultTokensUpdatedForChain,
        isTokenABase,
    } = useContext(TradeDataContext);

    const [sellQtyString, setSellQtyString] = useState<string>(
        isTokenAPrimary ? primaryQuantity : '',
    );
    const [buyQtyString, setBuyQtyString] = useState<string>(
        !isTokenAPrimary ? primaryQuantity : '',
    );
    const [isSellLoading, setIsSellLoading] = useState(false);
    const [isBuyLoading, setIsBuyLoading] = useState(false);
    const [swapAllowed, setSwapAllowed] = useState<boolean>(
        primaryQuantity !== '',
    );

    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [isLiquidityInsufficient, setIsLiquidityInsufficient] =
        useState<boolean>(false);
    // hooks to track whether user will use dex or wallet funds in transaction, this is
    // ... abstracted away from the central hook because the hook manages preference
    // ... and does not consider whether dex balance is sufficient
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] =
        useState<boolean>(false);
    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] =
        useState<boolean>(
            isActiveNetworkBlast ? false : dexBalSwap.outputToDexBal.isEnabled,
        );

    const [newSwapTransactionHash, setNewSwapTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [txErrorJSON, setTxErrorJSON] = useState('');
    const [swapButtonErrorMessage, setSwapButtonErrorMessage] =
        useState<string>('');

    const [lastImpactQuery, setLastImpactQuery] = useState<
        | {
              input: string;
              isInputSell: boolean;
              impact: CrocImpact | undefined;
          }
        | undefined
    >();

    const priceImpact = useMemo(() => {
        return lastImpactQuery ? lastImpactQuery.impact : undefined;
    }, [lastImpactQuery]);

    useEffect(() => {
        if (primaryQuantity === '') {
            setLastImpactQuery(undefined);
        }
    }, [primaryQuantity]);
    const [swapGasPriceinDollars, setSwapGasPriceinDollars] = useState<
        string | undefined
    >();

    const slippageTolerancePercentage = isStablePair(
        tokenA.address,
        tokenB.address,
    )
        ? swapSlippage.stable
        : swapSlippage.volatile;

    const effectivePrice =
        parseFloat(priceImpact?.buyQty || '0') /
        parseFloat(priceImpact?.sellQty || '1');
    const isPriceInverted =
        (isDenomBase && !isSellTokenBase) || (!isDenomBase && isSellTokenBase);
    const effectivePriceWithDenom = effectivePrice
        ? isPriceInverted
            ? 1 / effectivePrice
            : effectivePrice
        : undefined;
    const priceImpactNum = !priceImpact?.percentChange
        ? undefined
        : Math.abs(priceImpact.percentChange) * 100;

    const [priceImpactNumMemo, setPriceImpactNumMemo] = useState<
        number | undefined
    >();

    useEffect(() => {
        setPriceImpactNumMemo(priceImpactNum);
    }, [priceImpactNum]);

    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - parseFloat(sellQtyString || '0');
    const isTokenADexSurplusSufficient =
        tokenASurplusMinusTokenARemainderNum >= 0;
    const tokenAQtyCoveredByWalletBalance = isWithdrawFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum < 0
            ? tokenASurplusMinusTokenARemainderNum * -1
            : 0
        : parseFloat(sellQtyString || '0');

    const isTokenAWalletBalanceSufficient =
        parseFloat(tokenABalance) >= tokenAQtyCoveredByWalletBalance;

    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= tokenAQtyCoveredByWalletBalance;

    // values if either token needs to be confirmed before transacting
    const needConfirmTokenA = !tokens.verify(tokenA.address);
    const needConfirmTokenB = !tokens.verify(tokenB.address);
    // value showing if no acknowledgement is necessary
    const areBothAckd: boolean =
        areDefaultTokensUpdatedForChain &&
        !needConfirmTokenA &&
        !needConfirmTokenB;

    const liquidityProviderFeeString = (liquidityFee * 100).toLocaleString(
        'en-US',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    const isSellTokenNativeToken = tokenA.address === ZERO_ADDRESS;

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

    const activeTxHashInPendingTxs = pendingTransactions.some(
        (tx) => tx === activeTxHash.current,
    );

    // reset activeTxHash when the pair changes or user updates quantity
    useEffect(() => {
        activeTxHash.current = '';
    }, [tokenA.address + tokenB.address, primaryQuantity]);

    useEffect(() => {
        if (isTokenAPrimary && isSellLoading) {
            setIsSellLoading(false);
        } else if (!isTokenAPrimary && isBuyLoading) {
            setIsBuyLoading(false);
        }
    }, [isTokenAPrimary]);

    useEffect(() => {
        if (
            (sellQtyString === '' && buyQtyString === '') ||
            (isTokenAPrimary &&
                !isBuyLoading &&
                (isNaN(parseFloat(sellQtyString)) ||
                    parseFloat(sellQtyString) <= 0)) ||
            (!isTokenAPrimary &&
                !isSellLoading &&
                (isNaN(parseFloat(buyQtyString)) ||
                    parseFloat(buyQtyString) <= 0))
        ) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Enter an Amount');
            if (
                isBuyLoading &&
                (sellQtyString === '' || parseFloat(sellQtyString) <= 0)
            ) {
                setIsBuyLoading(false);
                setLastImpactQuery(undefined);
            } else if (
                isSellLoading &&
                (buyQtyString === '' || parseFloat(buyQtyString) <= 0)
            ) {
                setIsSellLoading(false);
                setLastImpactQuery(undefined);
            }
        } else if (isSellLoading || isBuyLoading) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('...');
        } else if (isPoolInitialized === false) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Pool Not Initialized');
        } else if (isLiquidityInsufficient) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Liquidity Insufficient');
        } else {
            const hurdle = isWithdrawFromDexChecked
                ? parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                : parseFloat(tokenABalance);
            const balanceLabel = isWithdrawFromDexChecked
                ? 'Combined Wallet and Exchange'
                : 'Wallet';

            setSwapAllowed(parseFloat(sellQtyString) <= hurdle);

            if (parseFloat(sellQtyString) > hurdle) {
                if (activeTxHashInPendingTxs) {
                    setSellQtyString('');
                    setBuyQtyString('');
                    setPrimaryQuantity('');
                    activeTxHash.current = '';
                    setSwapButtonErrorMessage('');
                } else {
                    setSwapButtonErrorMessage(
                        `${tokenA.symbol} Amount Exceeds ${balanceLabel} Balance`,
                    );
                    setSwapAllowed(false);
                }
            } else if (
                isSellTokenNativeToken &&
                tokenAQtyCoveredByWalletBalance + amountToReduceNativeTokenQty >
                    parseFloat(tokenABalance) + 0.0000000001 // offset to account for floating point math inconsistencies
            ) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage(
                    `${
                        tokenA.address === ZERO_ADDRESS ? 'ETH ' : ''
                    } Wallet Balance Insufficient to Cover Gas`,
                );
            } else {
                setSwapAllowed(true);
            }
        }
    }, [
        crocEnv,
        isPoolInitialized,
        isPoolInitialized === undefined, // Needed to distinguish false from undefined
        tokenA.address,
        tokenB.address,
        buyQtyString,
        sellQtyString,
        isWithdrawFromDexChecked,
        isBuyLoading,
        isSellLoading,
        isSellTokenNativeToken,
        tokenABalance,
        tokenAQtyCoveredByWalletBalance,
        amountToReduceNativeTokenQty,
        activeTxHashInPendingTxs,
        isTokenAPrimary,
    ]);

    useEffect(() => {
        if (isTokenAPrimary) {
            setIsBuyLoading(true);
            setSwapButtonErrorMessage('...');
            setBuyQtyString('');
        } else {
            setIsSellLoading(true);
            setSwapButtonErrorMessage('...');
            setSellQtyString('');
        }
    }, [tokenA.address + tokenB.address, isTokenAPrimary]);

    useEffect(() => {
        setNewSwapTransactionHash('');
    }, [baseToken.address + quoteToken.address]);

    const [l1GasFeeSwapInGwei, setL1GasFeeSwapInGwei] = useState<number>(
        isActiveNetworkScroll ? 700000 : isActiveNetworkBlast ? 300000 : 0,
    );
    const [extraL1GasFeeSwap, setExtraL1GasFeeSwap] = useState(
        isActiveNetworkScroll ? 1 : isActiveNetworkBlast ? 0.3 : 0,
    );

    // calculate price of gas for swap
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const averageSwapCostInGasDrops = isSellTokenNativeToken
                ? GAS_DROPS_ESTIMATE_SWAP_NATIVE
                : isWithdrawFromDexChecked
                ? isTokenADexSurplusSufficient
                    ? isSaveAsDexSurplusChecked
                        ? GAS_DROPS_ESTIMATE_SWAP_TO_FROM_DEX
                        : GAS_DROPS_ESTIMATE_SWAP_FROM_DEX
                    : isSaveAsDexSurplusChecked
                    ? GAS_DROPS_ESTIMATE_SWAP_FROM_WALLET_TO_DEX
                    : GAS_DROPS_ESTIMATE_SWAP_FROM_WALLET_TO_WALLET
                : isSaveAsDexSurplusChecked
                ? GAS_DROPS_ESTIMATE_SWAP_FROM_WALLET_TO_DEX
                : GAS_DROPS_ESTIMATE_SWAP_FROM_WALLET_TO_WALLET;

            const costOfMainnetSwapInETH =
                gasPriceInGwei * averageSwapCostInGasDrops * NUM_GWEI_IN_WEI;

            setAmountToReduceNativeTokenQtyMainnet(
                SWAP_BUFFER_MULTIPLIER_MAINNET * costOfMainnetSwapInETH,
            );
            const l1costOfScrollSwapInETH =
                l1GasFeeSwapInGwei / NUM_GWEI_IN_ETH;

            const l2costOfScrollSwapInETH =
                gasPriceInGwei * averageSwapCostInGasDrops * NUM_GWEI_IN_WEI;
            const costOfScrollSwapInETH =
                l1costOfScrollSwapInETH + l2costOfScrollSwapInETH;

            setAmountToReduceNativeTokenQtyL2(
                SWAP_BUFFER_MULTIPLIER_SCROLL * costOfScrollSwapInETH,
            );

            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageSwapCostInGasDrops *
                NUM_GWEI_IN_WEI *
                ethMainnetUsdPrice;

            setSwapGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum + extraL1GasFeeSwap,
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
        isSaveAsDexSurplusChecked,
        extraL1GasFeeSwap,
        l1GasFeeSwapInGwei,
    ]);

    useEffect(() => {
        (async () => {
            if (!crocEnv) return;

            const qty = isTokenAPrimary
                ? sellQtyString.replaceAll(',', '')
                : buyQtyString.replaceAll(',', '');

            if (qty === '' || parseFloat(qty) === 0) return;
            const l1Gas = userAddress
                ? await calcL1Gas({
                      crocEnv,
                      isQtySell: isTokenAPrimary,
                      qty,
                      buyTokenAddress: tokenB.address,
                      sellTokenAddress: tokenA.address,
                      slippageTolerancePercentage,
                      isWithdrawFromDexChecked,
                      isSaveAsDexSurplusChecked,
                  })
                : undefined;

            const costOfEthInCents = BigNumber.from(
                Math.floor((ethMainnetUsdPrice || 0) * 100),
            );
            const l1GasInGwei =
                l1Gas && l1Gas.toNumber() !== 0
                    ? l1Gas.div(NUM_WEI_IN_GWEI)
                    : undefined;
            l1GasInGwei &&
                setL1GasFeeSwapInGwei(bigNumToFloat(l1GasInGwei) || 0);
            const l1GasCents = l1GasInGwei
                ? l1GasInGwei.mul(costOfEthInCents).div(NUM_GWEI_IN_ETH)
                : undefined;

            const l1GasDollarsNum = l1GasCents
                ? bigNumToFloat(l1GasCents) / 100
                : undefined;
            if (l1GasDollarsNum) setExtraL1GasFeeSwap(l1GasDollarsNum);
        })();
    }, [
        crocEnv,
        isTokenAPrimary,
        sellQtyString,
        buyQtyString,
        tokenA.address,
        tokenB.address,
        slippageTolerancePercentage,
        isWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        ethMainnetUsdPrice,
    ]);

    useEffect(() => {
        setIsWithdrawFromDexChecked(parseFloat(tokenADexBalance) > 0);
    }, [tokenADexBalance]);

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setTxErrorCode('');
        setTxErrorMessage('');
        setTxErrorJSON('');
        setNewSwapTransactionHash('');
    };

    async function initiateSwap() {
        resetConfirmation();

        setShowConfirmation(true);
        if (!crocEnv) return;

        const qty = isTokenAPrimary ? sellQtyString : buyQtyString;
        const isQtySell = isTokenAPrimary;

        let tx;
        try {
            const sellTokenAddress = tokenA.address;
            const buyTokenAddress = tokenB.address;

            tx = await performSwap({
                crocEnv,
                isQtySell,
                qty,
                buyTokenAddress,
                sellTokenAddress,
                slippageTolerancePercentage,
                isWithdrawFromDexChecked,
                isSaveAsDexSurplusChecked,
            });
            activeTxHash.current = tx?.hash;
            setNewSwapTransactionHash(tx?.hash);
            addPendingTx(tx?.hash);

            if (tx.hash) {
                addTransactionByType({
                    userAddress: userAddress || '',
                    txHash: tx.hash,
                    txAction:
                        buyTokenAddress.toLowerCase() ===
                        quoteToken.address.toLowerCase()
                            ? 'Buy'
                            : 'Sell',
                    txType: 'Market',
                    txDescription: `Swap ${tokenA.symbol}→${tokenB.symbol}`,
                    txDetails: {
                        baseAddress: baseToken.address,
                        quoteAddress: quoteToken.address,
                        poolIdx: poolIndex,
                        baseSymbol: baseToken.symbol,
                        quoteSymbol: quoteToken.symbol,
                        isBid: isSellTokenBase,
                    },
                });
            }
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(parseErrorMessage(error));
            setTxErrorJSON(JSON.stringify(error));
        }

        if (tx) {
            let receipt;
            try {
                receipt = await getTxReceipt(tx);
            } catch (e) {
                const error = e as TransactionError;
                console.error({ error });
                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    IS_LOCAL_ENV && console.debug('repriced');
                    removePendingTx(error.hash);

                    const newTransactionHash = error.replacement.hash;
                    activeTxHash.current = newTransactionHash;
                    addPendingTx(newTransactionHash);
                    updateTransactionHash(error.hash, error.replacement.hash);
                    setNewSwapTransactionHash(newTransactionHash);

                    IS_LOCAL_ENV && console.debug({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    receipt = error.receipt;
                    activeTxHash.current = '';
                }
            }

            if (receipt) {
                addReceipt(JSON.stringify(receipt));
                removePendingTx(receipt.transactionHash);
            }
        }
    }

    const handleModalOpen = () => {
        resetConfirmation();
        openModal();
    };

    const handleModalClose = () => {
        resetConfirmation();
        closeModal();
    };

    const { approve, isApprovalPending } = useApprove();

    const toggleDexSelection = (tokenAorB: 'A' | 'B') => {
        if (tokenAorB === 'A') {
            setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked);
        } else {
            if (isSaveAsDexSurplusChecked) dexBalSwap.outputToDexBal.disable();
            else dexBalSwap.outputToDexBal.enable();
            setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked);
        }
    };

    useEffect(() => {
        if (dexBalSwap.outputToDexBal.isEnabled) {
            setIsSaveAsDexSurplusChecked(true);
        } else {
            setIsSaveAsDexSurplusChecked(false);
        }
    }, [dexBalSwap.outputToDexBal.isEnabled]);

    // logic to acknowledge one or both tokens as necessary
    const ackAsNeeded = (): void => {
        needConfirmTokenA && tokens.acknowledge(tokenA);
        needConfirmTokenB && tokens.acknowledge(tokenB);
    };

    const liquidityInsufficientWarning = isLiquidityInsufficient ? (
        <WarningContainer
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            fontSize='body'
            color='other-red'
            padding='4px 8px'
        >
            <div>Pool Liquidity is Insufficient for this Swap</div>
            <TooltipComponent
                title='Current Pool Liquidity is Insufficient for this Swap'
                placement='bottom'
            />
        </WarningContainer>
    ) : undefined;

    const isButtonDisabled =
        (!swapAllowed || sellQtyString === '' || buyQtyString === '') &&
        areBothAckd;

    const priceImpactWarning =
        !isLiquidityInsufficient &&
        priceImpactNumMemo &&
        priceImpactNumMemo > 2 &&
        !(isButtonDisabled && swapButtonErrorMessage === 'Enter an Amount') ? (
            <WarningContainer
                flexDirection='row'
                justifyContent='space-between'
                alignItems='center'
                fontSize='body'
                color='other-red'
                padding='4px 8px'
            >
                <FlexContainer
                    flexDirection='row'
                    gap={4}
                    alignItems='center'
                    style={{ minWidth: '70px' }}
                    padding='0 4px 0 0'
                >
                    <div>Price Impact Warning</div>
                    <TooltipComponent
                        title='Difference Between Current (Spot) Price and Final Price'
                        placement='bottom'
                    />
                </FlexContainer>
                <div>{getPriceImpactString(priceImpactNumMemo)}%</div>
            </WarningContainer>
        ) : undefined;
    const showWarning =
        (priceImpactNumMemo || 0) > 10 &&
        isTokenAWalletBalanceSufficient &&
        !isLiquidityInsufficient &&
        !(isButtonDisabled && swapButtonErrorMessage === 'Enter an Amount');

    const usdValueTokenA = isTokenABase
        ? poolData.basePrice
        : poolData.quotePrice;
    const usdValueTokenB = isTokenABase
        ? poolData.quotePrice
        : poolData.basePrice;

    const percentDiffUsdValue =
        usdValueTokenA && usdValueTokenB
            ? ((usdValueTokenB * parseFloat(buyQtyString) -
                  usdValueTokenA * parseFloat(sellQtyString)) /
                  (usdValueTokenA * parseFloat(sellQtyString))) *
              100
            : 0;

    const buttonTitle = areBothAckd
        ? bypassConfirmSwap.isEnabled
            ? swapAllowed
                ? showWarning
                    ? 'I understand the price impact of this swap. Submit anyway!'
                    : 'Submit Swap'
                : swapButtonErrorMessage
            : swapAllowed
            ? showWarning
                ? 'I understand the price impact of this swap. Confirm anyway!'
                : 'Confirm'
            : swapButtonErrorMessage
        : 'Acknowledge';

    return (
        <TradeModuleSkeleton
            chainId={chainId}
            isSwapPage={!isOnTradeRoute}
            header={
                <TradeModuleHeader
                    slippage={swapSlippage}
                    dexBalSwap={dexBalSwap}
                    bypassConfirm={bypassConfirmSwap}
                    settingsTitle='Swap'
                    isSwapPage={!isOnTradeRoute}
                />
            }
            input={
                <SwapTokenInput
                    isLiquidityInsufficient={isLiquidityInsufficient}
                    setIsLiquidityInsufficient={setIsLiquidityInsufficient}
                    slippageTolerancePercentage={slippageTolerancePercentage}
                    setLastImpactQuery={setLastImpactQuery}
                    sellQtyString={{
                        value: sellQtyString,
                        set: setSellQtyString,
                    }}
                    buyQtyString={{
                        value: buyQtyString,
                        set: setBuyQtyString,
                    }}
                    isSellLoading={{
                        value: isSellLoading,
                        set: setIsSellLoading,
                    }}
                    isBuyLoading={{
                        value: isBuyLoading,
                        set: setIsBuyLoading,
                    }}
                    isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                    isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                    setSwapAllowed={setSwapAllowed}
                    toggleDexSelection={toggleDexSelection}
                    amountToReduceNativeTokenQty={amountToReduceNativeTokenQty}
                    usdValueTokenA={usdValueTokenA}
                    usdValueTokenB={usdValueTokenB}
                    percentDiffUsdValue={percentDiffUsdValue}
                />
            }
            transactionDetails={
                <SwapExtraInfo
                    priceImpact={priceImpact}
                    effectivePriceWithDenom={effectivePriceWithDenom}
                    slippageTolerance={slippageTolerancePercentage}
                    liquidityProviderFeeString={liquidityProviderFeeString}
                    swapGasPriceinDollars={swapGasPriceinDollars}
                    showExtraInfoDropdown={
                        primaryQuantity !== '' &&
                        parseFloat(primaryQuantity) > 0
                    }
                    showWarning={showWarning}
                />
            }
            modal={
                isModalOpen ? (
                    <ConfirmSwapModal
                        onClose={handleModalClose}
                        tokenPair={{
                            dataTokenA: tokenA,
                            dataTokenB: tokenB,
                        }}
                        isDenomBase={isDenomBase}
                        baseTokenSymbol={baseToken.symbol}
                        quoteTokenSymbol={quoteToken.symbol}
                        initiateSwapMethod={initiateSwap}
                        newSwapTransactionHash={newSwapTransactionHash}
                        txErrorCode={txErrorCode}
                        txErrorMessage={txErrorMessage}
                        txErrorJSON={txErrorJSON}
                        showConfirmation={showConfirmation}
                        resetConfirmation={resetConfirmation}
                        slippageTolerancePercentage={
                            slippageTolerancePercentage
                        }
                        effectivePrice={effectivePrice}
                        isSellTokenBase={isSellTokenBase}
                        sellQtyString={sellQtyString}
                        buyQtyString={buyQtyString}
                        isTokenAPrimary={isTokenAPrimary}
                        priceImpactWarning={priceImpactWarning}
                        isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                        percentDiffUsdValue={percentDiffUsdValue}
                    />
                ) : (
                    <></>
                )
            }
            button={
                <Button
                    idForDOM='confirm_swap_button'
                    style={{ textTransform: 'none' }}
                    title={buttonTitle}
                    action={
                        areBothAckd
                            ? bypassConfirmSwap.isEnabled
                                ? initiateSwap
                                : handleModalOpen
                            : ackAsNeeded
                    }
                    disabled={isButtonDisabled}
                    warning={showWarning}
                    flat
                />
            }
            bypassConfirm={
                showConfirmation && bypassConfirmSwap.isEnabled ? (
                    <SubmitTransaction
                        type='Swap'
                        newTransactionHash={newSwapTransactionHash}
                        txErrorCode={txErrorCode}
                        txErrorMessage={txErrorMessage}
                        txErrorJSON={txErrorJSON}
                        resetConfirmation={resetConfirmation}
                        sendTransaction={initiateSwap}
                        transactionPendingDisplayString={`Swapping ${sellQtyString} ${tokenA.symbol} for ${buyQtyString} ${tokenB.symbol}`}
                    />
                ) : undefined
            }
            approveButton={
                isPoolInitialized &&
                isTokenAWalletBalanceSufficient &&
                !isTokenAAllowanceSufficient &&
                parseFloat(sellQtyString) > 0 &&
                sellQtyString !== 'Infinity' ? (
                    <Button
                        idForDOM='approve_token_a_for_swap_module'
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
                        flat
                    />
                ) : undefined
            }
            warnings={
                priceImpactWarning || liquidityInsufficientWarning ? (
                    <>
                        {priceImpactWarning &&
                            sellQtyString !== '' &&
                            priceImpactWarning}
                        {liquidityInsufficientWarning &&
                            liquidityInsufficientWarning}
                    </>
                ) : undefined
            }
            tutorialSteps={swapTutorialSteps}
        />
    );
}

export default memo(Swap);
