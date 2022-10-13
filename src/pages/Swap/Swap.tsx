// START: Import React and Dongles
import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
// import { useMoralis } from 'react-moralis';
import { motion } from 'framer-motion';
import { CrocEnv, CrocImpact } from '@crocswap-libs/sdk';

// START: Import React Components
import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';
import DenominationSwitch from '../../components/Swap/DenominationSwitch/DenominationSwitch';
import DividerDark from '../../components/Global/DividerDark/DividerDark';
import Modal from '../../components/Global/Modal/Modal';
import RelativeModal from '../../components/Global/RelativeModal/RelativeModal';
import ConfirmSwapModal from '../../components/Swap/ConfirmSwapModal/ConfirmSwapModal';
import Button from '../../components/Global/Button/Button';

// START: Import Local Files
import styles from './Swap.module.css';
// import truncateDecimals from '../../utils/data/truncateDecimals';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { useTradeData } from '../Trade/Trade';
import { useAppSelector, useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { SlippagePairIF, TokenIF, TokenPairIF } from '../../utils/interfaces/exports';
import { useModal } from '../../components/Global/Modal/useModal';
import { useRelativeModal } from '../../components/Global/RelativeModal/useRelativeModal';
import { addPendingTx, addReceipt, removePendingTx } from '../../utils/state/receiptDataSlice';
import { useUrlParams } from './useUrlParams';
// import { calcImpact } from '../../App/functions/calcImpact';

interface SwapPropsIF {
    crocEnv: CrocEnv | undefined;
    isUserLoggedIn: boolean;
    account: string | null;
    importedTokens: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    swapSlippage: SlippagePairIF;
    isPairStable: boolean;
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
    tokenAAllowance: string;
    setRecheckTokenAApproval: Dispatch<SetStateAction<boolean>>;
    chainId: string;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
    openModalWallet: () => void;
    isInitialized: boolean;
    poolExists: boolean | null;
    setTokenPairLocal?: Dispatch<SetStateAction<string[]|null>>;
}

export default function Swap(props: SwapPropsIF) {
    const {
        crocEnv,
        isUserLoggedIn,
        account,
        importedTokens,
        setImportedTokens,
        searchableTokens,
        swapSlippage,
        isPairStable,
        provider,
        isOnTradeRoute,
        // nativeBalance,
        ethMainnetUsdPrice,
        gasPriceInGwei,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        isSellTokenBase,
        tokenPair,
        poolPriceDisplay,
        tokenAAllowance,
        setRecheckTokenAApproval,
        chainId,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
        openModalWallet,
        isInitialized,
        poolExists,
        setTokenPairLocal
    } = props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const tokenPairFromParams = useUrlParams(chainId, isInitialized);
    useEffect(() => {
        setTokenPairLocal && setTokenPairLocal(tokenPairFromParams);
    }, [tokenPairFromParams]);

    const [isRelativeModalOpen, closeRelativeModal] = useRelativeModal();

    // const { account } = useMoralis();
    // get URL pathway for user relative to index
    const { pathname } = useLocation();

    // use URL pathway to determine if user is in swap or market page
    // depending on location we pull data on the tx in progress differently
    const { tradeData } = pathname.includes('/trade')
        ? useTradeData()
        : useAppSelector((state) => state);

    const { navigationMenu } = pathname.includes('/trade')
        ? useTradeData()
        : { navigationMenu: null };

    const { tokenA, tokenB } = tradeData;

    const slippageTolerancePercentage = isPairStable
        ? parseFloat(swapSlippage.stable.value)
        : parseFloat(swapSlippage.volatile.value);

    const loginButton = <Button title='Login' action={openModalWallet} />;

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const approve = async (tokenAddress: string) => {
        // if (!provider) return;
        if (!crocEnv) return;
        setIsApprovalPending(true);
        try {
            const tx = await crocEnv.token(tokenAddress).approve();
            // const tx = await new CrocEnv(provider).token(tokenAddress).approve();
            if (tx) {
                await tx.wait();
            }
        } catch (error) {
            console.warn({ error });
        } finally {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
        }
    };

    const approvalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Click to Approve ${tokenPair.dataTokenA.symbol}`
                    : `${tokenPair.dataTokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenA.address);
            }}
        />
    );

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');
    const [swapAllowed, setSwapAllowed] = useState<boolean>(false);
    const [swapButtonErrorMessage, setSwapButtonErrorMessage] = useState<string>('');
    const isTokenAPrimary = tradeData.isTokenAPrimary;
    // console.log({ isTokenAPrimary });
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(false);
    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(false);
    const [newSwapTransactionHash, setNewSwapTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [priceImpact, setPriceImpact] = useState<CrocImpact | undefined>();
    const [showConfirmation, setShowConfirmation] = useState<boolean>(true);
    const [swapGasPriceinDollars, setSwapGasPriceinDollars] = useState<string | undefined>();

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode(0);
        setTxErrorMessage('');
    };

    useEffect(() => {
        if (poolExists === null) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('...');
        } else if (poolExists === false) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Pool Not Initialized');
        }
    }, [poolPriceDisplay]);

    const [priceImpactExceedsTolerance, setPriceImpactExceedsTolerance] = useState(false);

    useEffect(() => {
        const priceImpactPercentChange = priceImpact?.percentChange;
        if (priceImpactPercentChange) {
            if (Math.abs(priceImpactPercentChange) > slippageTolerancePercentage / 100) {
                console.log('price impace exceeds slippage tolerance');
                setPriceImpactExceedsTolerance(true);
                setSwapButtonErrorMessage('Please Increase Slippage Tolerance');
            } else {
                setPriceImpactExceedsTolerance(false);
            }
        }
    }, [priceImpact, slippageTolerancePercentage]);

    async function initiateSwap() {
        resetConfirmation();
        if (!crocEnv) return;
        const sellTokenAddress = tokenA.address;
        const buyTokenAddress = tokenB.address;
        const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
        const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;
        const qty = isTokenAPrimary ? sellTokenQty : buyTokenQty;
        const isQtySell = isTokenAPrimary;
        let tx;
        try {
            (tx = await (isQtySell
                ? crocEnv
                      .sell(sellTokenAddress, qty)
                      .for(buyTokenAddress, {
                          slippage: slippageTolerancePercentage / 100,
                      })
                      .swap({ surplus: [isWithdrawFromDexChecked, isSaveAsDexSurplusChecked] })
                : crocEnv
                      .buy(buyTokenAddress, qty)
                      .with(sellTokenAddress, {
                          slippage: slippageTolerancePercentage / 100,
                      })
                      .swap({ surplus: [isWithdrawFromDexChecked, isSaveAsDexSurplusChecked] }))),
                setNewSwapTransactionHash(tx?.hash);
            dispatch(addPendingTx(tx?.hash));
        } catch (error) {
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
        }

        const newSwapCacheEndpoint = 'https://809821320828123.de:5000/new_swap?';

        const inBaseQty =
            (isSellTokenBase && isTokenAPrimary) || (!isSellTokenBase && !isTokenAPrimary);

        const crocQty = await crocEnv
            .token(isTokenAPrimary ? tokenA.address : tokenB.address)
            .normQty(qty);

        if (tx?.hash) {
            fetch(
                newSwapCacheEndpoint +
                    new URLSearchParams({
                        tx: tx.hash,
                        user: account ?? '',
                        base: isSellTokenBase ? sellTokenAddress : buyTokenAddress,
                        quote: isSellTokenBase ? buyTokenAddress : sellTokenAddress,
                        poolIdx: (await crocEnv.context).chain.poolIndex.toString(),
                        isBuy: isSellTokenBase.toString(),
                        inBaseQty: inBaseQty.toString(),
                        qty: crocQty.toString(),
                        override: 'false',
                        chainId: chainId,
                        limitPrice: '0',
                        minOut: '0',
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

                setNewSwapTransactionHash(newTransactionHash);
                console.log({ newTransactionHash });
                receipt = error.receipt;

                if (newTransactionHash) {
                    fetch(
                        newSwapCacheEndpoint +
                            new URLSearchParams({
                                tx: newTransactionHash,
                                user: account ?? '',
                                base: isSellTokenBase ? sellTokenAddress : buyTokenAddress,
                                quote: isSellTokenBase ? buyTokenAddress : sellTokenAddress,
                                poolIdx: (await crocEnv.context).chain.poolIndex.toString(),
                                isBuy: isSellTokenBase.toString(),
                                inBaseQty: inBaseQty.toString(),
                                qty: crocQty.toString(),
                                override: 'false',
                                chainId: chainId,
                                limitPrice: '0',
                                minOut: '0',
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
    }

    const handleModalClose = () => {
        closeModal();
        setNewSwapTransactionHash('');
        resetConfirmation();
    };

    // TODO:  @Emily refactor this Modal and later elements such that
    // TODO:  ... tradeData is passed to directly instead of tokenPair
    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal onClose={handleModalClose} title='Swap Confirmation'>
            <ConfirmSwapModal
                poolPriceDisplay={poolPriceDisplay}
                tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                isDenomBase={tradeData.isDenomBase}
                baseTokenSymbol={tradeData.baseToken.symbol}
                quoteTokenSymbol={tradeData.quoteToken.symbol}
                priceImpact={priceImpact}
                initiateSwapMethod={initiateSwap}
                onClose={handleModalClose}
                newSwapTransactionHash={newSwapTransactionHash}
                txErrorCode={txErrorCode}
                txErrorMessage={txErrorMessage}
                showConfirmation={showConfirmation}
                setShowConfirmation={setShowConfirmation}
                resetConfirmation={resetConfirmation}
            />
        </Modal>
    ) : null;

    const relativeModalOrNull = isRelativeModalOpen ? (
        <RelativeModal onClose={closeRelativeModal} title='Relative Modal'>
            You are about to do something that will lose you a lot of money. If you think you are
            smarter than the awesome team that programmed this, press dismiss.
        </RelativeModal>
    ) : null;

    // calculate price of gas for swap
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum = gasPriceInGwei * 79079 * 1e-9 * ethMainnetUsdPrice;

            setSwapGasPriceinDollars(
                '~$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);

    const swapContainerStyle = pathname.startsWith('/swap') ? styles.swap_page_container : null;
    const swapPageStyle = pathname.startsWith('/swap') ? styles.swap_page : null;
    return (
        <main data-testid={'swap'} className={swapPageStyle}>
            <div className={`${swapContainerStyle}`}>
                <ContentContainer isOnTradeRoute={isOnTradeRoute}>
                    <SwapHeader
                        swapSlippage={swapSlippage}
                        isPairStable={isPairStable}
                        isOnTradeRoute={isOnTradeRoute}
                    />
                    <DividerDark addMarginTop />
                    {navigationMenu}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CurrencyConverter
                            crocEnv={crocEnv}
                            isUserLoggedIn={isUserLoggedIn}
                            provider={provider}
                            slippageTolerancePercentage={slippageTolerancePercentage}
                            setPriceImpact={setPriceImpact}
                            tokenPair={tokenPair}
                            tokensBank={importedTokens}
                            setImportedTokens={setImportedTokens}
                            searchableTokens={searchableTokens}
                            chainId={chainId as string}
                            isLiq={false}
                            poolPriceDisplay={poolPriceDisplay}
                            isTokenAPrimary={isTokenAPrimary}
                            isSellTokenBase={isSellTokenBase}
                            baseTokenBalance={baseTokenBalance}
                            quoteTokenBalance={quoteTokenBalance}
                            baseTokenDexBalance={baseTokenDexBalance}
                            quoteTokenDexBalance={quoteTokenDexBalance}
                            tokenAInputQty={tokenAInputQty}
                            tokenBInputQty={tokenBInputQty}
                            setTokenAInputQty={setTokenAInputQty}
                            setTokenBInputQty={setTokenBInputQty}
                            isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                            setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                            isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                            setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                            setSwapAllowed={setSwapAllowed}
                            setSwapButtonErrorMessage={setSwapButtonErrorMessage}
                            activeTokenListsChanged={activeTokenListsChanged}
                            indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
                        />
                    </motion.div>
                    <div className={styles.header_container}>
                        <DividerDark addMarginTop />
                        <DenominationSwitch />
                    </div>
                    <ExtraInfo
                        tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                        priceImpact={priceImpact}
                        isTokenABase={isSellTokenBase}
                        poolPriceDisplay={poolPriceDisplay || 0}
                        slippageTolerance={slippageTolerancePercentage}
                        liquidityProviderFee={0.3}
                        quoteTokenIsBuy={true}
                        swapGasPriceinDollars={swapGasPriceinDollars}
                        didUserFlipDenom={tradeData.didUserFlipDenom}
                        isDenomBase={tradeData.isDenomBase}
                    />
                    {isUserLoggedIn ? (
                        !isTokenAAllowanceSufficient &&
                        parseFloat(tokenAInputQty) > 0 &&
                        tokenAInputQty !== 'Infinity' ? (
                            approvalButton
                        ) : (
                            <SwapButton
                                onClickFn={openModal}
                                swapAllowed={swapAllowed && !priceImpactExceedsTolerance}
                                swapButtonErrorMessage={swapButtonErrorMessage}
                            />
                        )
                    ) : (
                        loginButton
                    )}
                </ContentContainer>
                {confirmSwapModalOrNull}
                {relativeModalOrNull}
            </div>
        </main>
    );
}
