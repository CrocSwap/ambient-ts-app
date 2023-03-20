// START: Import React and Dongles
import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { CrocEnv, CrocImpact } from '@crocswap-libs/sdk';

// START: Import React Components
import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';
import Modal from '../../components/Global/Modal/Modal';
import RelativeModal from '../../components/Global/RelativeModal/RelativeModal';
import ConfirmSwapModal from '../../components/Swap/ConfirmSwapModal/ConfirmSwapModal';
import Button from '../../components/Global/Button/Button';
import { getRecentTokensParamsIF } from '../../App/hooks/useRecentTokens';

// START: Import Local Files
import styles from './Swap.module.css';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { useTradeData } from '../Trade/Trade';
import { useAppSelector, useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { TokenIF, TokenPairIF } from '../../utils/interfaces/exports';
import { useModal } from '../../components/Global/Modal/useModal';
import { useRelativeModal } from '../../components/Global/RelativeModal/useRelativeModal';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
} from '../../utils/state/receiptDataSlice';
import { useUrlParams } from './useUrlParams';
import SwapShareControl from '../../components/Swap/SwapShareControl/SwapShareControl';
import { FiCopy } from 'react-icons/fi';
import BypassConfirmSwapButton from '../../components/Swap/SwapButton/BypassConfirmSwapButton';
import TutorialOverlay from '../../components/Global/TutorialOverlay/TutorialOverlay';
import { swapTutorialSteps } from '../../utils/tutorial/Swap';
import { SlippageMethodsIF } from '../../App/hooks/useSlippage';
import { allDexBalanceMethodsIF } from '../../App/hooks/useExchangePrefs';
import TooltipComponent from '../../components/Global/TooltipComponent/TooltipComponent';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    isUserLoggedIn: boolean | undefined;
    account: string | undefined;
    importedTokens: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    swapSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    provider?: ethers.providers.Provider;
    isOnTradeRoute?: boolean;
    gasPriceInGwei: number | undefined;
    ethMainnetUsdPrice?: number;
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
    poolExists: boolean | undefined;
    setTokenPairLocal?: Dispatch<SetStateAction<string[] | null>>;

    openGlobalModal: (content: React.ReactNode) => void;
    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;

    isSwapCopied?: boolean;
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
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;

    isTutorialMode: boolean;
    setIsTutorialMode: Dispatch<SetStateAction<boolean>>;
    tokenPairLocal: string[] | null;
    dexBalancePrefs: allDexBalanceMethodsIF;
}

