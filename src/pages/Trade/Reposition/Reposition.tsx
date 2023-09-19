// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState, memo } from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';
import {
    CrocPositionView,
    CrocReposition,
    toDisplayPrice,
} from '@crocswap-libs/sdk';

// START: Import JSX Components
import RepositionHeader from '../../../components/Trade/Reposition/RepositionHeader/RepositionHeader';
import RepositionPriceInfo from '../../../components/Trade/Reposition/RepositionPriceInfo/RepositionPriceInfo';
import ConfirmRepositionModal from '../../../components/Trade/Reposition/ConfirmRepositionModal/ConfirmRepositionModal';
import Button from '../../../components/Form/Button';
// START: Import Other Local Files
import styles from './Reposition.module.css';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { PositionIF } from '../../../utils/interfaces/exports';
import { getPinnedPriceValuesFromTicks } from '../Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
    updateTransactionHash,
} from '../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';
import useDebounce from '../../../App/hooks/useDebounce';
import { setAdvancedMode } from '../../../utils/state/tradeDataSlice';
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../../../constants';
import { FiExternalLink } from 'react-icons/fi';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { RangeContext } from '../../../contexts/RangeContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { getPositionData } from '../../../App/functions/getPositionData';
import { TokenContext } from '../../../contexts/TokenContext';
import { PositionServerIF } from '../../../utils/interfaces/PositionIF';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { useModal } from '../../../components/Global/Modal/useModal';
import SubmitTransaction from '../../../components/Trade/TradeModules/SubmitTransaction/SubmitTransaction';
import RangeWidth from '../../../components/Form/RangeWidth/RangeWidth';

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
        chainData: { blockExplorer },
        nativeTokenUsdPrice,
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const { gasPriceInGwei, lastBlockNumber } = useContext(ChainDataContext);
    const { bypassConfirmRepo } = useContext(UserPreferenceContext);
    const {
        simpleRangeWidth,
        setSimpleRangeWidth,
        setMaxRangePrice: setMaxPrice,
        setMinRangePrice: setMinPrice,
        setCurrentRangeInReposition,
        setRescaleRangeBoundariesWithSlider,
    } = useContext(RangeContext);

    const [isOpen, openModal, closeModal] = useModal();

    const [newRepositionTransactionHash, setNewRepositionTransactionHash] =
        useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [txErrorCode, setTxErrorCode] = useState('');

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setTxErrorCode('');
        setNewRepositionTransactionHash('');
    };

    const isRepositionSent = newRepositionTransactionHash !== '';

    const locationHook = useLocation();
    const dispatch = useAppDispatch();
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
        tradeData: {
            tokenA,
            tokenB,
            isTokenABase,
            poolPriceNonDisplay: currentPoolPriceNonDisplay,
            isDenomBase,
        },
    } = useAppSelector((state) => state);

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
        dispatch(setAdvancedMode(false));
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
            dispatch(addPendingTx(tx?.hash));
            if (tx?.hash)
                dispatch(
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
                    }),
                );
            // We want the user to exit themselves
            // navigate(redirectPath, { replace: true });
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
                setNewRepositionTransactionHash(newTransactionHash);
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

    const positionStatsCacheEndpoint =
        GRAPHCACHE_SMALL_URL + '/position_stats?';
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
                if (!crocEnv || !json?.data) {
                    setCurrentBaseQtyDisplayTruncated('...');
                    setCurrentQuoteQtyDisplayTruncated('...');
                    return;
                }

                const positionStats = await getPositionData(
                    json.data as PositionServerIF,
                    tokens.tokenUniv,
                    crocEnv,
                    position.chainId,
                    lastBlockNumber,
                    cachedFetchTokenPrice,
                    cachedQuerySpotPrice,
                    cachedTokenDetails,
                    cachedEnsResolve,
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
    }, [lastBlockNumber, JSON.stringify(position)]);

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
        if (gasPriceInGwei && nativeTokenUsdPrice) {
            const averageRepositionCostInGasDrops = 260705;
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageRepositionCostInGasDrops *
                1e-9 *
                nativeTokenUsdPrice;

            setRangeGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, nativeTokenUsdPrice]);

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

    return (
        <>
            <div className={styles.repositionContainer}>
                <RepositionHeader
                    setRangeWidthPercentage={setRangeWidthPercentage}
                    positionHash={position.firstMintTx}
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
                                sendTransaction={sendRepositionTransaction}
                                resetConfirmation={resetConfirmation}
                                transactionPendingDisplayString={`Repositioning transaction with ${tokenA.symbol} and ${tokenB.symbol}`}
                            />
                        ) : (
                            <Button
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
            {isOpen && (
                <ConfirmRepositionModal
                    isPositionInRange={isPositionInRange}
                    position={position as PositionIF}
                    onSend={sendRepositionTransaction}
                    showConfirmation={showConfirmation}
                    newRepositionTransactionHash={newRepositionTransactionHash}
                    resetConfirmation={resetConfirmation}
                    txErrorCode={txErrorCode}
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
                />
            )}
        </>
    );
}

export default memo(Reposition);
