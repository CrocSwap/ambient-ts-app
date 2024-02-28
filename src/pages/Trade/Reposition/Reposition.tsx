// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState, memo } from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';
import { CrocReposition, toDisplayPrice } from '@crocswap-libs/sdk';

// START: Import JSX Components
import RepositionHeader from '../../../components/Trade/Reposition/RepositionHeader/RepositionHeader';
import RepositionPriceInfo from '../../../components/Trade/Reposition/RepositionPriceInfo/RepositionPriceInfo';
import ConfirmRepositionModal from '../../../components/Trade/Reposition/ConfirmRepositionModal/ConfirmRepositionModal';
import Button from '../../../components/Form/Button';
// START: Import Other Local Files
import styles from './Reposition.module.css';
import { PositionIF, PositionServerIF } from '../../../ambient-utils/types';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

import {
    isTransactionFailedError,
    isTransactionReplacedError,
    parseErrorMessage,
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
    getPinnedPriceValuesFromTicks,
    isStablePair,
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
import { useProcessRange } from '../../../utils/hooks/useProcessRange';
import { getPositionHash } from '../../../ambient-utils/dataLayer/functions/getPositionHash';
import { UserDataContext } from '../../../contexts/UserDataContext';

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
        chainData: { blockExplorer, chainId },
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
        addPositionUpdate,
        removePendingTx,
        updateTransactionHash,
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
    const { userAddress } = useContext(UserDataContext);

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

    const slippageTolerancePercentage = isStablePair(
        position.base,
        position.quote,
    )
        ? repoSlippage.stable
        : repoSlippage.volatile;

    const { posHashTruncated } = useProcessRange(position);

    useEffect(() => {
        setCurrentRangeInReposition('');
        if (position) {
            setCurrentRangeInReposition(position.positionId);
        }
    }, [position]);

    const [concLiq, setConcLiq] = useState<string>('');

    const updateConcLiq = async () => {
        if (!crocEnv || !position) return;
        const pos = crocEnv.positions(
            position.base,
            position.quote,
            position.user,
        );

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
        openModal();
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
            setRangeWidthPercentage(simpleRangeWidth);
            const sliderInput = document.getElementById(
                'input-slider-range',
            ) as HTMLInputElement;
            if (sliderInput) sliderInput.value = simpleRangeWidth.toString();
        }
    }, [simpleRangeWidth]);

    useEffect(() => {
        if (simpleRangeWidth !== rangeWidthPercentage) {
            setSimpleRangeWidth(rangeWidthPercentage);
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
            const repo = new CrocReposition(
                pool,
                {
                    liquidity: concLiq,
                    burn: [position.bidTick, position.askTick],
                    mint: mintArgsForReposition(pinnedLowTick, pinnedHighTick),
                },
                { impact: slippageTolerancePercentage / 100 },
            );

            tx = await repo.rebal();
            setNewRepositionTransactionHash(tx?.hash);
            addPendingTx(tx?.hash);
            if (tx?.hash) {
                addTransactionByType({
                    userAddress: userAddress || '',
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
                        originalLowTick: position.bidTick,
                        originalHighTick: position.askTick,
                        isBid: position.positionLiqQuote === 0,
                    },
                });
                const posHash = getPositionHash(position);
                addPositionUpdate({
                    txHash: tx.hash,
                    positionID: posHash,
                    isLimit: false,
                    unixTimeAdded: Math.floor(Date.now() / 1000),
                });
            }
            // We want the user to exit themselves
            // navigate(redirectPath, { replace: true });
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(parseErrorMessage(error));
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
                const posHash = getPositionHash(position);
                addPositionUpdate({
                    txHash: newTransactionHash,
                    positionID: posHash,
                    isLimit: false,
                    unixTimeAdded: Math.floor(Date.now() / 1000),
                });
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
        const pool = crocEnv.pool(position.base, position.quote);

        const repo = new CrocReposition(pool, {
            liquidity: concLiq,
            burn: [position.bidTick, position.askTick],
            mint: mintArgsForReposition(debouncedLowTick, debouncedHighTick),
        });

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

    const isScroll = chainId === '0x82750' || chainId === '0x8274f';
    // const [l1GasFeePoolInGwei] = useState<number>(
    //     isScroll ? 0.0009 * 1e9 : 0,
    // );
    const [extraL1GasFeePool] = useState(isScroll ? 2.75 : 0);

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                GAS_DROPS_ESTIMATE_REPOSITION *
                NUM_GWEI_IN_WEI *
                ethMainnetUsdPrice;

            setRangeGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum + extraL1GasFeePool,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice, extraL1GasFeePool]);

    const txUrlOnBlockExplorer = `${blockExplorer}tx/${newRepositionTransactionHash}`;

    const etherscanButton = (
        <a
            href={txUrlOnBlockExplorer}
            target='_blank'
            rel='noreferrer'
            className={styles.view_etherscan}
            aria-label='view on block explorer'
        >
            View on Block Explorer
            <FiExternalLink size={12} color='var(--text1)' />
        </a>
    );

    const isCurrentPositionEmptyOrLoading =
        (currentBaseQtyDisplayTruncated === '0.00' &&
            currentQuoteQtyDisplayTruncated === '0.00') ||
        (currentBaseQtyDisplayTruncated === '...' &&
            currentQuoteQtyDisplayTruncated === '...') ||
        (newBaseQtyDisplay === '...' && newQuoteQtyDisplay === '...');

    return (
        <>
            <div className={styles.repositionContainer}>
                <RepositionHeader
                    setRangeWidthPercentage={setRangeWidthPercentage}
                    positionHash={posHashTruncated}
                    resetTxHash={() => setNewRepositionTransactionHash('')}
                />
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
                                transactionPendingDisplayString={`Repositioning ${tokenA.symbol} and ${tokenB.symbol}`}
                                disableSubmitAgain
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
                                disabled={
                                    userAddress?.toLowerCase() !==
                                        position.user.toLowerCase() ||
                                    isRepositionSent ||
                                    isPositionInRange ||
                                    isCurrentPositionEmptyOrLoading
                                }
                                flat
                            />
                        )}
                    </div>
                    {isRepositionSent ? etherscanButton : null}
                </div>
            </div>
            {isOpen && (
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
                    currentBaseQtyDisplayTruncated={
                        currentBaseQtyDisplayTruncated
                    }
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
                    slippageTolerance={slippageTolerancePercentage}
                />
            )}
        </>
    );
}

export default memo(Reposition);
