// START: Import React and Dongles
import { useState, Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
    CrocEnv,
    ChainSpec,
    CrocImpact,
    CrocPoolView,
} from '@crocswap-libs/sdk';
import FocusTrap from 'focus-trap-react';

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
import SwapShareControl from '../../components/Swap/SwapShareControl/SwapShareControl';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import BypassConfirmSwapButton from '../../components/Swap/SwapButton/BypassConfirmSwapButton';
import TutorialOverlay from '../../components/Global/TutorialOverlay/TutorialOverlay';
import { swapTutorialSteps } from '../../utils/tutorial/Swap';
import { SlippageMethodsIF } from '../../App/hooks/useSlippage';
import { allDexBalanceMethodsIF } from '../../App/hooks/useExchangePrefs';
import TooltipComponent from '../../components/Global/TooltipComponent/TooltipComponent';
import { allSkipConfirmMethodsIF } from '../../App/hooks/useSkipConfirm';
import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../constants';
import { useUrlParams } from '../../utils/hooks/useUrlParams';
import { ackTokensMethodsIF } from '../../App/hooks/useAckTokens';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    isUserLoggedIn: boolean | undefined;
    account: string | undefined;
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
    isTutorialMode: boolean;
    setIsTutorialMode: Dispatch<SetStateAction<boolean>>;
    tokenPairLocal: string[] | null;
    dexBalancePrefs: allDexBalanceMethodsIF;
    bypassConfirm: allSkipConfirmMethodsIF;
    ackTokens: ackTokensMethodsIF;
    chainData: ChainSpec;
    pool: CrocPoolView | undefined;
}

