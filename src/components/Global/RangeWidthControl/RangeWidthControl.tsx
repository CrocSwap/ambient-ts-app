import { useContext, useEffect, useMemo, useState } from 'react';
import AdvancedModeToggle from '../../Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import styles from './RangeWidthControl.module.css';
import MinMaxPrice from '../../Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import RangeWidth from '../../Form/RangeWidth/RangeWidth';
import RepositionPriceInfo from '../../Trade/Reposition/RepositionPriceInfo/RepositionPriceInfo';
import { PositionIF, PositionServerIF } from '../../../ambient-utils/types';
import { RangeContext } from '../../../contexts/RangeContext';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { TokenContext } from '../../../contexts/TokenContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import {
    getFormattedNumber,
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
    getPositionData,
    roundDownTick,
    roundUpTick,
    truncateDecimals,
} from '../../../ambient-utils/dataLayer';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { toDisplayPrice } from '@crocswap-libs/sdk';
import {
    GAS_DROPS_ESTIMATE_REPOSITION,
    GCGO_OVERRIDE_URL,
    IS_EDIT_ENABLED,
    IS_LOCAL_ENV,
    NUM_GWEI_IN_WEI,
} from '../../../ambient-utils/constants';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useSimulatedIsPoolInitialized } from '../../../App/hooks/useSimulatedIsPoolInitialized';

import { FlexContainer } from '../../../styled/Common';
import {
    DEFAULT_MIN_PRICE_DIFF_PERCENTAGE,
    DEFAULT_MAX_PRICE_DIFF_PERCENTAGE,
} from '../../../pages/platformAmbient/Trade/Range/Range';

