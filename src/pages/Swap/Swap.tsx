// START: Import React and Dongles
import { useState, useEffect, useMemo, useContext, memo } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CrocImpact } from '@crocswap-libs/sdk';
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

// START: Import Local Files
import styles from './Swap.module.css';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { useAppSelector, useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { useModal } from '../../components/Global/Modal/useModal';
import { useRelativeModal } from '../../components/Global/RelativeModal/useRelativeModal';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
} from '../../utils/state/receiptDataSlice';
import { FiExternalLink } from 'react-icons/fi';
import BypassConfirmSwapButton from '../../components/Swap/SwapButton/BypassConfirmSwapButton';
import TutorialOverlay from '../../components/Global/TutorialOverlay/TutorialOverlay';
import { swapTutorialSteps } from '../../utils/tutorial/Swap';
import TooltipComponent from '../../components/Global/TooltipComponent/TooltipComponent';
import { IS_LOCAL_ENV } from '../../constants';
import { PoolContext } from '../../contexts/PoolContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { useProvider } from 'wagmi';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';
import { TokenContext } from '../../contexts/TokenContext';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { isStablePair } from '../../utils/data/stablePairs';
import NoTokenIcon from '../../components/Global/NoTokenIcon/NoTokenIcon';
import { VscClose } from 'react-icons/vsc';
import { formSlugForPairParams } from '../../App/functions/urlSlugs';
import { getPriceImpactString } from '../../App/functions/swap/getPriceImpactString';
import { useTradeData } from '../../App/hooks/useTradeData';

interface propsIF {
    isOnTradeRoute?: boolean;
}