export default function Swap(props: propsIF) {
    const {
        pool,
        crocEnv,
        isUserLoggedIn,
        account,
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
        openModalWallet,
        poolExists,
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
        openGlobalPopup,
        lastBlockNumber,
        tokenPairLocal,
        dexBalancePrefs,
        bypassConfirm,
        ackTokens,
        chainData,
    } = props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();
    useUrlParams(chainId, provider);

    // this apparently different from the `bypassConfirm` that I am working with
    // it should possibly be renamed something different or better documented
    const [showBypassConfirm, setShowBypassConfirm] = useState(false);
    const [showExtraInfo, setShowExtraInfo] = useState(false);

    const receiptData = useAppSelector((state) => state.receiptData);

    const sessionReceipts = receiptData.sessionReceipts;

    const pendingTransactions = receiptData.pendingTransactions;
    const receiveReceiptHashes: Array<string> = [];

    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receiveReceiptHashes.includes(hash),
    );

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
        useState<boolean>(false);
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
            txErrorCode === '' &&
            bypassConfirm.swap.isEnabled
        ) {
            setNewSwapTransactionHash('');
            setShowBypassConfirm(false);
        }
    }, [
        currentPendingTransactionsArray.length,
        isWaitingForWallet,
        txErrorCode === '',
        bypassConfirm.swap.isEnabled,
    ]);

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');
        setTxErrorMessage('');
    };

    useEffect(() => {
        setNewSwapTransactionHash('');
        setShowBypassConfirm(false);
    }, [baseToken.address + quoteToken.address]);

    async function initiateSwap() {
        resetConfirmation();
        setIsWaitingForWallet(true);
        if (!crocEnv) {
            location.reload();
            return;
        }

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
            setTxErrorMessage(error?.message);
            setIsWaitingForWallet(false);
        }

        const newSwapCacheEndpoint = GRAPHCACHE_URL + '/new_swap?';

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
            style={isOnTradeRoute ? { marginBottom: '40px' } : undefined}
        >
            Connect Wallet
        </button>
    );

    const approvalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Approve ${tokenPair.dataTokenA.symbol}`
                    : `${tokenPair.dataTokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenA.address, tokenA.symbol);
            }}
            flat
        />
    );

    const approve = async (tokenAddress: string, tokenSymbol: string) => {
        if (!crocEnv) {
            location.reload();
            return;
        }
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
        pool: pool,
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
        sellQtyString: sellQtyString,
        buyQtyString: buyQtyString,
        setShowBypassConfirm: setShowBypassConfirm,
        setNewSwapTransactionHash: setNewSwapTransactionHash,
        currentPendingTransactionsArray: currentPendingTransactionsArray,
        showBypassConfirm,
        showExtraInfo: showExtraInfo,
        setShowExtraInfo: setShowExtraInfo,
        bypassConfirm: bypassConfirm,
        lastBlockNumber: lastBlockNumber,
    };

    // TODO:  @Emily refactor this Modal and later elements such that
    // TODO:  ... tradeData is passed to directly instead of tokenPair
    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal
            onClose={handleModalClose}
            title='Swap Confirmation'
            centeredTitle
        >
            <ConfirmSwapModal {...confirmSwapModalProps} />
        </Modal>
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

    const [
        tokenAQtyCoveredByWalletBalance,
        setTokenAQtyCoveredByWalletBalance,
    ] = useState<number>(0);

    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= tokenAQtyCoveredByWalletBalance;

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
                aria-label='telegram'
            >
                Telegram{' '}
            </a>
            <a
                target='_blank'
                rel='noreferrer'
                href={`https://twitter.com/intent/tweet?text=${swapLink}`}
                className={styles.share_icon}
                aria-label='twitter'
            >
                Twitter{' '}
            </a>
            <a
                target='_blank'
                rel='noreferrer'
                href={`https://www.facebook.com/sharer/sharer.php?u=${swapLink}`}
                className={styles.share_icon}
                aria-label='facebook'
            >
                Facebook{' '}
            </a>
            <a
                target='_blank'
                rel='noreferrer'
                href=''
                className={styles.share_icon}
                aria-label='discord'
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
        priceImpact: priceImpact,
        chainId: chainId,
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
        openGlobalPopup: openGlobalPopup,
        lastBlockNumber: lastBlockNumber,
        dexBalancePrefs: dexBalancePrefs,
        setTokenAQtyCoveredByWalletBalance: setTokenAQtyCoveredByWalletBalance,
        ackTokens: ackTokens,
    };

    const handleSwapButtonClickWithBypass = () => {
        IS_LOCAL_ENV && console.debug('setting to true');
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

    // logic to determine if a given token is acknowledged or on a list
    const isTokenUnknown = (tkn: TokenIF): boolean => {
        const isAckd: boolean = ackTokens.check(tkn.address, chainId);
        const isListed: boolean = verifyToken(tkn.address, chainId);
        return !isAckd && !isListed;
    };

    // values if either token needs to be confirmed before transacting
    const needConfirmTokenA: boolean = isTokenUnknown(tokenPair.dataTokenA);
    const needConfirmTokenB: boolean = isTokenUnknown(tokenPair.dataTokenB);

    // token acknowledgement needed message (empty string if none needed)
    const ackTokenMessage = useMemo<string>(() => {
        // !Important   any changes to verbiage in this code block must be approved
        // !Important   ... by Doug, get in writing by email or request specific
        // !Important   ... review for a pull request on GitHub
        let text: string;
        if (needConfirmTokenA && needConfirmTokenB) {
            text = `The tokens ${
                tokenPair.dataTokenA.symbol || tokenPair.dataTokenA.name
            } and ${
                tokenPair.dataTokenB.symbol || tokenPair.dataTokenB.name
            } are not listed on any major reputable token list. Please be sure these are the actual tokens you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenA) {
            text = `The token ${
                tokenPair.dataTokenA.symbol || tokenPair.dataTokenA.name
            } is not listed on any major reputable token list. Please be sure this is the actual token you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenB) {
            text = `The token ${
                tokenPair.dataTokenB.symbol || tokenPair.dataTokenB.name
            } is not listed on any major reputable token list. Please be sure this is the actual token you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else {
            text = '';
        }
        return text;
    }, [needConfirmTokenA, needConfirmTokenB]);
    const formattedAckTokenMessage = ackTokenMessage.replace(
        /\b(not)\b/g,
        '<span style="color: var(--negative); text-transform: uppercase;">$1</span>',
    );

    // value showing if no acknowledgement is necessary
    const areBothAckd: boolean = !needConfirmTokenA && !needConfirmTokenB;

    // logic to acknowledge one or both tokens as necessary
    const ackAsNeeded = (): void => {
        needConfirmTokenA && ackTokens.acknowledge(tokenPair.dataTokenA);
        needConfirmTokenB && ackTokens.acknowledge(tokenPair.dataTokenB);
    };

    const liquidityProviderFeeString = (
        tradeData.liquidityFee * 100
    ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <FocusTrap
            focusTrapOptions={{
                clickOutsideDeactivates: true,
            }}
        >
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
                            tokenPair={{
                                dataTokenA: tokenA,
                                dataTokenB: tokenB,
                            }}
                            priceImpact={priceImpact}
                            isTokenABase={isSellTokenBase}
                            displayEffectivePriceString={
                                displayEffectivePriceString
                            }
                            poolPriceDisplay={poolPriceDisplay || 0}
                            slippageTolerance={slippageTolerancePercentage}
                            liquidityProviderFeeString={
                                liquidityProviderFeeString
                            }
                            quoteTokenIsBuy={true}
                            swapGasPriceinDollars={swapGasPriceinDollars}
                            didUserFlipDenom={tradeData.didUserFlipDenom}
                            isDenomBase={tradeData.isDenomBase}
                            isOnTradeRoute={isOnTradeRoute}
                        />
                        {isUserLoggedIn ===
                        undefined ? null : isUserLoggedIn === true ? (
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
                                                areBothAckd
                                                    ? bypassConfirm.swap
                                                          .isEnabled
                                                        ? handleSwapButtonClickWithBypass
                                                        : openModal
                                                    : ackAsNeeded
                                            }
                                            swapAllowed={
                                                swapAllowed &&
                                                sellQtyString !== '' &&
                                                buyQtyString !== ''
                                            }
                                            swapButtonErrorMessage={
                                                swapButtonErrorMessage
                                            }
                                            bypassConfirmSwap={
                                                bypassConfirm.swap
                                            }
                                            areBothAckd={areBothAckd}
                                        />
                                    ) : (
                                        // user has hide confirmation modal on
                                        <BypassConfirmSwapButton
                                            {...confirmSwapModalProps}
                                        />
                                    )}
                                    {ackTokenMessage && (
                                        <p
                                            className={styles.acknowledge_text}
                                            dangerouslySetInnerHTML={{
                                                __html: formattedAckTokenMessage,
                                            }}
                                        ></p>
                                    )}
                                    <div
                                        className={
                                            styles.acknowledge_etherscan_links
                                        }
                                    >
                                        {needConfirmTokenA && (
                                            <a
                                                href={
                                                    chainData.blockExplorer +
                                                    'token/' +
                                                    tokenPair.dataTokenA.address
                                                }
                                                rel={'noopener noreferrer'}
                                                target='_blank'
                                                aria-label={`approve ${tokenA.symbol}`}
                                            >
                                                {tokenPair.dataTokenA.symbol ||
                                                    tokenPair.dataTokenA
                                                        .name}{' '}
                                                <FiExternalLink />
                                            </a>
                                        )}
                                        {needConfirmTokenB && (
                                            <a
                                                href={
                                                    chainData.blockExplorer +
                                                    'token/' +
                                                    tokenPair.dataTokenB.address
                                                }
                                                rel={'noopener noreferrer'}
                                                target='_blank'
                                                aria-label={`approve ${tokenB.symbol}`}
                                            >
                                                {tokenPair.dataTokenB.symbol ||
                                                    tokenPair.dataTokenB
                                                        .name}{' '}
                                                <FiExternalLink />
                                            </a>
                                        )}
                                    </div>
                                </>
                            )
                        ) : (
                            loginButton
                        )}
                        {priceImpactWarningOrNull}
                    </ContentContainer>
                    {confirmSwapModalOrNull}
                    {isRelativeModalOpen && (
                        <RelativeModal
                            onClose={closeRelativeModal}
                            title='Relative Modal'
                        >
                            You are about to do something that will lose you a
                            lot of money. If you think you are smarter than the
                            awesome team that programmed this, press dismiss.
                        </RelativeModal>
                    )}
                </div>
                <TutorialOverlay
                    isTutorialEnabled={isTutorialEnabled}
                    setIsTutorialEnabled={setIsTutorialEnabled}
                    steps={swapTutorialSteps}
                />
            </section>
        </FocusTrap>
    );
}
