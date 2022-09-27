// START: Import React and Dongles
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { tickToPrice, CrocEnv, pinTickLower, pinTickUpper } from '@crocswap-libs/sdk';
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
import { setLimitPrice } from '../../../utils/state/tradeDataSlice';
import { addPendingTx, addReceipt, removePendingTx } from '../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';

interface LimitPropsIF {
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
    nativeBalance: string | undefined;
    lastBlockNumber: number;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    isTokenABase: boolean;
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
    // setLimitRate: React.Dispatch<React.SetStateAction<string>>;
    // limitRate: string;
}

export default function Limit(props: LimitPropsIF) {
    const {
        isUserLoggedIn,
        importedTokens,
        searchableTokens,
        mintSlippage,
        isPairStable,
        setImportedTokens,
        provider,
        isSellTokenBase,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenPair,
        isTokenABase,
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
        // setLimitRate,
        // limitRate,
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

    // const priceInputOnBlur = () => setPriceInputFieldBlurred(true);

    useEffect(() => {
        if (poolPriceDisplay === undefined) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('…');
        } else if (poolPriceDisplay === 0 || poolPriceDisplay === Infinity) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Invalid Token Pair');
        }
    }, [poolPriceDisplay]);

    const [newLimitOrderTransactionHash, setNewLimitOrderTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const [showConfirmation, setShowConfirmation] = useState<boolean>(true);

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode(0);
        setTxErrorMessage('');
    };

    // const tokenADecimals = tokenPair.dataTokenA.decimals;
    // const tokenBDecimals = tokenPair.dataTokenB.decimals;

    // const baseDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    // const quoteDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const isTokenAPrimary = tradeData.isTokenAPrimary;
    const limitRate = tradeData.limitPrice;

    const slippageTolerancePercentage = tradeData.slippageTolerance;

    const [limitTick, setLimitTick] = useState<number>(0);
    const [insideTickDisplayPrice, setInsideTickDisplayPrice] = useState<number>(0);
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
            if (!provider) return;
            if (!poolPriceDisplay) return;

            const gridSize = lookupChain(chainId).gridSize;

            const croc = new CrocEnv(provider);
            const pool =
                isDenomBase === isTokenABase
                    ? croc.pool(tradeData.tokenA.address, tradeData.tokenB.address)
                    : croc.pool(tradeData.tokenB.address, tradeData.tokenA.address);

            const initialLimitRate = isDenomBase
                ? (1 / poolPriceDisplay) * (isSellTokenBase ? 1.015 : 0.985)
                : poolPriceDisplay * (isSellTokenBase ? 0.985 : 1.015);

            dispatch(setLimitPrice(initialLimitRate.toString()));
            // console.log({ initialLimitRate });
            // setLimitRate(initialLimitRate.toString());

            const limitWei = pool.fromDisplayPrice(initialLimitRate);

            const pinTick = limitWei.then((lw) =>
                isDenomBase ? pinTickLower(lw, gridSize) : pinTickUpper(lw, gridSize),
            );
            // pinTick.then(setLimitTick);
            pinTick.then((newTick) => {
                setLimitTick(newTick);
            });
            const tickPrice = pinTick.then(tickToPrice);
            const tickDispPrice = tickPrice.then((tp) => pool.toDisplayPrice(tp));

            tickDispPrice.then((tp) => {
                setInsideTickDisplayPrice(tp);
                dispatch(setLimitPrice(tp.toString()));
                setInitialLoad(false);
                const limitRateTruncated =
                    tp < 2
                        ? tp.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                          })
                        : tp.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                const limitRateInputField = document.getElementById('limit-rate-quantity');
                if (limitRateInputField)
                    (limitRateInputField as HTMLInputElement).value = limitRateTruncated;
            });
        } else {
            if (!provider) return;
            if (poolPriceNonDisplay === 0) return;
            // if (!priceInputFieldBlurred) return;

            const gridSize = lookupChain(chainId).gridSize;

            const croc = new CrocEnv(provider);
            const pool = croc.pool(tradeData.tokenA.address, tradeData.tokenB.address);

            const limitWei = pool.fromDisplayPrice(
                (isDenomBase && isTokenABase) || (!isDenomBase && !isTokenABase)
                    ? parseFloat(limitRate)
                    : 1 / parseFloat(limitRate),
            );
            const pinTick = limitWei.then((lw) =>
                isDenomBase ? pinTickLower(lw, gridSize) : pinTickUpper(lw, gridSize),
            );
            // pinTick.then(setLimitTick);
            pinTick.then((newTick) => {
                setLimitTick(newTick);
            });

            const tickPrice = pinTick.then(tickToPrice);
            // pinTick.then(console.log);
            // const tickDispPrice = tickPrice.then((tp) => pool.toDisplayPrice(tp));
            const tickDispPrice =
                (isDenomBase && isTokenABase) || (!isDenomBase && !isTokenABase)
                    ? tickPrice.then((tp) => pool.toDisplayPrice(tp))
                    : tickPrice.then((tp) => pool.toDisplayPrice(tp)).then((tp) => 1 / tp);

            tickDispPrice.then((tp) => {
                setInsideTickDisplayPrice(tp);
                dispatch(setLimitPrice(tp.toString()));
                setInitialLoad(false);
                const limitRateTruncated =
                    tp < 2
                        ? tp.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                          })
                        : tp.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                const limitRateInputField = document.getElementById('limit-rate-quantity');
                if (limitRateInputField)
                    (limitRateInputField as HTMLInputElement).value = limitRateTruncated;
            });
            setPriceInputFieldBlurred(false);
        }
    }, [
        initialLoad,
        limitRate,
        poolPriceDisplay,
        isSellTokenBase,
        isDenomBase,
        priceInputFieldBlurred,
    ]);

    const sendLimitOrder = async () => {
        console.log('Send limit');
        if (!provider || !(provider as ethers.providers.WebSocketProvider).getSigner()) {
            return;
        }

        const sellToken = tradeData.tokenA.address;
        const buyToken = tradeData.tokenB.address;
        const sellQty = tokenAInputQty;
        const buyQty = tokenBInputQty;

        const qty = isTokenAPrimary ? sellQty : buyQty;

        // console.log({ qty });
        // console.log({ isTokenAPrimary });
        // console.log({ buyToken });
        // console.log({ sellToken });

        const order = isTokenAPrimary
            ? new CrocEnv(provider).sell(sellToken, qty)
            : new CrocEnv(provider).buy(buyToken, qty);
        // const seller = new CrocEnv(provider).sell(sellToken, qty);
        console.log({ limitTick });
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
                        isBid: isTokenAPrimary.toString(), // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
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
                                isBid: isTokenAPrimary.toString(), // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
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
                insideTickDisplayPrice={insideTickDisplayPrice}
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
        if (!provider) {
            return;
        }
        setIsApprovalPending(true);
        try {
            const tx = await new CrocEnv(provider).token(tokenAddress).approve();
            if (tx) {
                await tx.wait();
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

    // const tokenABalance = isTokenABase ? baseTokenBalance : quoteTokenBalance;
    // const tokenBBalance = isTokenABase ? quoteTokenBalance : baseTokenBalance;

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
    return (
        <section>
            <ContentContainer isOnTradeRoute>
                <LimitHeader
                    chainId={chainId}
                    // tokenPair={tokenPair}
                    mintSlippage={mintSlippage}
                    isPairStable={isPairStable}
                    // isDenomBase={tradeData.isDenomBase}
                    // isTokenABase={isTokenABase}
                />
                <DividerDark addMarginTop />
                {navigationMenu}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <LimitCurrencyConverter
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
                        // priceInputOnBlur={priceInputOnBlur}
                        insideTickDisplayPrice={insideTickDisplayPrice}
                        isDenominationInBase={tradeData.isDenomBase}
                        activeTokenListsChanged={activeTokenListsChanged}
                        indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
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
                    limitRate={limitRate}
                />
                {isAuthenticated && isWeb3Enabled ? (
                    !isTokenAAllowanceSufficient && parseFloat(tokenAInputQty) > 0 ? (
                        approvalButton
                    ) : (
                        <LimitButton
                            onClickFn={openModal}
                            limitAllowed={poolPriceNonDisplay !== 0 && limitAllowed}
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
