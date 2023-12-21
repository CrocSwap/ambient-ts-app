// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState, memo } from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';
import {
    CrocPositionView,
    CrocReposition,
    toDisplayPrice,
} from '@crocswap-libs/sdk';

// START: Import JSX Components
import RepositionPriceInfo from '../../../components/Trade/Reposition/RepositionPriceInfo/RepositionPriceInfo';
import ConfirmRepositionModal from '../../../components/Trade/Reposition/ConfirmRepositionModal/ConfirmRepositionModal';
import Button from '../../../components/Form/Button';
// START: Import Other Local Files
import styles from './Reposition.module.css';
import { PositionIF, PositionServerIF } from '../../../ambient-utils/types';
import { getPinnedPriceValuesFromTicks } from '../Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';
import useDebounce from '../../../App/hooks/useDebounce';
import {
    GCGO_OVERRIDE_URL,
    IS_LOCAL_ENV,
} from '../../../ambient-utils/constants';
import { FiExternalLink } from 'react-icons/fi';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { RangeContext } from '../../../contexts/RangeContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import {
    getPositionData,
    getFormattedNumber,
} from '../../../ambient-utils/dataLayer';
import { TokenContext } from '../../../contexts/TokenContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { useModal } from '../../../components/Global/Modal/useModal';
import SubmitTransaction from '../../../components/Trade/TradeModules/SubmitTransaction/SubmitTransaction';
import RangeWidth from '../../../components/Form/RangeWidth/RangeWidth';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import {
    GAS_DROPS_ESTIMATE_REPOSITION,
    NUM_GWEI_IN_WEI,
} from '../../../ambient-utils/constants/';
import { ReceiptContext } from '../../../contexts/ReceiptContext';
import MultiContentComponent from '../../../components/Global/MultiStepTransaction/MultiContentComponent';
import RepositionSkeleton from './RepositionSkeleton';
import TransactionSettingsModal from '../../../components/Global/TransactionSettingsModal/TransactionSettingsModal';