interface PropsIF {
    isEditPanel?: boolean;
}
export default function RangeWidthControl(props: PropsIF) {
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
        ethMainnetUsdPrice,
        chainData: { gridSize },
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const {
        gasPriceInGwei,
        lastBlockNumber,
        isActiveNetworkBlast,
        isActiveNetworkScroll,
    } = useContext(ChainDataContext);

    const {
        simpleRangeWidth,
        setSimpleRangeWidth,
        minRangePrice: minPrice,
        maxRangePrice: maxPrice,
        setMaxRangePrice: setMaxPrice,
        setMinRangePrice: setMinPrice,
        setCurrentRangeInReposition,
        setRescaleRangeBoundariesWithSlider,
        setAdvancedMode,

        advancedHighTick,
        advancedLowTick,
        advancedMode,
        // eslint-disable-next-line
        setAdvancedHighTick,
        // eslint-disable-next-line
        setAdvancedLowTick,
        chartTriggeredBy,
        isLinesSwitched,
        setIsLinesSwitched,
        setChartTriggeredBy,
    } = useContext(RangeContext);
    const {
        isDenomBase,
        // tokenA,
        // tokenB,
        // isTokenABase,
        poolPriceNonDisplay: currentPoolPriceNonDisplay,
        getDefaultRangeWidthForTokenPair,
    } = useContext(TradeDataContext);
    // const { userAddress } = useContext(UserDataContext);
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

    // const slippageTolerancePercentage = isStablePair(
    //     position.base,
    //     position.quote,
    // )
    //     ? repoSlippage.stable
    //     : repoSlippage.volatile;

    // const { posHashTruncated } = useProcessRange(position, crocEnv);

    useEffect(() => {
        setCurrentRangeInReposition('');
        if (position) {
            setCurrentRangeInReposition(position.positionId);
        }
    }, [position]);
    // eslint-disable-next-line
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

    const currentPoolPriceTick =
        Math.log(currentPoolPriceNonDisplay) / Math.log(1.0001);

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

    // if chart is at ambient width, keep ambient width, otherwise use the default
    // otherwise the the width rapidly switches back and forth between the two when returning to an in progress reposition
    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(
        simpleRangeWidth === 100
            ? 100
            : getDefaultRangeWidthForTokenPair(
                  position.chainId,
                  position.base.toLowerCase(),
                  position.quote.toLowerCase(),
              ),
    );

    const [pinnedLowTick, setPinnedLowTick] = useState(0);
    const [pinnedHighTick, setPinnedHighTick] = useState(0);
    const [isAmbient, setIsAmbient] = useState(false);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('set Advanced Mode to false');
        setAdvancedMode(false);
    }, []);

    // const [rangeLowBoundNonDisplayPrice, setRangeLowBoundNonDisplayPrice] =
    //     useState(0);
    // const [rangeHighBoundNonDisplayPrice, setRangeHighBoundNonDisplayPrice] =
    //     useState(0);

    useEffect(() => {
        if (advancedMode) {
            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                pinnedLowTick,
                pinnedHighTick,
                gridSize,
            );
            // setRangeLowBoundNonDisplayPrice(
            //     pinnedDisplayPrices.pinnedMinPriceNonDisplay,
            // );
            // setRangeHighBoundNonDisplayPrice(
            //     pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
            // );

            // setPinnedMinPriceDisplayTruncated(
            //     pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            // );
            // setPinnedMaxPriceDisplayTruncated(
            //     pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            // );

            setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick);
            setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick);

            const highTickDiff =
                pinnedDisplayPrices.pinnedHighTick - currentPoolPriceTick;
            const lowTickDiff =
                pinnedDisplayPrices.pinnedLowTick - currentPoolPriceTick;

            const highGeometricDifferencePercentage =
                Math.abs(highTickDiff) < 200
                    ? parseFloat(truncateDecimals(highTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(highTickDiff / 100, 0));
            const lowGeometricDifferencePercentage =
                Math.abs(lowTickDiff) < 200
                    ? parseFloat(truncateDecimals(lowTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(lowTickDiff / 100, 0));
            isDenomBase
                ? setMaxPriceDifferencePercentage(
                      -lowGeometricDifferencePercentage,
                  )
                : setMaxPriceDifferencePercentage(
                      highGeometricDifferencePercentage,
                  );

            isDenomBase
                ? setMinPriceDifferencePercentage(
                      -highGeometricDifferencePercentage,
                  )
                : setMinPriceDifferencePercentage(
                      lowGeometricDifferencePercentage,
                  );

            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
                const rangeHighBoundDisplayField = document.getElementById(
                    'max-price-input-quantity',
                ) as HTMLInputElement;

                if (rangeHighBoundDisplayField) {
                    rangeHighBoundDisplayField.value =
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
                }
            }

            setMaxPrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinPrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );
        }
    }, [
        currentPoolPriceTick,
        pinnedLowTick,
        pinnedHighTick,
        isDenomBase,
        baseTokenDecimals,
        quoteTokenDecimals,
        advancedMode,
    ]);

    useEffect(() => {
        setSimpleRangeWidth(
            getDefaultRangeWidthForTokenPair(
                position.chainId,
                position.base.toLowerCase(),
                position.quote.toLowerCase(),
            ),
        );
    }, [position]);

    // neccessary to get the liquidity chart to correctly show an ambient range width
    useEffect(() => {
        if (rangeWidthPercentage === 100) {
            setSimpleRangeWidth(100);
        } else {
            setSimpleRangeWidth(rangeWidthPercentage);
        }
    }, [rangeWidthPercentage === 100]);

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
        setNewValueNum(undefined);
        setNewBaseQtyDisplay('...');
        setNewQuoteQtyDisplay('...');
    }, [position.positionId, rangeWidthPercentage]);

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

    const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const pinnedDisplayPrices =
        Math.abs(lowTick) !== Infinity && Math.abs(highTick) !== Infinity
            ? getPinnedPriceValuesFromTicks(
                  isDenomBase,
                  position?.baseDecimals || 18,
                  position?.quoteDecimals || 18,
                  lowTick,
                  highTick,
                  lookupChain(position.chainId).gridSize,
              )
            : undefined;

    const pinnedMinPriceDisplayTruncated = pinnedDisplayPrices
        ? pinnedDisplayPrices.pinnedMinPriceDisplayTruncated
        : undefined;
    const pinnedMaxPriceDisplayTruncated = pinnedDisplayPrices
        ? pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated
        : undefined;

    // -----------------------------TEMPORARY PLACE HOLDERS--------------

    const [minPriceDisplay, setMinPriceDisplay] = useState<string>(
        pinnedMinPriceDisplayTruncated || '...',
    );
    const [maxPriceDisplay, setMaxPriceDisplay] = useState<string>(
        pinnedMaxPriceDisplayTruncated || '...',
    );

    useEffect(() => {
        if (!pinnedMinPriceDisplayTruncated) return;
        setMinPriceDisplay(pinnedMinPriceDisplayTruncated.toString());
        if (pinnedMinPriceDisplayTruncated !== undefined) {
            setMinPrice(parseFloat(pinnedMinPriceDisplayTruncated));
        }
    }, [pinnedMinPriceDisplayTruncated]);

    useEffect(() => {
        if (!pinnedMaxPriceDisplayTruncated) return;
        setMaxPriceDisplay(pinnedMaxPriceDisplayTruncated);
        setMaxPrice(parseFloat(pinnedMaxPriceDisplayTruncated));
    }, [pinnedMaxPriceDisplayTruncated]);

    const [currentBaseQtyDisplayTruncated, setCurrentBaseQtyDisplayTruncated] =
        useState<string>(position?.positionLiqBaseTruncated || '...');

    const [
        currentQuoteQtyDisplayTruncated,
        setCurrentQuoteQtyDisplayTruncated,
    ] = useState<string>(position?.positionLiqQuoteTruncated || '...');

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
                const rewardsBaseNum =
                    positionStats.feesLiqBaseDecimalCorrected;
                const rewardsQuoteNum =
                    positionStats.feesLiqQuoteDecimalCorrected;
                const liqBaseDisplay = getFormattedNumber({
                    value: liqBaseNum + (rewardsBaseNum || 0),
                });
                setCurrentBaseQtyDisplayTruncated(liqBaseDisplay || '0.00');

                const liqQuoteDisplay = getFormattedNumber({
                    value: liqQuoteNum + (rewardsQuoteNum || 0),
                });
                setCurrentQuoteQtyDisplayTruncated(liqQuoteDisplay || '0.00');
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchCurrentCollateral();
    }, [lastBlockNumber, JSON.stringify(position), !!crocEnv, !!provider]);
    // eslint-disable-next-line
    const [newBaseQtyNum, setNewBaseQtyNum] = useState<number | undefined>();
    // eslint-disable-next-line
    const [newQuoteQtyNum, setNewQuoteQtyNum] = useState<number | undefined>();
    const [newBaseQtyDisplay, setNewBaseQtyDisplay] = useState<string>('...');
    const [newQuoteQtyDisplay, setNewQuoteQtyDisplay] = useState<string>('...');
    const [newValueNum, setNewValueNum] = useState<number | undefined>();

    const valueLossExceedsThreshold = useMemo(() => {
        if (newValueNum === undefined) return false;
        const priceImpactNum =
            (newValueNum - position.totalValueUSD) / position.totalValueUSD;
        return priceImpactNum < -0.02;
        // change color to red if value loss greater than 2%
    }, [newValueNum, position.totalValueUSD]);

    const valueImpactString = useMemo(() => {
        if (newValueNum === undefined) return '...';
        const priceImpactNum =
            (newValueNum - position.totalValueUSD) / position.totalValueUSD;
        const isNegative = priceImpactNum < 0;
        const formattedNum = getFormattedNumber({
            value: Math.abs(priceImpactNum) * 100,
            isPercentage: true,
        });
        const formattedDisplayString = isNegative
            ? `(${formattedNum}%)`
            : `${formattedNum}%`;
        return formattedDisplayString;
    }, [newValueNum, position.totalValueUSD]);

    const newValueString = useMemo(() => {
        if (newValueNum === undefined) return '...';
        return getFormattedNumber({ value: newValueNum, prefix: '$' });
    }, [newValueNum]);

    const [basePrice, setBasePrice] = useState<number | undefined>();
    const [quotePrice, setQuotePrice] = useState<number | undefined>();

    useEffect(() => {
        if (!crocEnv || !position) return;
        const basePricePromise = cachedFetchTokenPrice(
            position.base,
            position.chainId,
            crocEnv,
        );
        const quotePricePromise = cachedFetchTokenPrice(
            position.quote,
            position.chainId,
            crocEnv,
        );
        Promise.all([basePricePromise, quotePricePromise]).then(
            ([basePrice, quotePrice]) => {
                setBasePrice(basePrice?.usdPrice);
                setQuotePrice(quotePrice?.usdPrice);
            },
        );
    }, [position.base + position.quote, crocEnv !== undefined]);

    const calcNewValue = async () => {
        if (
            !crocEnv ||
            newBaseQtyNum === undefined ||
            newQuoteQtyNum === undefined
        )
            return;

        if (basePrice && quotePrice) {
            const newValueNum =
                newBaseQtyNum * basePrice + newQuoteQtyNum * quotePrice;
            setNewValueNum(newValueNum);
        } else if (basePrice) {
            const quotePrice = basePrice * currentPoolDisplayPriceInQuote;
            const newValueNum =
                newBaseQtyNum * basePrice + newQuoteQtyNum * quotePrice;
            setNewValueNum(newValueNum);
        } else if (quotePrice) {
            const basePrice = quotePrice / currentPoolDisplayPriceInQuote;
            const newValueNum =
                newBaseQtyNum * basePrice + newQuoteQtyNum * quotePrice;
            setNewValueNum(newValueNum);
        } else {
            setNewValueNum(newValueNum);
        }
    };

    useEffect(() => {
        calcNewValue();
    }, [
        currentPoolDisplayPriceInQuote,
        rangeWidthPercentage,
        position.base + position.quote,
        newBaseQtyNum,
        newQuoteQtyNum,
        basePrice,
        quotePrice,
    ]);

    const [rangeGasPriceinDollars, setRangeGasPriceinDollars] = useState<
        string | undefined
    >();

    // const [l1GasFeePoolInGwei] = useState<number>(
    //     isScroll ? 0.0009 * 1e9 : 0,
    // );
    const [extraL1GasFeePool] = useState(
        isActiveNetworkScroll ? 2.75 : isActiveNetworkBlast ? 2.5 : 0,
    );

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

    const isCurrentPositionEmpty =
        currentBaseQtyDisplayTruncated === '0.00' &&
        currentQuoteQtyDisplayTruncated === '0.00';

    // const isCurrentPositionEmptyOrLoading =
    //     (currentBaseQtyDisplayTruncated === '0.00' &&
    //         currentQuoteQtyDisplayTruncated === '0.00') ||
    //     (currentBaseQtyDisplayTruncated === '...' &&
    //         currentQuoteQtyDisplayTruncated === '...') ||
    //     (newBaseQtyDisplay === '...' && newQuoteQtyDisplay === '...');

    // -----------------------------------------------------------------------
    const isPoolInitialized = useSimulatedIsPoolInitialized();
    // eslint-disable-next-line
    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');
    // eslint-disable-next-line
    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] =
        useState(false);
    // eslint-disable-next-line
    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] =
        useState(false);
    // eslint-disable-next-line
    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] =
        useState(DEFAULT_MIN_PRICE_DIFF_PERCENTAGE);
    // eslint-disable-next-line
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] =
        useState(DEFAULT_MAX_PRICE_DIFF_PERCENTAGE);

    const ticksInParams =
        location.pathname.includes('lowTick') &&
        location.pathname.includes('highTick');
    const shouldResetAdvancedLowTick =
        !ticksInParams &&
        (advancedHighTick > currentPoolPriceTick + 100000 ||
            advancedLowTick < currentPoolPriceTick - 100000);
    const shouldResetAdvancedHighTick =
        !ticksInParams &&
        (advancedHighTick > currentPoolPriceTick + 100000 ||
            advancedLowTick < currentPoolPriceTick - 100000);

    // default low tick to seed in the DOM (range lower value)
    const defaultLowTick = useMemo<number>(() => {
        const value: number = shouldResetAdvancedLowTick
            ? roundDownTick(
                  currentPoolPriceTick +
                      DEFAULT_MIN_PRICE_DIFF_PERCENTAGE * 100,
                  gridSize,
              )
            : advancedLowTick;
        return value;
    }, [advancedLowTick, currentPoolPriceTick, shouldResetAdvancedLowTick]);

    const defaultHighTick = useMemo<number>(() => {
        const value: number = shouldResetAdvancedHighTick
            ? roundUpTick(
                  currentPoolPriceTick +
                      DEFAULT_MAX_PRICE_DIFF_PERCENTAGE * 100,
                  gridSize,
              )
            : advancedHighTick;
        return value;
    }, [advancedHighTick, currentPoolPriceTick, shouldResetAdvancedHighTick]);

    const isInvalidRange = !isAmbient && defaultHighTick <= defaultLowTick;

    // -----------------------------------------
    useEffect(() => {
        if (rangeLowBoundFieldBlurred || chartTriggeredBy === 'low_line') {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;

            const targetMinValue = minPrice;
            const targetMaxValue = maxPrice;

            const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                gridSize,
            );

            // !isDenomBase
            //     ? setRangeLowBoundNonDisplayPrice(
            //           pinnedDisplayPrices.pinnedMinPriceNonDisplay,
            //       )
            //     : setRangeHighBoundNonDisplayPrice(
            //           pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
            //       );

            !isDenomBase
                ? setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick)
                : setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick);

            !isDenomBase
                ? setMinPrice(
                      parseFloat(
                          pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                      ),
                  )
                : setMaxPrice(
                      parseFloat(
                          pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                      ),
                  );

            if (isLinesSwitched) {
                isDenomBase
                    ? setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick)
                    : setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick);
            }

            const highGeometricDifferencePercentage = parseFloat(
                truncateDecimals(
                    (pinnedDisplayPrices.pinnedHighTick -
                        currentPoolPriceTick) /
                        100,
                    0,
                ),
            );
            const lowGeometricDifferencePercentage = parseFloat(
                truncateDecimals(
                    (pinnedDisplayPrices.pinnedLowTick - currentPoolPriceTick) /
                        100,
                    0,
                ),
            );
            isDenomBase
                ? setMinPriceDifferencePercentage(
                      -highGeometricDifferencePercentage,
                  )
                : setMinPriceDifferencePercentage(
                      lowGeometricDifferencePercentage,
                  );

            // setPinnedMinPriceDisplayTruncated(
            //     pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            // );

            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
            } else {
                IS_LOCAL_ENV && console.debug('low bound field not found');
            }

            setRangeLowBoundFieldBlurred(false);
            setChartTriggeredBy('none');
            setIsLinesSwitched(false);
        }
    }, [rangeLowBoundFieldBlurred, chartTriggeredBy]);

    useEffect(() => {
        if (rangeHighBoundFieldBlurred || chartTriggeredBy === 'high_line') {
            const rangeHighBoundDisplayField = document.getElementById(
                'max-price-input-quantity',
            ) as HTMLInputElement;

            const targetMaxValue = maxPrice;
            const targetMinValue = minPrice;

            const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                gridSize,
            );

            // isDenomBase
            //     ? setRangeLowBoundNonDisplayPrice(
            //           pinnedDisplayPrices.pinnedMinPriceNonDisplay,
            //       )
            //     : setRangeHighBoundNonDisplayPrice(
            //           pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
            //       );

            isDenomBase
                ? setMinPrice(
                      parseFloat(
                          pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                      ),
                  )
                : setMaxPrice(
                      parseFloat(
                          pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                      ),
                  );

            isDenomBase
                ? setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick)
                : setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick);

            if (isLinesSwitched) {
                !isDenomBase
                    ? setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick)
                    : setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick);
            }

            const highGeometricDifferencePercentage = parseFloat(
                truncateDecimals(
                    (pinnedDisplayPrices.pinnedHighTick -
                        currentPoolPriceTick) /
                        100,
                    0,
                ),
            );
            const lowGeometricDifferencePercentage = parseFloat(
                truncateDecimals(
                    (pinnedDisplayPrices.pinnedLowTick - currentPoolPriceTick) /
                        100,
                    0,
                ),
            );
            isDenomBase
                ? setMaxPriceDifferencePercentage(
                      -lowGeometricDifferencePercentage,
                  )
                : setMaxPriceDifferencePercentage(
                      highGeometricDifferencePercentage,
                  );

            // setPinnedMaxPriceDisplayTruncated(
            //     pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            // );

            if (rangeHighBoundDisplayField) {
                rangeHighBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
            } else {
                IS_LOCAL_ENV && console.debug('high bound field not found');
            }

            setRangeHighBoundFieldBlurred(false);
            setChartTriggeredBy('none');
            setIsLinesSwitched(false);
        }
    }, [rangeHighBoundFieldBlurred, chartTriggeredBy]);

    // -----------------------------------------

    const MinMaxProps = {
        minPricePercentage: minPriceDifferencePercentage,
        maxPricePercentage: maxPriceDifferencePercentage,
        minPriceInputString: minPriceInputString,
        maxPriceInputString: maxPriceInputString,
        setMinPriceInputString: setMaxPriceInputString,
        setMaxPriceInputString: setMaxPriceInputString,
        disable: isInvalidRange || !isPoolInitialized,
        isDenomBase: isDenomBase,
        highBoundOnBlur: () => setRangeHighBoundFieldBlurred(true),
        lowBoundOnBlur: () => setRangeLowBoundFieldBlurred(true),
        rangeLowTick: defaultLowTick,
        rangeHighTick: defaultHighTick,
        maxPrice: minPrice,
        minPrice: maxPrice,
        setMaxPrice: setMaxPrice,
        setMinPrice: setMinPrice,
    };

    // --------
    useEffect(() => {
        setSimpleRangeWidth(
            getDefaultRangeWidthForTokenPair(
                position.chainId,
                position.base.toLowerCase(),
                position.quote.toLowerCase(),
            ),
        );
    }, [position]);

    // neccessary to get the liquidity chart to correctly show an ambient range width
    useEffect(() => {
        if (rangeWidthPercentage === 100) {
            setSimpleRangeWidth(100);
        } else {
            setSimpleRangeWidth(rangeWidthPercentage);
        }
    }, [rangeWidthPercentage === 100]);

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

    return (
        <div className={styles.reposition_content}>
            {!props.isEditPanel && IS_EDIT_ENABLED && (
                <div className={styles.advanced_toggle_container}>
                    <AdvancedModeToggle />
                </div>
            )}
            <FlexContainer flexDirection='column' height='120px'>
                {advancedMode ? (
                    <div className={styles.advanced_info_container}>
                        <MinMaxPrice {...MinMaxProps} />
                    </div>
                ) : (
                    <RangeWidth
                        rangeWidthPercentage={rangeWidthPercentage}
                        setRangeWidthPercentage={setRangeWidthPercentage}
                        setRescaleRangeBoundariesWithSlider={
                            setRescaleRangeBoundariesWithSlider
                        }
                    />
                )}
            </FlexContainer>
            <RepositionPriceInfo
                position={position}
                currentPoolPriceDisplay={currentPoolPriceDisplay}
                currentPoolPriceTick={currentPoolPriceTick}
                rangeWidthPercentage={rangeWidthPercentage}
                minPriceDisplay={minPriceDisplay}
                maxPriceDisplay={maxPriceDisplay}
                currentBaseQtyDisplayTruncated={currentBaseQtyDisplayTruncated}
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
                newValueString={newValueString}
                valueImpactString={valueImpactString}
                valueLossExceedsThreshold={valueLossExceedsThreshold}
                isCurrentPositionEmpty={isCurrentPositionEmpty}
            />
        </div>
    );
}