function Swap(props: propsIF) {
    const { isOnTradeRoute } = props;
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const {
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);
    const {
        crocEnv,
        chainData: { chainId, blockExplorer },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { isPoolInitialized } = useContext(PoolContext);
    const { tokens } = useContext(TokenContext);
    const {
        isTokenABase: isSellTokenBase,
        setRecheckTokenAApproval,
        tokenAAllowance,
    } = useContext(TradeTokenContext);
    const { swapSlippage, dexBalSwap, bypassConfirmSwap } = useContext(
        UserPreferenceContext,
    );

    const provider = useProvider();

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    useUrlParams(['chain', 'tokenA', 'tokenB'], tokens, chainId, provider);

    // this apparently different from the `bypassConfirm` that I am working with
    // it should possibly be renamed something different or better documented
    const [showBypassConfirm, setShowBypassConfirm] = useState(false);
    const [showExtraInfo, setShowExtraInfo] = useState(false);
    const [isLiquidityInsufficient, setIsLiquidityInsufficient] =
        useState<boolean>(false);

    const receiptData = useAppSelector((state) => state.receiptData);

    const sessionReceipts = receiptData.sessionReceipts;

    const pendingTransactions = receiptData.pendingTransactions;
    let receiveReceiptHashes: Array<string> = [];

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

    const slippageTolerancePercentage = isStablePair(
        tokenA.address,
        tokenB.address,
        chainId,
    )
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
        useState<boolean>(dexBalSwap.outputToDexBal.isEnabled);

    const [swapButtonErrorMessage, setSwapButtonErrorMessage] =
        useState<string>('');
    const isTokenAPrimary = tradeData.isTokenAPrimary;
    const [newSwapTransactionHash, setNewSwapTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
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

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');
    };

    useEffect(() => {
        setNewSwapTransactionHash('');
        setShowBypassConfirm(false);
    }, [baseToken.address + quoteToken.address]);

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

    const loginButton = (
        <button
            onClick={openWagmiModal}
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
                    ? `Approve ${tokenA.symbol}`
                    : `${tokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenA.address, tokenA.symbol);
            }}
            flat
        />
    );

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

    useEffect(() => {
        receiveReceiptHashes = sessionReceipts.map(
            (receipt) => JSON.parse(receipt)?.transactionHash,
        );
    }, [sessionReceipts]);

    const confirmSwapModalProps = {
        tokenPair: { dataTokenA: tokenA, dataTokenB: tokenB },
        isDenomBase: tradeData.isDenomBase,
        baseTokenSymbol: tradeData.baseToken.symbol,
        quoteTokenSymbol: tradeData.quoteToken.symbol,
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
            const averageSwapCostInGasDrops = 106000;
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageSwapCostInGasDrops *
                1e-9 *
                ethMainnetUsdPrice;

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

    // -------------------------END OF Swap SHARE FUNCTIONALITY---------------------------

    const currencyConverterProps = {
        isLiquidityInsufficient: isLiquidityInsufficient,
        setIsLiquidityInsufficient: setIsLiquidityInsufficient,
        provider: provider,
        slippageTolerancePercentage: slippageTolerancePercentage,
        setPriceImpact: setPriceImpact,
        priceImpact: priceImpact,
        isLiq: false,
        isTokenAPrimary: isTokenAPrimary,
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
        setTokenAQtyCoveredByWalletBalance: setTokenAQtyCoveredByWalletBalance,
    };

    const {
        tutorial: { isActive: isTutorialActive },
    } = useContext(AppStateContext);

    const handleSwapButtonClickWithBypass = () => {
        IS_LOCAL_ENV && console.debug('setting to true');
        setShowBypassConfirm(true);
        initiateSwap();
    };

    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    const priceImpactNum = !priceImpact?.percentChange
        ? undefined
        : Math.abs(priceImpact.percentChange) * 100;

    const liquidityInsufficientWarningOrNull = isLiquidityInsufficient ? (
        <div className={styles.price_impact}>
            <div className={styles.extra_row}>
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
        </div>
    ) : null;

    const priceImpactWarningOrNull =
        !isLiquidityInsufficient && priceImpactNum && priceImpactNum > 2 ? (
            <div className={styles.price_impact}>
                <div className={styles.extra_row}>
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
            </div>
        ) : null;

    // values if either token needs to be confirmed before transacting
    const needConfirmTokenA = !tokens.verifyToken(tokenA.address);
    const needConfirmTokenB = !tokens.verifyToken(tokenB.address);

    // token acknowledgement needed message (empty string if none needed)
    const ackTokenMessage = useMemo<string>(() => {
        // !Important   any changes to verbiage in this code block must be approved
        // !Important   ... by Doug, get in writing by email or request specific
        // !Important   ... review for a pull request on GitHub
        let text: string;
        if (needConfirmTokenA && needConfirmTokenB) {
            text = `The tokens ${tokenA.symbol || tokenA.name} and ${
                tokenB.symbol || tokenB.name
            } are not listed on any major reputable token list. Please be sure these are the actual tokens you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenA) {
            text = `The token ${
                tokenA.symbol || tokenA.name
            } is not listed on any major reputable token list. Please be sure this is the actual token you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenB) {
            text = `The token ${
                tokenB.symbol || tokenB.name
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
        needConfirmTokenA && tokens.ackToken(tokenA);
        needConfirmTokenB && tokens.ackToken(tokenB);
    };

    const liquidityProviderFeeString = (
        tradeData.liquidityFee * 100
    ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const initLinkPath =
        '/initpool/' +
        formSlugForPairParams(chainId, tokenA.address, tokenB.address);

    const showPoolNotInitializedContent = isPoolInitialized === false;

    const navigate = useNavigate();

    const poolNotInitializedContent = showPoolNotInitializedContent ? (
        <div className={styles.pool_not_initialialized_container}>
            <div className={styles.pool_not_initialialized_content}>
                <div className={styles.close_init} onClick={() => navigate(-1)}>
                    <VscClose size={25} />
                </div>
                <h2>This pool has not been initialized.</h2>
                <h3>Do you want to initialize it?</h3>
                <Link to={initLinkPath} className={styles.initialize_link}>
                    Initialize Pool
                    {tokenA.logoURI ? (
                        <img src={tokenA.logoURI} alt={tokenA.symbol} />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={tokenA.symbol?.charAt(0)}
                            width='20px'
                        />
                    )}
                    {tokenB.logoURI ? (
                        <img src={tokenB.logoURI} alt={tokenB.symbol} />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={tokenB.symbol?.charAt(0)}
                            width='20px'
                        />
                    )}
                </Link>
                <button
                    className={styles.no_thanks}
                    onClick={() => navigate(-1)}
                >
                    No, take me back.
                </button>
            </div>
        </div>
    ) : null;

    return (
        <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
            <section data-testid={'swap'} className={swapPageStyle}>
                {isTutorialActive && (
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
                    {poolNotInitializedContent}
                    <ContentContainer
                        isOnTradeRoute={isOnTradeRoute}
                        padding={isOnTradeRoute ? '0 1rem' : '1rem'}
                    >
                        <SwapHeader isOnTradeRoute={isOnTradeRoute} />
                        {navigationMenu}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <CurrencyConverter {...currencyConverterProps} />
                        </motion.div>
                        <ExtraInfo
                            priceImpact={priceImpact}
                            effectivePriceWithDenom={effectivePriceWithDenom}
                            slippageTolerance={slippageTolerancePercentage}
                            liquidityProviderFeeString={
                                liquidityProviderFeeString
                            }
                            swapGasPriceinDollars={swapGasPriceinDollars}
                            isQtyEntered={tradeData?.primaryQuantity !== ''}
                        />
                        {isUserConnected ===
                        undefined ? null : isUserConnected === true ? (
                            isPoolInitialized &&
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
                                                    ? bypassConfirmSwap.isEnabled
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
                                                bypassConfirmSwap
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
                                                    blockExplorer +
                                                    'token/' +
                                                    tokenA.address
                                                }
                                                rel={'noopener noreferrer'}
                                                target='_blank'
                                                aria-label={`approve ${tokenA.symbol}`}
                                            >
                                                {tokenA.symbol || tokenA.name}{' '}
                                                <FiExternalLink />
                                            </a>
                                        )}
                                        {needConfirmTokenB && (
                                            <a
                                                href={
                                                    blockExplorer +
                                                    'token/' +
                                                    tokenB.address
                                                }
                                                rel={'noopener noreferrer'}
                                                target='_blank'
                                                aria-label={`approve ${tokenB.symbol}`}
                                            >
                                                {tokenB.symbol || tokenB.name}{' '}
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
                        {liquidityInsufficientWarningOrNull}
                    </ContentContainer>
                    {confirmSwapModalOrNull}
                    {isRelativeModalOpen && (
                        <RelativeModal onClose={closeRelativeModal}>
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

export default memo(Swap);