function Reposition() {
    // current URL parameter string
    const { params } = useParams();

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const {
        crocEnv,
        activeNetwork,
        provider,
        chainData: { blockExplorer },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const { gasPriceInGwei, lastBlockNumber } = useContext(ChainDataContext);
    const { bypassConfirmRepo, repoSlippage } = useContext(
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
    const {
        simpleRangeWidth,
        setSimpleRangeWidth,
        setMaxRangePrice: setMaxPrice,
        setMinRangePrice: setMinPrice,
        setCurrentRangeInReposition,
        setRescaleRangeBoundariesWithSlider,
        setAdvancedMode,
    } = useContext(RangeContext);
    // eslint-disable-next-line
    const [isOpen, openModal, closeModal] = useModal();

    const [newRepositionTransactionHash, setNewRepositionTransactionHash] =
        useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [txErrorCode, setTxErrorCode] = useState('');
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setTxErrorCode('');
        setTxErrorMessage('');
        setNewRepositionTransactionHash('');
    };

    const isRepositionSent = newRepositionTransactionHash !== '';

    const locationHook = useLocation();
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    // navigate the user to the redirect URL path if locationHook.state has no data
    // ... this value will be truthy if the user arrived here by clicking a link
    // ... inside the app, but will be empty if they navigated manually to the path
    if (!locationHook.state) {
        // log in console if conditions are such to trigger an automatic URL redirect
        // this will help troubleshoot if we ever break functionality to link this page
        console.assert(
            locationHook.state,
            `Component Reposition() did not receive position data on load. Expected to receive a data object conforming to the shape of PositionIF in locationHook.state as returned by the uselocationHook() hook. Actual value received is <<${locationHook.state}>>. App will redirect to a page with generic functionality. Refer to Reposition.tsx for troubleshooting. This is expected behavior should a user navigate to the '/trade/reposition/:params' pathway any other way than clicking an in-app <Link/> element.`,
        );
        // IMPORTANT!! we must use this pathway, other implementations will not immediately
        // ... stop code in the rest of the file from running
        return <Navigate to={linkGenPool.getFullURL(params ?? '')} replace />;
    }

    const { position } = locationHook.state as { position: PositionIF };

    useEffect(() => {
        setCurrentRangeInReposition('');
        if (position) {
            setCurrentRangeInReposition(position.positionId);
        }
    }, [position]);

    const [concLiq, setConcLiq] = useState<string>('');

    const updateConcLiq = async () => {
        if (!crocEnv || !position) return;
        const pool = crocEnv.pool(position.base, position.quote);
        const pos = new CrocPositionView(pool, position.user);

        const liquidity = (
            await pos.queryRangePos(position.bidTick, position.askTick)
        ).liq.toString();

        setConcLiq(liquidity);
    };

    useEffect(() => {
        if (!crocEnv || !position) return;
        updateConcLiq();
    }, [crocEnv, lastBlockNumber, position?.positionId]);

    const {
        isDenomBase,
        tokenA,
        tokenB,
        isTokenABase,
        poolPriceNonDisplay: currentPoolPriceNonDisplay,
        deactivateConfirmation,
        activateConfirmation,
    } = useContext(TradeDataContext);

    const currentPoolPriceTick =
        Math.log(currentPoolPriceNonDisplay) / Math.log(1.0001);

    const isPositionInRange =
        position.bidTick <= currentPoolPriceTick &&
        currentPoolPriceTick <= position.askTick;

    const baseTokenDecimals = position.baseDecimals || 18;
    const quoteTokenDecimals = position.quoteDecimals || 18;

    const currentPoolDisplayPriceInBase =
        1 /
        toDisplayPrice(
            currentPoolPriceNonDisplay,
            baseTokenDecimals,
            quoteTokenDecimals,
        );

    const currentPoolDisplayPriceInQuote = toDisplayPrice(
        currentPoolPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const truncatedCurrentPoolDisplayPriceInBase = getFormattedNumber({
        value: currentPoolDisplayPriceInBase,
    });
    const truncatedCurrentPoolDisplayPriceInQuote = getFormattedNumber({
        value: currentPoolDisplayPriceInQuote,
    });

    const currentPoolPriceDisplay =
        currentPoolPriceNonDisplay === 0
            ? '...'
            : isDenomBase
            ? truncatedCurrentPoolDisplayPriceInBase
            : truncatedCurrentPoolDisplayPriceInQuote;

    const handleModalOpen = () => {
        resetConfirmation();
        // openModal();

        setActiveContent('confirmation');
        activateConfirmation('Reposition');
    };

    const handleModalClose = () => {
        resetConfirmation();
        closeModal();
    };

    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(10);

    const [pinnedLowTick, setPinnedLowTick] = useState(0);
    const [pinnedHighTick, setPinnedHighTick] = useState(0);
    const [isAmbient, setIsAmbient] = useState(false);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('set Advanced Mode to false');
        setAdvancedMode(false);
    }, []);

    useEffect(() => {
        setSimpleRangeWidth(10);
        setNewRepositionTransactionHash('');
    }, [position]);

    useEffect(() => {
        if (simpleRangeWidth !== rangeWidthPercentage) {
            setSimpleRangeWidth(simpleRangeWidth);
            setRangeWidthPercentage(simpleRangeWidth);
            const sliderInput = document.getElementById(
                'reposition-input-slider-range',
            ) as HTMLInputElement;
            if (sliderInput) sliderInput.value = simpleRangeWidth.toString();
        }
    }, [simpleRangeWidth]);

    useEffect(() => {
        if (simpleRangeWidth !== rangeWidthPercentage) {
            setSimpleRangeWidth(rangeWidthPercentage);
            setRangeWidthPercentage(rangeWidthPercentage);
        }
    }, [rangeWidthPercentage]);

    useEffect(() => {
        if (!position) {
            return;
        }
        const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
        const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

        const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
            isDenomBase,
            position.baseDecimals,
            position.quoteDecimals,
            lowTick,
            highTick,
            lookupChain(position.chainId).gridSize,
        );

        const isAmbient: boolean = rangeWidthPercentage === 100;

        if (isAmbient) {
            setIsAmbient(true);
            // (0,0) ticks is convention for full-width ambient
            setPinnedLowTick(0);
            setPinnedHighTick(0);
        } else {
            setIsAmbient(false);
            setPinnedLowTick(pinnedDisplayPrices.pinnedLowTick);
            setPinnedHighTick(pinnedDisplayPrices.pinnedHighTick);
        }
    }, [position.positionId, rangeWidthPercentage, currentPoolPriceTick]);

    function mintArgsForReposition(
        lowTick: number,
        highTick: number,
    ): 'ambient' | [number, number] {
        if (lowTick === 0 && highTick === 0) {
            return 'ambient';
        } else {
            return [lowTick, highTick];
        }
    }

    const sendRepositionTransaction = async () => {
        if (!crocEnv) return;
        let tx;
        setTxErrorCode('');
        setTxErrorMessage('');

        resetConfirmation();
        setShowConfirmation(true);

        try {
            const pool = crocEnv.pool(position.base, position.quote);
            const repo = new CrocReposition(pool, {
                liquidity: concLiq,
                burn: [position.bidTick, position.askTick],
                mint: mintArgsForReposition(pinnedLowTick, pinnedHighTick),
            });

            tx = await repo.rebal();
            setNewRepositionTransactionHash(tx?.hash);
            addPendingTx(tx?.hash);
            if (tx?.hash)
                addTransactionByType({
                    txHash: tx.hash,
                    txAction: 'Reposition',
                    txType: 'Range',
                    txDescription: `Reposition ${position.baseSymbol}+${position.quoteSymbol}`,
                    txDetails: {
                        baseAddress: position.base,
                        quoteAddress: position.quote,
                        poolIdx: poolIndex,
                        baseSymbol: position.baseSymbol,
                        quoteSymbol: position.quoteSymbol,
                        baseTokenDecimals: baseTokenDecimals,
                        quoteTokenDecimals: quoteTokenDecimals,
                        lowTick: pinnedLowTick,
                        highTick: pinnedHighTick,
                        gridSize: lookupChain(position.chainId).gridSize,
                    },
                });
            // We want the user to exit themselves
            // navigate(redirectPath, { replace: true });
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.data?.message);
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
                removePendingTx(error.hash);
                const newTransactionHash = error.replacement.hash;
                addPendingTx(newTransactionHash);

                updateTransactionHash(error.hash, error.replacement.hash);
                setNewRepositionTransactionHash(newTransactionHash);
                IS_LOCAL_ENV && console.debug({ newTransactionHash });
                receipt = error.receipt;
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }
        if (receipt) {
            addReceipt(JSON.stringify(receipt));
            removePendingTx(receipt.transactionHash);
        }
    };

    const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
        isDenomBase,
        position?.baseDecimals || 18,
        position?.quoteDecimals || 18,
        lowTick,
        highTick,
        lookupChain(position.chainId).gridSize,
    );

    const pinnedMinPriceDisplayTruncated =
        pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
    const pinnedMaxPriceDisplayTruncated =
        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;

    // -----------------------------TEMPORARY PLACE HOLDERS--------------

    const [minPriceDisplay, setMinPriceDisplay] = useState<string>(
        pinnedMinPriceDisplayTruncated || '0.00',
    );
    const [maxPriceDisplay, setMaxPriceDisplay] = useState<string>(
        pinnedMaxPriceDisplayTruncated || '0.00',
    );

    useEffect(() => {
        setMinPriceDisplay(pinnedMinPriceDisplayTruncated.toString());
        if (pinnedMinPriceDisplayTruncated !== undefined) {
            setMinPrice(parseFloat(pinnedMinPriceDisplayTruncated));
        }
    }, [pinnedMinPriceDisplayTruncated]);

    useEffect(() => {
        setMaxPriceDisplay(pinnedMaxPriceDisplayTruncated);
        setMaxPrice(parseFloat(pinnedMaxPriceDisplayTruncated));
    }, [pinnedMaxPriceDisplayTruncated]);

    const [currentBaseQtyDisplayTruncated, setCurrentBaseQtyDisplayTruncated] =
        useState<string>(position?.positionLiqBaseTruncated || '0.00');
    const [
        currentQuoteQtyDisplayTruncated,
        setCurrentQuoteQtyDisplayTruncated,
    ] = useState<string>(position?.positionLiqQuoteTruncated || '0.00');

    const positionStatsCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/position_stats?'
        : activeNetwork.graphCacheUrl + '/position_stats?';
    const poolIndex = lookupChain(position.chainId).poolIndex;

    const fetchCurrentCollateral = () => {
        fetch(
            positionStatsCacheEndpoint +
                new URLSearchParams({
                    user: position.user,
                    bidTick: position.bidTick.toString(),
                    askTick: position.askTick.toString(),
                    base: position.base,
                    quote: position.quote,
                    poolIdx: poolIndex.toString(),
                    chainId: position.chainId,
                    positionType: position.positionType,
                    addValue: 'true',
                    omitAPY: 'true',
                }),
        )
            .then((response) => response?.json())
            .then(async (json) => {
                if (!crocEnv || !provider || !json?.data) {
                    setCurrentBaseQtyDisplayTruncated('...');
                    setCurrentQuoteQtyDisplayTruncated('...');
                    return;
                }
                // temporarily skip ENS fetch
                const skipENSFetch = true;
                const positionStats = await getPositionData(
                    json.data as PositionServerIF,
                    tokens.tokenUniv,
                    crocEnv,
                    provider,
                    position.chainId,
                    lastBlockNumber,
                    cachedFetchTokenPrice,
                    cachedQuerySpotPrice,
                    cachedTokenDetails,
                    cachedEnsResolve,
                    skipENSFetch,
                );
                const liqBaseNum =
                    positionStats.positionLiqBaseDecimalCorrected;
                const liqQuoteNum =
                    positionStats.positionLiqQuoteDecimalCorrected;
                const liqBaseDisplay = getFormattedNumber({
                    value: liqBaseNum,
                });
                setCurrentBaseQtyDisplayTruncated(liqBaseDisplay || '0.00');

                const liqQuoteDisplay = getFormattedNumber({
                    value: liqQuoteNum,
                });
                setCurrentQuoteQtyDisplayTruncated(liqQuoteDisplay || '0.00');
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchCurrentCollateral();
    }, [lastBlockNumber, JSON.stringify(position), !!crocEnv, !!provider]);

    const [newBaseQtyDisplay, setNewBaseQtyDisplay] = useState<string>('...');
    const [newQuoteQtyDisplay, setNewQuoteQtyDisplay] = useState<string>('...');

    const debouncedLowTick = useDebounce(pinnedLowTick, 500);
    const debouncedHighTick = useDebounce(pinnedHighTick, 500);

    const pinnedMinPriceDisplayTruncatedInBase = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                true,
                baseTokenDecimals,
                quoteTokenDecimals,
                debouncedLowTick,
                debouncedHighTick,
                lookupChain(position.chainId).gridSize,
            ).pinnedMinPriceDisplayTruncated,
        [
            baseTokenDecimals,
            quoteTokenDecimals,
            debouncedLowTick,
            debouncedHighTick,
        ],
    );

    const pinnedMinPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseTokenDecimals,
                quoteTokenDecimals,
                debouncedLowTick,
                debouncedHighTick,
                lookupChain(position.chainId).gridSize,
            ).pinnedMinPriceDisplayTruncated,
        [
            baseTokenDecimals,
            quoteTokenDecimals,
            debouncedLowTick,
            debouncedHighTick,
        ],
    );

    const pinnedMaxPriceDisplayTruncatedInBase = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                true,
                baseTokenDecimals,
                quoteTokenDecimals,
                debouncedLowTick,
                debouncedHighTick,
                lookupChain(position.chainId).gridSize,
            ).pinnedMaxPriceDisplayTruncated,
        [
            baseTokenDecimals,
            quoteTokenDecimals,
            debouncedLowTick,
            debouncedHighTick,
        ],
    );

    const pinnedMaxPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseTokenDecimals,
                quoteTokenDecimals,
                debouncedLowTick,
                debouncedHighTick,
                lookupChain(position.chainId).gridSize,
            ).pinnedMaxPriceDisplayTruncated,
        [
            baseTokenDecimals,
            quoteTokenDecimals,
            debouncedLowTick,
            debouncedHighTick,
        ],
    );

    useEffect(() => {
        if (
            !crocEnv ||
            !debouncedLowTick ||
            !debouncedHighTick ||
            !position.base ||
            !position.quote ||
            !concLiq
        ) {
            return;
        }
        setNewBaseQtyDisplay('...');
        setNewQuoteQtyDisplay('...');
        const pool = crocEnv.pool(position.base, position.quote);

        const repo = new CrocReposition(pool, {
            liquidity: concLiq,
            burn: [position.bidTick, position.askTick],
            mint: mintArgsForReposition(debouncedLowTick, debouncedHighTick),
        });

        setNewBaseQtyDisplay('...');
        setNewQuoteQtyDisplay('...');
        repo.postBalance().then(([base, quote]: [number, number]) => {
            setNewBaseQtyDisplay(getFormattedNumber({ value: base }));
            setNewQuoteQtyDisplay(getFormattedNumber({ value: quote }));
        });
    }, [
        crocEnv,
        concLiq,
        debouncedLowTick, // Debounce because effect involves on-chain call
        debouncedHighTick,
        currentPoolPriceTick,
    ]);

    const [rangeGasPriceinDollars, setRangeGasPriceinDollars] = useState<
        string | undefined
    >();

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                GAS_DROPS_ESTIMATE_REPOSITION *
                NUM_GWEI_IN_WEI *
                ethMainnetUsdPrice;

            setRangeGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const txUrlOnBlockExplorer = `${blockExplorer}tx/${newRepositionTransactionHash}`;

    const etherscanButton = (
        <a
            href={txUrlOnBlockExplorer}
            target='_blank'
            rel='noreferrer'
            className={styles.view_etherscan}
            aria-label='view on etherscan'
        >
            View on Etherscan
            <FiExternalLink size={12} color='var(--text1)' />
        </a>
    );

    const [activeContent, setActiveContent] = useState('main');
    const handleSetActiveContent = (newActiveContent: string) => {
        setActiveContent(newActiveContent);
    };
    const repositionSteps = [
        { label: 'Sign transaction' },
        {
            label: 'Submitting Liquidity',
        },
    ];
    const [activeStep, setActiveStep] = useState(0);
    // active step 0 is sign transaction loading
    // active step 1 is 'swapping something for something loading'
    // active step 2 is all completed
    const [showStepperComponent, setShowStepperComponent] = useState(false);

    const isTransactionApproved = newRepositionTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const isTransactionPending = !(
        isTransactionApproved ||
        isTransactionDenied ||
        isTransactionException
    );

    const isTransactionConfirmed =
        isTransactionApproved &&
        !pendingTransactions.includes(newRepositionTransactionHash);

    useEffect(() => {
        setActiveStep(0);
        if (isTransactionApproved) {
            setActiveStep(1);
        }
        if (isTransactionConfirmed) {
            setActiveStep(2);
        }
    }, [isTransactionApproved, isTransactionPending, isTransactionConfirmed]);

    const repositionSkeletonProps = {
        setRangeWidthPercentage,
        positionHash: position.firstMintTx,
        resetTxHash: () => setNewRepositionTransactionHash(''),
        activeContent,
        handleSetActiveContent,
        handleReset: resetConfirmation,
        showStepperComponent,
        setShowStepperComponent,
    };

    const settingsContent = (
        <RepositionSkeleton {...repositionSkeletonProps}>
            <TransactionSettingsModal
                module='Reposition'
                slippage={repoSlippage}
                bypassConfirm={bypassConfirmRepo}
                onClose={closeModal}
            />
        </RepositionSkeleton>
    );

    const mainContent = (
        <RepositionSkeleton {...repositionSkeletonProps}>
            <div className={styles.repositionContainer}>
                <div className={styles.reposition_content}>
                    <RangeWidth
                        rangeWidthPercentage={rangeWidthPercentage}
                        setRangeWidthPercentage={setRangeWidthPercentage}
                        setRescaleRangeBoundariesWithSlider={
                            setRescaleRangeBoundariesWithSlider
                        }
                    />
                    <RepositionPriceInfo
                        position={position}
                        currentPoolPriceDisplay={currentPoolPriceDisplay}
                        currentPoolPriceTick={currentPoolPriceTick}
                        rangeWidthPercentage={rangeWidthPercentage}
                        minPriceDisplay={minPriceDisplay}
                        maxPriceDisplay={maxPriceDisplay}
                        currentBaseQtyDisplayTruncated={
                            currentBaseQtyDisplayTruncated
                        }
                        currentQuoteQtyDisplayTruncated={
                            currentQuoteQtyDisplayTruncated
                        }
                        newBaseQtyDisplay={newBaseQtyDisplay}
                        newQuoteQtyDisplay={newQuoteQtyDisplay}
                        rangeGasPriceinDollars={rangeGasPriceinDollars}
                        currentMinPrice={
                            isDenomBase
                                ? position?.lowRangeDisplayInBase
                                : position?.lowRangeDisplayInQuote
                        }
                        currentMaxPrice={
                            isDenomBase
                                ? position?.highRangeDisplayInBase
                                : position?.highRangeDisplayInQuote
                        }
                    />
                    <div className={styles.button_container}>
                        {bypassConfirmRepo.isEnabled && showConfirmation ? (
                            <SubmitTransaction
                                type='Reposition'
                                newTransactionHash={
                                    newRepositionTransactionHash
                                }
                                txErrorCode={txErrorCode}
                                txErrorMessage={txErrorMessage}
                                sendTransaction={sendRepositionTransaction}
                                resetConfirmation={resetConfirmation}
                                transactionPendingDisplayString={`Repositioning transaction with ${tokenA.symbol} and ${tokenB.symbol}`}
                            />
                        ) : (
                            <Button
                                idForDOM='confirm_reposition_button'
                                title={
                                    isRepositionSent
                                        ? 'Reposition Sent'
                                        : isPositionInRange
                                        ? 'Position Currently In Range'
                                        : bypassConfirmRepo.isEnabled
                                        ? 'Reposition'
                                        : 'Confirm'
                                }
                                action={
                                    bypassConfirmRepo.isEnabled
                                        ? sendRepositionTransaction
                                        : handleModalOpen
                                }
                                disabled={isRepositionSent || isPositionInRange}
                                flat
                            />
                        )}
                    </div>
                    {isRepositionSent ? etherscanButton : null}
                </div>
            </div>
        </RepositionSkeleton>
    );

    const confirmationContent = (
        <RepositionSkeleton {...repositionSkeletonProps}>
            <ConfirmRepositionModal
                isPositionInRange={isPositionInRange}
                position={position as PositionIF}
                onSend={sendRepositionTransaction}
                showConfirmation={showConfirmation}
                newRepositionTransactionHash={newRepositionTransactionHash}
                resetConfirmation={resetConfirmation}
                txErrorCode={txErrorCode}
                txErrorMessage={txErrorMessage}
                minPriceDisplay={minPriceDisplay}
                maxPriceDisplay={maxPriceDisplay}
                currentBaseQtyDisplayTruncated={currentBaseQtyDisplayTruncated}
                currentQuoteQtyDisplayTruncated={
                    currentQuoteQtyDisplayTruncated
                }
                newBaseQtyDisplay={newBaseQtyDisplay}
                newQuoteQtyDisplay={newQuoteQtyDisplay}
                isAmbient={isAmbient}
                pinnedMinPriceDisplayTruncatedInBase={
                    pinnedMinPriceDisplayTruncatedInBase
                }
                pinnedMinPriceDisplayTruncatedInQuote={
                    pinnedMinPriceDisplayTruncatedInQuote
                }
                pinnedMaxPriceDisplayTruncatedInBase={
                    pinnedMaxPriceDisplayTruncatedInBase
                }
                pinnedMaxPriceDisplayTruncatedInQuote={
                    pinnedMaxPriceDisplayTruncatedInQuote
                }
                isTokenABase={isTokenABase}
                onClose={handleModalClose}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                steps={repositionSteps}
                handleSetActiveContent={handleSetActiveContent}
                showStepperComponent={showStepperComponent}
                setShowStepperComponent={setShowStepperComponent}
            />
        </RepositionSkeleton>
    );

    if (activeContent === 'main') {
        deactivateConfirmation();
    }

    return (
        <>
            <MultiContentComponent
                mainContent={mainContent}
                settingsContent={settingsContent}
                confirmationContent={confirmationContent}
                activeContent={activeContent}
                setActiveContent={handleSetActiveContent}
            />
        </>
    );
}

export default memo(Reposition);
