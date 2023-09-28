import { CrocImpact } from '@crocswap-libs/sdk';
import { useContext, useState, useEffect, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useProvider } from 'wagmi';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import { getPriceImpactString } from '../../../App/functions/swap/getPriceImpactString';
import { useTradeData } from '../../../App/hooks/useTradeData';
import Button from '../../../components/Form/Button';
import { useModal } from '../../../components/Global/Modal/useModal';
import TooltipComponent from '../../../components/Global/TooltipComponent/TooltipComponent';
import ConfirmSwapModal from '../../../components/Swap/ConfirmSwapModal/ConfirmSwapModal';
import SwapExtraInfo from '../../../components/Swap/SwapExtraInfo/SwapExtraInfo';
import SwapTokenInput from '../../../components/Swap/SwapTokenInput/SwapTokenInput';
import SubmitTransaction from '../../../components/Trade/TradeModules/SubmitTransaction/SubmitTransaction';
import TradeModuleHeader from '../../../components/Trade/TradeModules/TradeModuleHeader';
import { TradeModuleSkeleton } from '../../../components/Trade/TradeModules/TradeModuleSkeleton';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../constants';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { FlexContainer } from '../../../styled/Common';
import { WarningContainer } from '../../../styled/Components/TradeModules';
import { isStablePair } from '../../../utils/data/stablePairs';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { useUrlParams } from '../../../utils/hooks/useUrlParams';
import {
    addPendingTx,
    addTransactionByType,
    removePendingTx,
    addReceipt,
    updateTransactionHash,
} from '../../../utils/state/receiptDataSlice';
import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
} from '../../../utils/TransactionError';
import { swapTutorialSteps } from '../../../utils/tutorial/Swap';
import { useApprove } from '../../../App/functions/approve';

interface propsIF {
    isOnTradeRoute?: boolean;
}

