import { CrocImpact } from '@crocswap-libs/sdk';
import { useContext, useState, useEffect, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useProvider } from 'wagmi';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import { getPriceImpactString } from '../../../App/functions/swap/getPriceImpactString';
import { useTradeData } from '../../../App/hooks/useTradeData';
import Button from '../../../components/Global/Button/Button';
import Modal from '../../../components/Global/Modal/Modal';
import { useModal } from '../../../components/Global/Modal/useModal';
import TooltipComponent from '../../../components/Global/TooltipComponent/TooltipComponent';
import ConfirmSwapModal from '../../../components/Swap/ConfirmSwapModal/ConfirmSwapModal';
import SwapExtraInfo from '../../../components/Swap/SwapExtraInfo/SwapExtraInfo';
import SwapTokenInput from '../../../components/Swap/SwapTokenInput/SwapTokenInput';
import BypassConfirmButton from '../../../components/Trade/TradeModules/BypassConfirmButton/BypassConfirmButton';
import TradeModuleHeader from '../../../components/Trade/TradeModules/TradeModuleHeader';
import { TradeModuleSkeleton } from '../../../components/Trade/TradeModules/TradeModuleSkeleton';
import { IS_LOCAL_ENV } from '../../../constants';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
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
} from '../../../utils/state/receiptDataSlice';
import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
} from '../../../utils/TransactionError';
import { swapTutorialSteps } from '../../../utils/tutorial/Swap';
import styles from './Swap.module.css';

interface propsIF {
    isOnTradeRoute?: boolean;
}

