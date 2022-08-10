// START: Import React and Dongles
import { useState, Dispatch, SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { motion } from 'framer-motion';
import {
    CrocEnv,
    //  toDisplayQty
} from '@crocswap-libs/sdk';

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
import truncateDecimals from '../../utils/data/truncateDecimals';
import { isTransactionReplacedError, TransactionError } from '../../utils/TransactionError';
import { useTradeData } from '../Trade/Trade';
import { useAppSelector, useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { SlippagePairIF, TokenIF, TokenPairIF } from '../../utils/interfaces/exports';
import { useModal } from '../../components/Global/Modal/useModal';
import { useRelativeModal } from '../../components/Global/RelativeModal/useRelativeModal';
import { addReceipt } from '../../utils/state/receiptDataSlice';
import { ethers } from 'ethers';

interface SwapPropsIF {
    importedTokens: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    swapSlippage: SlippagePairIF;
    isPairStable: boolean;
    provider?: ethers.providers.Provider;
    isOnTradeRoute?: boolean;
    gasPriceinGwei: string;
    nativeBalance: string;
    lastBlockNumber: number;
    tokenABalance: string;
    tokenBBalance: string;
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    poolPriceDisplay: number;
    tokenAAllowance: string;
    setRecheckTokenAApproval: Dispatch<SetStateAction<boolean>>;
    chainId: string;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

export default function Swap(props: SwapPropsIF) {
    const {
        importedTokens,
        setImportedTokens,
        searchableTokens,
        swapSlippage,
        isPairStable,
        provider,
        isOnTradeRoute,
        nativeBalance,
        gasPriceinGwei,
        tokenABalance,
        tokenBBalance,
        isSellTokenBase,
        tokenPair,
        poolPriceDisplay,
        tokenAAllowance,
        setRecheckTokenAApproval,
        chainId,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const [isRelativeModalOpen, closeRelativeModal] = useRelativeModal();

    const { enableWeb3, isWeb3Enabled, authenticate, isAuthenticated, account } = useMoralis();
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

    // const slippageTolerancePercentage = tradeData.slippageTolerance;

    const slippageTolerancePercentage = isPairStable
        ? parseFloat(swapSlippage.stable.value)
        : parseFloat(swapSlippage.volatile.value);

    // login functionality
    const clickLogin = () => {
        console.log('user clicked Login');
        if (!isAuthenticated || !isWeb3Enabled) {
            authenticate({
                provider: 'metamask',
                signingMessage: 'Ambient API Authentication.',
                onSuccess: () => {
                    enableWeb3();
                },
                onError: () => {
                    authenticate({
                        provider: 'metamask',
                        signingMessage: 'Ambient API Authentication.',
                        onSuccess: () => {
                            enableWeb3;
                            // alert('🎉');
                        },
                    });
                },
            });
        }
    };

    const loginButton = <Button title='Login' action={clickLogin} />;

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

    // const [isTokenAPrimary, setIsTokenAPrimary] = useState<boolean>(tradeData.isTokenAPrimary);
    const isTokenAPrimary = tradeData.isTokenAPrimary;
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(false);
    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(false);

    const [newSwapTransactionHash, setNewSwapTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');

    async function initiateSwap() {
        if (!provider) {
            return;
        }

        if (!(provider as ethers.providers.JsonRpcProvider).getSigner()) {
            return;
        }

        const sellTokenAddress = tokenA.address;
        const buyTokenAddress = tokenB.address;
        const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
        const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;
        const qty = isTokenAPrimary ? sellTokenQty : buyTokenQty;
        const isQtySell = isTokenAPrimary;

        const env = new CrocEnv(provider);

        let tx;
        try {
            tx = await (isQtySell
                ? env.sell(sellTokenAddress, qty).for(buyTokenAddress).swap()
                : env.buy(buyTokenAddress, qty).with(sellTokenAddress).swap());

            setNewSwapTransactionHash(tx?.hash);
        } catch (error) {
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
        }

        const newSwapCacheEndpoint = 'https://809821320828123.de:5000/new_swap?';

        const inBaseQty =
            (isSellTokenBase && isTokenAPrimary) || (!isSellTokenBase && !isTokenAPrimary);

        const crocQty = await env
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
                        poolIdx: (await env.context).chain.poolIndex.toString(),
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

            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                console.log('repriced');
                const newTransactionHash = error.replacement.hash;
                setNewSwapTransactionHash(newTransactionHash);
                console.log({ newSwapTransactionHash });
                receipt = error.receipt;

                if (newTransactionHash) {
                    fetch(
                        newSwapCacheEndpoint +
                            new URLSearchParams({
                                tx: newTransactionHash,
                                user: account ?? '',
                                base: isSellTokenBase ? sellTokenAddress : buyTokenAddress,
                                quote: isSellTokenBase ? buyTokenAddress : sellTokenAddress,
                                poolIdx: (await env.context).chain.poolIndex.toString(),
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
            }
        }

        if (receipt) {
            dispatch(addReceipt(JSON.stringify(receipt)));
        }
    }

    const handleModalClose = () => {
        closeModal();
        setNewSwapTransactionHash('');
        setTxErrorCode(0);
        setTxErrorMessage('');
    };

    // TODO:  @Emily refactor this Modal and later elements such that
    // TODO:  ... tradeData is passed to directly instead of tokenPair
    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal onClose={handleModalClose} title='Swap Confirmation'>
            <ConfirmSwapModal
                tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                initiateSwapMethod={initiateSwap}
                onClose={handleModalClose}
                newSwapTransactionHash={newSwapTransactionHash}
                // setNewSwapTransactionHash={setNewSwapTransactionHash}
                txErrorCode={txErrorCode}
                txErrorMessage={txErrorMessage}
            />
        </Modal>
    ) : null;

    const relativeModalOrNull = isRelativeModalOpen ? (
        <RelativeModal onClose={closeRelativeModal} title='Relative Modal'>
            You are about to do something that will lose you a lot of money. If you think you are
            smarter than the awesome team that programmed this, press dismiss.
        </RelativeModal>
    ) : null;

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    // console.log(pathname);

    const swapContainerStyle = pathname == '/swap' ? styles.swap_page_container : null;
    const swapPageStyle = pathname == '/swap' ? styles.swap_page : null;
    return (
        <main data-testid={'swap'} className={swapPageStyle}>
            <div className={`${swapContainerStyle}`}>
                <ContentContainer isOnTradeRoute={isOnTradeRoute}>
                    <SwapHeader
                        tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                        swapSlippage={swapSlippage}
                        isPairStable={isPairStable}
                        isOnTradeRoute={isOnTradeRoute}
                        isDenomBase={tradeData.isDenomBase}
                        isTokenABase={isSellTokenBase}
                    />
                    <DividerDark addMarginTop />
                    {navigationMenu}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CurrencyConverter
                            tokenPair={tokenPair}
                            tokensBank={importedTokens}
                            setImportedTokens={setImportedTokens}
                            searchableTokens={searchableTokens}
                            chainId={chainId as string}
                            isLiq={false}
                            poolPriceDisplay={poolPriceDisplay}
                            isTokenAPrimary={isTokenAPrimary}
                            isSellTokenBase={isSellTokenBase}
                            nativeBalance={truncateDecimals(
                                parseFloat(nativeBalance),
                                4,
                            ).toString()}
                            // tokenABalance={parseFloat(tokenABalance).toLocaleString()}
                            // tokenBBalance={parseFloat(tokenBBalance).toLocaleString()}
                            tokenABalance={tokenABalance}
                            tokenBBalance={tokenBBalance}
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
                        <DenominationSwitch
                            tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                            isTokenABase={isSellTokenBase}
                            displayForBase={tradeData.isDenomBase}
                            poolPriceDisplay={poolPriceDisplay}
                            didUserFlipDenom={tradeData.didUserFlipDenom}
                        />
                    </div>
                    <ExtraInfo
                        tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                        isTokenABase={isSellTokenBase}
                        poolPriceDisplay={poolPriceDisplay}
                        slippageTolerance={slippageTolerancePercentage}
                        liquidityProviderFee={0.3}
                        quoteTokenIsBuy={true}
                        gasPriceinGwei={gasPriceinGwei}
                        didUserFlipDenom={tradeData.didUserFlipDenom}
                        isDenomBase={tradeData.isDenomBase}
                    />
                    {isAuthenticated && isWeb3Enabled ? (
                        !isTokenAAllowanceSufficient &&
                        parseFloat(tokenAInputQty) > 0 &&
                        tokenAInputQty !== 'Infinity' ? (
                            approvalButton
                        ) : (
                            <SwapButton
                                onClickFn={openModal}
                                swapAllowed={swapAllowed}
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