export default function Swap(props: propsIF) {
    const {
        crocEnv,
        isUserLoggedIn,
        account,
        importedTokens,
        setImportedTokens,
        swapSlippage,
        isPairStable,
        provider,
        isOnTradeRoute,
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
        setTokenPairLocal,
        isSwapCopied,
        verifyToken,
        getTokensByName,
        getTokenByAddress,
        importedTokensPlus,
        addRecentToken,
        getRecentTokens,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        acknowledgeToken,
        openGlobalPopup,
        bypassConfirm,
        toggleBypassConfirm,
        lastBlockNumber,
        tokenPairLocal,
        dexBalancePrefs,
    } = props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const tokenPairFromParams = useUrlParams(chainId, isInitialized);

    const [showBypassConfirm, setShowBypassConfirm] = useState(false);
    const [showExtraInfo, setShowExtraInfo] = useState(false);

    const receiptData = useAppSelector((state) => state.receiptData);

    const sessionReceipts = receiptData.sessionReceipts;

    const pendingTransactions = receiptData.pendingTransactions;
    const receiveReceiptHashes: Array<string> = [];

    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receiveReceiptHashes.includes(hash),
    );

    useEffect(() => {
        setTokenPairLocal && setTokenPairLocal(tokenPairFromParams);
    }, [tokenPairFromParams]);

    const [isRelativeModalOpen, closeRelativeModal] = useRelativeModal();

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

    const { tokenA, tokenB, baseToken, quoteToken } = tradeData;

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const [sellQtyString, setSellQtyString] = useState<string>(
        tradeData.isTokenAPrimary ? tradeData?.primaryQuantity : '',
    );
    const [buyQtyString, setBuyQtyString] = useState<string>(
        !tradeData.isTokenAPrimary ? tradeData?.primaryQuantity : '',
    );

    const slippageTolerancePercentage = isPairStable
        ? swapSlippage.stable
        : swapSlippage.volatile;

    const [swapAllowed, setSwapAllowed] = useState<boolean>(
        tradeData.primaryQuantity !== '',
    );

    // hooks to track whether user will use dex or wallet funds in transaction, this is
    // ... abstracted away from the central hook because the hook manages preference
    // ... and does not consider whether dex balance is sufficient
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] =
        useState<boolean>(dexBalancePrefs.swap.drawFromDexBal.isEnabled);
    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] =
        useState<boolean>(dexBalancePrefs.swap.outputToDexBal.isEnabled);

    const [swapButtonErrorMessage, setSwapButtonErrorMessage] =
        useState<string>('');
    const isTokenAPrimary = tradeData.isTokenAPrimary;
    const [newSwapTransactionHash, setNewSwapTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [priceImpact, setPriceImpact] = useState<CrocImpact | undefined>();
    const [showConfirmation, setShowConfirmation] = useState<boolean>(true);
    const [swapGasPriceinDollars, setSwapGasPriceinDollars] = useState<
        string | undefined
    >();

    const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);

    useEffect(() => {
        if (
            !currentPendingTransactionsArray.length &&
            !isWaitingForWallet &&
            txErrorCode === ''
        ) {
            setShowBypassConfirm(false);
        }
    }, [
        currentPendingTransactionsArray.length,
        isWaitingForWallet,
        txErrorCode === '',
    ]);

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');
        setTxErrorMessage('');
    };

    useEffect(() => {
        setNewSwapTransactionHash('');
        setShowBypassConfirm(false);
    }, [
        JSON.stringify({ base: baseToken.address, quote: quoteToken.address }),
    ]);

    async function initiateSwap() {
        resetConfirmation();
        setIsWaitingForWallet(true);
        if (!crocEnv) return;

        const sellTokenAddress = tokenA.address;
        const buyTokenAddress = tokenB.address;
        // const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
        // const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;
        const qty = isTokenAPrimary
            ? sellQtyString.replaceAll(',', '')
            : buyQtyString.replaceAll(',', '');
        const isQtySell = isTokenAPrimary;
        // const isQtySell = !isTokenAPrimary; // @ben todo: change back -- remove !
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
                    addTransactionByType({ txHash: tx.hash, txType: 'Swap' }),
                );
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.log({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
            setIsWaitingForWallet(false);
        }

        const newSwapCacheEndpoint =
            'https://809821320828123.de:5000/new_swap?';

        const inBaseQty =
            (isSellTokenBase && isTokenAPrimary) ||
            (!isSellTokenBase && !isTokenAPrimary);

        const crocQty = await crocEnv
            .token(isTokenAPrimary ? tokenA.address : tokenB.address)
            .normQty(qty);

        if (tx?.hash) {
            fetch(
                newSwapCacheEndpoint +
                    new URLSearchParams({
                        tx: tx.hash,
                        user: account ?? '',
                        base: isSellTokenBase
                            ? sellTokenAddress
                            : buyTokenAddress,
                        quote: isSellTokenBase
                            ? buyTokenAddress
                            : sellTokenAddress,
                        poolIdx: (
                            await crocEnv.context
                        ).chain.poolIndex.toString(),
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
                                base: isSellTokenBase
                                    ? sellTokenAddress
                                    : buyTokenAddress,
                                quote: isSellTokenBase
                                    ? buyTokenAddress
                                    : sellTokenAddress,
                                poolIdx: (
                                    await crocEnv.context
                                ).chain.poolIndex.toString(),
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
            // setNewSwapTransactionHash('');
        }
    }

    const handleModalClose = () => {
        closeModal();
        setNewSwapTransactionHash('');
        resetConfirmation();
    };

    const loginButton = (
        <button
            onClick={openModalWallet}
            className={styles.authenticate_button}
        >
            Connect Wallet
        </button>
    );

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
            flat
        />
    );

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
    const effectivePrice =
        parseFloat(priceImpact?.buyQty || '0') /
        parseFloat(priceImpact?.sellQty || '1');

    const isPriceInverted =
        (tradeData.isDenomBase && !isSellTokenBase) ||
        (!tradeData.isDenomBase && isSellTokenBase);

    const effectivePriceWithDenom = effectivePrice
        ? isPriceInverted
            ? 1 / effectivePrice
            : effectivePrice
        : undefined;

    const displayEffectivePriceString =
        !effectivePriceWithDenom ||
        effectivePriceWithDenom === Infinity ||
        effectivePriceWithDenom === 0
            ? '…'
            : effectivePriceWithDenom < 2
            ? effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // eslint-disable-next-line
    function handleParseReceipt(receipt: any) {
        const parseReceipt = JSON.parse(receipt);
        receiveReceiptHashes.push(parseReceipt?.transactionHash);
    }

    sessionReceipts.map((receipt) => handleParseReceipt(receipt));

    const confirmSwapModalProps = {
        poolPriceDisplay: poolPriceDisplay,
        tokenPair: { dataTokenA: tokenA, dataTokenB: tokenB },
        isDenomBase: tradeData.isDenomBase,
        baseTokenSymbol: tradeData.baseToken.symbol,
        quoteTokenSymbol: tradeData.quoteToken.symbol,
        priceImpact: priceImpact,
        initiateSwapMethod: initiateSwap,
        onClose: handleModalClose,
        newSwapTransactionHash: newSwapTransactionHash,
        txErrorCode: txErrorCode,
        txErrorMessage: txErrorMessage,
        showConfirmation: showConfirmation,
        setShowConfirmation: setShowConfirmation,
        resetConfirmation: resetConfirmation,
        slippageTolerancePercentage: slippageTolerancePercentage,
        effectivePrice: effectivePrice,
        isSellTokenBase: isSellTokenBase,
        bypassConfirm: bypassConfirm,
        toggleBypassConfirm: toggleBypassConfirm,
        sellQtyString: sellQtyString,
        buyQtyString: buyQtyString,
        setShowBypassConfirm: setShowBypassConfirm,
        setNewSwapTransactionHash: setNewSwapTransactionHash,
        currentPendingTransactionsArray: currentPendingTransactionsArray,
        showBypassConfirm,
        showExtraInfo: showExtraInfo,
        setShowExtraInfo: setShowExtraInfo,
    };

    // TODO:  @Emily refactor this Modal and later elements such that
    // TODO:  ... tradeData is passed to directly instead of tokenPair
    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal onClose={handleModalClose} title='Swap Confirmation'>
            <ConfirmSwapModal {...confirmSwapModalProps} />
        </Modal>
    ) : null;

    const relativeModalOrNull = isRelativeModalOpen ? (
        <RelativeModal onClose={closeRelativeModal} title='Relative Modal'>
            You are about to do something that will lose you a lot of money. If
            you think you are smarter than the awesome team that programmed
            this, press dismiss.
        </RelativeModal>
    ) : null;

    // calculate price of gas for swap
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei * 79079 * 1e-9 * ethMainnetUsdPrice;

            setSwapGasPriceinDollars(
                '$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= parseFloat(sellQtyString);

    const swapContainerStyle = pathname.startsWith('/swap')
        ? styles.swap_page_container
        : null;

    const swapPageStyle = pathname.startsWith('/swap')
        ? styles.swap_page
        : styles.scrollable_container;

    // -------------------------Swap SHARE FUNCTIONALITY---------------------------
    const [shareOptions, setShareOptions] = useState([
        { slug: 'first', name: 'Include Swap 1', checked: false },
        { slug: 'second', name: 'Include Swap 2', checked: false },
        { slug: 'third', name: 'Include Swap 3', checked: false },
        { slug: 'fourth', name: 'Include Swap 4', checked: false },
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

    const swapLink =
        'https://ambient-finance.netlify.app/swap/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C';

    const shareIconsContent = (
        <section>
            <a
                target='_blank'
                rel='noreferrer'
                href={`https://telegram.me/share/url?url=${swapLink}`}
                className={styles.share_icon}
            >
                Telegram{' '}
            </a>
            <a
                target='_blank'
                rel='noreferrer'
                href={`https://twitter.com/intent/tweet?text=${swapLink}`}
                className={styles.share_icon}
            >
                Twitter{' '}
            </a>
            <a
                target='_blank'
                rel='noreferrer'
                href={`https://www.facebook.com/sharer/sharer.php?u=${swapLink}`}
                className={styles.share_icon}
            >
                Facebook{' '}
            </a>
            <a
                target='_blank'
                rel='noreferrer'
                href=''
                className={styles.share_icon}
            >
                Discord{' '}
            </a>
        </section>
    );
    const shareOptionsDisplay = (
        <div className={styles.option_control_container}>
            {shareIconsContent}
            <div className={styles.options_control_display_container}>
                <p className={styles.control_title}>Options</p>
                <ul>
                    {shareOptions.map((option, idx) => (
                        <SwapShareControl
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

    // -------------------------END OF Swap SHARE FUNCTIONALITY---------------------------

    const currencyConverterProps = {
        tokenPairLocal: tokenPairLocal,
        crocEnv: crocEnv,
        poolExists: poolExists,
        isUserLoggedIn: isUserLoggedIn,
        provider: provider,
        slippageTolerancePercentage: slippageTolerancePercentage,
        setPriceImpact: setPriceImpact,
        tokenPair: tokenPair,
        tokensBank: importedTokens,
        priceImpact: priceImpact,
        setImportedTokens: setImportedTokens,
        chainId: chainId as string,
        isLiq: false,
        poolPriceDisplay: poolPriceDisplay,
        isTokenAPrimary: isTokenAPrimary,
        isSellTokenBase: isSellTokenBase,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        sellQtyString: sellQtyString,
        buyQtyString: buyQtyString,
        setSellQtyString: setSellQtyString,
        setBuyQtyString: setBuyQtyString,
        isWithdrawFromDexChecked: isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked: setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked: isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked: setIsSaveAsDexSurplusChecked,
        setSwapAllowed: setSwapAllowed,
        setSwapButtonErrorMessage: setSwapButtonErrorMessage,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        gasPriceInGwei: gasPriceInGwei,
        isSwapCopied: isSwapCopied,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: importedTokensPlus,
        addRecentToken: addRecentToken,
        getRecentTokens: getRecentTokens,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        acknowledgeToken: acknowledgeToken,
        openGlobalPopup: openGlobalPopup,
        lastBlockNumber: lastBlockNumber,
        dexBalancePrefs: dexBalancePrefs,
    };

    const handleSwapButtonClickWithBypass = () => {
        console.log('setting to true');
        setShowBypassConfirm(true);
        initiateSwap();
    };

    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    const priceImpactNum = !priceImpact?.percentChange
        ? undefined
        : Math.abs(priceImpact.percentChange) * 100;

    const priceImpactString = !priceImpactNum
        ? '…'
        : priceImpactNum >= 100
        ? priceImpactNum.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
          })
        : priceImpactNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const priceImpactWarningOrNull =
        priceImpactNum && priceImpactNum > 2 ? (
            <div className={styles.price_impact}>
                <div className={styles.extra_row}>
                    <div className={styles.align_center}>
                        <div>Price Impact Warning</div>
                        <TooltipComponent
                            title='Difference Between Current (Spot) Price and Final Price'
                            placement='bottom'
                        />
                    </div>
                    <div
                        className={styles.data}
                        style={{
                            color: '#f6385b',
                        }}
                    >
                        {priceImpactString}%
                    </div>
                </div>
            </div>
        ) : null;

    return (
        <section data-testid={'swap'} className={swapPageStyle}>
            {props.isTutorialMode && (
                <div className={styles.tutorial_button_container}>
                    <button
                        className={styles.tutorial_button}
                        onClick={() => setIsTutorialEnabled(true)}
                    >
                        Tutorial Mode
                    </button>
                </div>
            )}
            <div className={`${swapContainerStyle}`}>
                <ContentContainer
                    isOnTradeRoute={isOnTradeRoute}
                    padding={isOnTradeRoute ? '0 1rem' : '1rem'}
                >
                    <SwapHeader
                        swapSlippage={swapSlippage}
                        isPairStable={isPairStable}
                        isOnTradeRoute={isOnTradeRoute}
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
                        <CurrencyConverter {...currencyConverterProps} />
                    </motion.div>
                    <ExtraInfo
                        account={account}
                        tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                        priceImpact={priceImpact}
                        isTokenABase={isSellTokenBase}
                        displayEffectivePriceString={
                            displayEffectivePriceString
                        }
                        poolPriceDisplay={poolPriceDisplay || 0}
                        slippageTolerance={slippageTolerancePercentage}
                        liquidityProviderFee={tradeData.liquidityFee}
                        quoteTokenIsBuy={true}
                        swapGasPriceinDollars={swapGasPriceinDollars}
                        didUserFlipDenom={tradeData.didUserFlipDenom}
                        isDenomBase={tradeData.isDenomBase}
                        isOnTradeRoute={isOnTradeRoute}
                    />
                    {isUserLoggedIn === undefined ? null : isUserLoggedIn ===
                      true ? (
                        poolExists &&
                        !isTokenAAllowanceSufficient &&
                        parseFloat(sellQtyString) > 0 &&
                        sellQtyString !== 'Infinity' ? (
                            approvalButton
                        ) : (
                            <>
                                {!showBypassConfirm ? (
                                    // user has hide confirmation modal off
                                    <SwapButton
                                        onClickFn={
                                            bypassConfirm
                                                ? handleSwapButtonClickWithBypass
                                                : openModal
                                        }
                                        isSwapConfirmationBypassEnabled={
                                            bypassConfirm
                                        }
                                        swapAllowed={swapAllowed}
                                        swapButtonErrorMessage={
                                            swapButtonErrorMessage
                                        }
                                        bypassConfirm={bypassConfirm}
                                    />
                                ) : (
                                    // user has hide confirmation modal on
                                    <BypassConfirmSwapButton
                                        {...confirmSwapModalProps}
                                    />
                                )}
                            </>
                        )
                    ) : (
                        loginButton
                    )}
                    {priceImpactWarningOrNull}
                </ContentContainer>
                {confirmSwapModalOrNull}
                {relativeModalOrNull}
            </div>
            <TutorialOverlay
                isTutorialEnabled={isTutorialEnabled}
                setIsTutorialEnabled={setIsTutorialEnabled}
                steps={swapTutorialSteps}
            />
        </section>
    );
}