function Swap(props: propsIF) {
    const { isOnTradeRoute } = props;
    const {
        crocEnv,
        chainData: { chainId, poolIndex },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { poolPriceDisplay, isPoolInitialized } = useContext(PoolContext);
    const { tokens } = useContext(TokenContext);
    const {
        isTokenABase: isSellTokenBase,
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
    const { swapSlippage, dexBalSwap, bypassConfirmSwap } = useContext(
        UserPreferenceContext,
    );

    const dispatch = useAppDispatch();
    const provider = useProvider();
    // get URL pathway for user relative to index
    const { pathname } = useLocation();
    const [isModalOpen, openModal, closeModal] = useModal();
    // use URL pathway to determine if user is in swap or market page
    // depending on location we pull data on the tx in progress differently
    const {
        tradeData: {
            tokenA,
            tokenB,
            baseToken,
            quoteToken,
            isTokenAPrimary,
            primaryQuantity,
            isDenomBase,
            liquidityFee,
        },
    } = pathname.includes('/trade')
        ? useTradeData()
        : useAppSelector((state) => state);
    useUrlParams(['chain', 'tokenA', 'tokenB'], tokens, chainId, provider);

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
        useState<boolean>(dexBalSwap.outputToDexBal.isEnabled);

    const [newSwapTransactionHash, setNewSwapTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [swapButtonErrorMessage, setSwapButtonErrorMessage] =
        useState<string>('');

    const [priceImpact, setPriceImpact] = useState<CrocImpact | undefined>();
    const [swapGasPriceinDollars, setSwapGasPriceinDollars] = useState<
        string | undefined
    >();

    const tokenABalance = isSellTokenBase
        ? baseTokenBalance
        : quoteTokenBalance;
    const tokenADexBalance = isSellTokenBase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;

    const slippageTolerancePercentage = isStablePair(
        tokenA.address,
        tokenB.address,
        chainId,
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
    const areBothAckd: boolean = !needConfirmTokenA && !needConfirmTokenB;

    const liquidityProviderFeeString = (liquidityFee * 100).toLocaleString(
        'en-US',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    useEffect(() => {
        if (isSellLoading || isBuyLoading) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('...');
        } else if (isPoolInitialized === false) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Pool Not Initialized');
        } else if (isNaN(parseFloat(sellQtyString))) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Enter an Amount');
        } else if (isLiquidityInsufficient) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Liquidity Insufficient');
        } else if (parseFloat(sellQtyString) <= 0) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Enter an Amount');
        } else {
            const hurdle = isWithdrawFromDexChecked
                ? parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                : parseFloat(tokenABalance);
            const balanceLabel = isWithdrawFromDexChecked
                ? 'Combined Wallet and Exchange'
                : 'Wallet';

            setSwapAllowed(parseFloat(sellQtyString) <= hurdle);

            if (parseFloat(sellQtyString) > hurdle) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage(
                    `${tokenA.symbol} Amount Exceeds ${balanceLabel} Balance`,
                );
            } else {
                setSwapAllowed(true);
            }
        }
    }, [
        crocEnv,
        isPoolInitialized,
        isPoolInitialized === undefined, // Needed to distinguish false from undefined
        poolPriceDisplay,
        tokenA.address,
        tokenB.address,
        slippageTolerancePercentage,
        isTokenAPrimary,
        sellQtyString,
        buyQtyString,
        isWithdrawFromDexChecked,
        isBuyLoading,
        isSellLoading,
    ]);

    useEffect(() => {
        setNewSwapTransactionHash('');
    }, [baseToken.address + quoteToken.address]);

    const isSellTokenNativeToken = tokenA.address === ZERO_ADDRESS;

    // calculate price of gas for swap
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const averageSwapCostInGasDrops = isSellTokenNativeToken
                ? 100000
                : isWithdrawFromDexChecked
                ? isTokenADexSurplusSufficient
                    ? isSaveAsDexSurplusChecked
                        ? 92000
                        : 97000
                    : isSaveAsDexSurplusChecked
                    ? 105000
                    : 110000
                : isSaveAsDexSurplusChecked
                ? 105000
                : 110000;

            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageSwapCostInGasDrops *
                1e-9 *
                ethMainnetUsdPrice;

            setSwapGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
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
    ]);

    useEffect(() => {
        setIsWithdrawFromDexChecked(parseFloat(tokenADexBalance) > 0);
    }, [tokenADexBalance]);

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setTxErrorCode('');
        setNewSwapTransactionHash('');
    };

    async function initiateSwap() {
        resetConfirmation();

        setShowConfirmation(true);
        if (!crocEnv) return;

        const sellTokenAddress = tokenA.address;
        const buyTokenAddress = tokenB.address;

        const qty = isTokenAPrimary
            ? sellQtyString.replaceAll(',', '')
            : buyQtyString.replaceAll(',', '');

        const isQtySell = isTokenAPrimary;

        let tx;
        try {
            const plan = isQtySell
                ? crocEnv.sell(sellTokenAddress, qty).for(buyTokenAddress, {
                      slippage: slippageTolerancePercentage / 100,
                  })
                : crocEnv.buy(buyTokenAddress, qty).with(sellTokenAddress, {
                      slippage: slippageTolerancePercentage / 100,
                  });
            tx = await plan.swap({
                surplus: [isWithdrawFromDexChecked, isSaveAsDexSurplusChecked],
            });

            setNewSwapTransactionHash(tx?.hash);
            dispatch(addPendingTx(tx?.hash));
            if (tx.hash)
                dispatch(
                    addTransactionByType({
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
                    }),
                );
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error?.code);
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

                dispatch(
                    updateTransactionHash({
                        oldHash: error.hash,
                        newHash: error.replacement.hash,
                    }),
                );
                setNewSwapTransactionHash(newTransactionHash);
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
            <div>Current Pool Liquidity is Insufficient for this Swap</div>
            <TooltipComponent
                title='Current Pool Liquidity is Insufficient for this Swap'
                placement='bottom'
            />
        </WarningContainer>
    ) : undefined;

    const priceImpactWarning =
        !isLiquidityInsufficient && priceImpactNum && priceImpactNum > 2 ? (
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
                <div>{getPriceImpactString(priceImpactNum)}%</div>
            </WarningContainer>
        ) : undefined;

    return (
        <TradeModuleSkeleton
            isSwapPage={!isOnTradeRoute}
            header={
                <TradeModuleHeader
                    slippage={swapSlippage}
                    bypassConfirm={bypassConfirmSwap}
                    settingsTitle='Swap'
                    isSwapPage={!isOnTradeRoute}
                />
            }
            input={
                <SwapTokenInput
                    setIsLiquidityInsufficient={setIsLiquidityInsufficient}
                    slippageTolerancePercentage={slippageTolerancePercentage}
                    setPriceImpact={setPriceImpact}
                    sellQtyString={{
                        value: sellQtyString,
                        set: setSellQtyString,
                    }}
                    buyQtyString={{ value: buyQtyString, set: setBuyQtyString }}
                    isSellLoading={{
                        value: isSellLoading,
                        set: setIsSellLoading,
                    }}
                    isBuyLoading={{ value: isBuyLoading, set: setIsBuyLoading }}
                    isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                    isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                    setSwapAllowed={setSwapAllowed}
                    toggleDexSelection={toggleDexSelection}
                />
            }
            transactionDetails={
                <SwapExtraInfo
                    priceImpact={priceImpact}
                    effectivePriceWithDenom={effectivePriceWithDenom}
                    slippageTolerance={slippageTolerancePercentage}
                    liquidityProviderFeeString={liquidityProviderFeeString}
                    swapGasPriceinDollars={swapGasPriceinDollars}
                    showExtraInfoDropdown={primaryQuantity !== ''}
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
                    />
                ) : (
                    <></>
                )
            }
            button={
                <Button
                    title={
                        areBothAckd
                            ? bypassConfirmSwap.isEnabled
                                ? swapAllowed
                                    ? 'Submit Swap'
                                    : swapButtonErrorMessage
                                : swapAllowed
                                ? bypassConfirmSwap.isEnabled
                                    ? 'Submit Swap'
                                    : 'Confirm'
                                : swapButtonErrorMessage
                            : 'Acknowledge'
                    }
                    action={
                        areBothAckd
                            ? bypassConfirmSwap.isEnabled
                                ? initiateSwap
                                : handleModalOpen
                            : ackAsNeeded
                    }
                    disabled={
                        (!swapAllowed ||
                            sellQtyString === '' ||
                            buyQtyString === '') &&
                        areBothAckd
                    }
                    flat
                />
            }
            bypassConfirm={
                showConfirmation && bypassConfirmSwap.isEnabled ? (
                    <SubmitTransaction
                        type='Swap'
                        newTransactionHash={newSwapTransactionHash}
                        txErrorCode={txErrorCode}
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
                        {priceImpactWarning && priceImpactWarning}
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