function Swap(props: propsIF) {
    const { isOnTradeRoute } = props;
    const {
        crocEnv,
        chainData: { chainId },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { poolPriceDisplay, isPoolInitialized } = useContext(PoolContext);
    const { tokens } = useContext(TokenContext);
    const {
        isTokenABase: isSellTokenBase,
        setRecheckTokenAApproval,
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
    const { sessionReceipts, pendingTransactions } = useAppSelector(
        (state) => state.receiptData,
    );
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

    // this apparently different from the `bypassConfirm` that I am working with
    // it should possibly be renamed something different or better documented
    const [showBypassConfirm, setShowBypassConfirm] = useState(false);
    const [showExtraInfo, setShowExtraInfo] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(true);

    const [isLiquidityInsufficient, setIsLiquidityInsufficient] =
        useState<boolean>(false);
    const [isApprovalPending, setIsApprovalPending] = useState(false);
    // hooks to track whether user will use dex or wallet funds in transaction, this is
    // ... abstracted away from the central hook because the hook manages preference
    // ... and does not consider whether dex balance is sufficient
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] =
        useState<boolean>(false);
    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] =
        useState<boolean>(dexBalSwap.outputToDexBal.isEnabled);
    const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);

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

    let receiveReceiptHashes: Array<string> = [];
    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receiveReceiptHashes.includes(hash),
    );

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
    const tokenAQtyCoveredByWalletBalance = isWithdrawFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum < 0
            ? tokenASurplusMinusTokenARemainderNum * -1
            : 0
        : parseFloat(sellQtyString || '0');
    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= tokenAQtyCoveredByWalletBalance;

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
                ? 'Exchange'
                : 'Wallet';

            setSwapAllowed(parseFloat(sellQtyString) <= hurdle);

            if (parseFloat(sellQtyString) > hurdle) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage(
                    `${tokenA.symbol} Exceeds ${balanceLabel} Balance`,
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
        if (
            !currentPendingTransactionsArray.length &&
            !isWaitingForWallet &&
            txErrorCode === '' &&
            bypassConfirmSwap.isEnabled
        ) {
            setNewSwapTransactionHash('');
            setShowBypassConfirm(false);
        }
    }, [
        currentPendingTransactionsArray.length,
        isWaitingForWallet,
        txErrorCode === '',
        bypassConfirmSwap.isEnabled,
    ]);

    useEffect(() => {
        setNewSwapTransactionHash('');
        setShowBypassConfirm(false);
    }, [baseToken.address + quoteToken.address]);

    useEffect(() => {
        receiveReceiptHashes = sessionReceipts.map(
            (receipt) => JSON.parse(receipt)?.transactionHash,
        );
    }, [sessionReceipts]);

    // calculate price of gas for swap
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const averageSwapCostInGasDrops = 106000;
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageSwapCostInGasDrops *
                1e-9 *
                ethMainnetUsdPrice;

            setSwapGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                    prefix: '$',
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');
    };

    async function initiateSwap() {
        resetConfirmation();
        setIsWaitingForWallet(true);
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
            setIsWaitingForWallet(false);

            setNewSwapTransactionHash(tx?.hash);
            dispatch(addPendingTx(tx?.hash));
            if (tx.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: `Swap ${tokenA.symbol}→${tokenB.symbol}`,
                    }),
                );
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error?.code);
            setIsWaitingForWallet(false);
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

    const handleModalClose = () => {
        closeModal();
        setNewSwapTransactionHash('');
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
            if (isSaveAsDexSurplusChecked) dexBalSwap.outputToDexBal.disable();
            else dexBalSwap.outputToDexBal.enable();
            setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked);
        }
    };

    const handleSwapButtonClickWithBypass = () => {
        IS_LOCAL_ENV && console.debug('setting  bypass confirm to true');
        setShowBypassConfirm(true);
        initiateSwap();
    };

    // logic to acknowledge one or both tokens as necessary
    const ackAsNeeded = (): void => {
        needConfirmTokenA && tokens.ackToken(tokenA);
        needConfirmTokenB && tokens.ackToken(tokenB);
    };

    const confirmSwapModalProps = {
        tokenPair: { dataTokenA: tokenA, dataTokenB: tokenB },
        isDenomBase: isDenomBase,
        baseTokenSymbol: baseToken.symbol,
        quoteTokenSymbol: quoteToken.symbol,
        initiateSwapMethod: initiateSwap,
        newSwapTransactionHash: newSwapTransactionHash,
        txErrorCode: txErrorCode,
        showConfirmation: showConfirmation,
        setShowConfirmation: setShowConfirmation,
        resetConfirmation: resetConfirmation,
        slippageTolerancePercentage: slippageTolerancePercentage,
        effectivePrice: effectivePrice,
        isSellTokenBase: isSellTokenBase,
        sellQtyString: sellQtyString,
        buyQtyString: buyQtyString,
        setShowBypassConfirm: setShowBypassConfirm,
        setNewSwapTransactionHash: setNewSwapTransactionHash,
        showBypassConfirm,
        showExtraInfo: showExtraInfo,
        setShowExtraInfo: setShowExtraInfo,
    };

    const liquidityInsufficientWarning = isLiquidityInsufficient ? (
        <div className={styles.price_impact}>
            <div className={styles.align_center}>
                <div
                    style={{
                        color: '#f6385b',
                    }}
                >
                    Current Pool Liquidity is Insufficient for this Swap
                </div>
            </div>
            <div>
                <TooltipComponent
                    title='Current Pool Liquidity is Insufficient for this Swap'
                    placement='bottom'
                />
            </div>
        </div>
    ) : undefined;

    const priceImpactWarning =
        !isLiquidityInsufficient && priceImpactNum && priceImpactNum > 2 ? (
            <div className={styles.price_impact}>
                <div className={styles.align_center}>
                    <div>Price Impact Warning</div>
                    <TooltipComponent
                        title='Difference Between Current (Spot) Price and Final Price'
                        placement='bottom'
                    />
                </div>
                <div className={styles.data}>
                    {getPriceImpactString(priceImpactNum)}%
                </div>
            </div>
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
                    <Modal
                        onClose={handleModalClose}
                        title='Swap Confirmation'
                        centeredTitle
                    >
                        <ConfirmSwapModal {...confirmSwapModalProps} />
                    </Modal>
                ) : undefined
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
                                ? handleSwapButtonClickWithBypass
                                : openModal
                            : ackAsNeeded
                    }
                    disabled={
                        (!swapAllowed ||
                            sellQtyString === '' ||
                            buyQtyString !== '') &&
                        areBothAckd
                    }
                    flat
                />
            }
            bypassConfirm={
                showBypassConfirm ? (
                    <BypassConfirmButton
                        newTransactionHash={newSwapTransactionHash}
                        txErrorCode={txErrorCode}
                        resetConfirmation={resetConfirmation}
                        setShowBypassConfirmButton={setShowBypassConfirm}
                        sendTransaction={initiateSwap}
                        setNewTransactionHash={setNewSwapTransactionHash}
                        transactionPendingDisplayString={`Swapping ${sellQtyString} ${tokenA.symbol} for ${buyQtyString} ${tokenB.symbol}`}
                    />
                ) : undefined
            }
            approveButton={
                isPoolInitialized &&
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
