import { concDepositSkew, fromDisplayQty } from '@crocswap-libs/sdk';
import {
    Dispatch,
    memo,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Button from '../../../../components/Form/Button';
import { useModal } from '../../../../components/Global/Modal/useModal';

import { useCreateRangePosition } from '../../../../App/hooks/useCreateRangePosition';
import { useSimulatedIsPoolInitialized } from '../../../../App/hooks/useSimulatedIsPoolInitialized';
import RangeBounds from '../../../../components/Global/RangeBounds/RangeBounds';
import ConfirmRangeModal from '../../../../components/Trade/Range/ConfirmRangeModal/ConfirmRangeModal';
import RangeExtraInfo from '../../../../components/Trade/Range/RangeExtraInfo/RangeExtraInfo';
import RangeTokenInput from '../../../../components/Trade/Range/RangeTokenInput/RangeTokenInput';
import SubmitTransaction from '../../../../components/Trade/TradeModules/SubmitTransaction/SubmitTransaction';
import TradeModuleHeader from '../../../../components/Trade/TradeModules/TradeModuleHeader';
import { TradeModuleSkeleton } from '../../../../components/Trade/TradeModules/TradeModuleSkeleton';

import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import { RangeContext } from '../../../../contexts/RangeContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import { TradeTokenContext } from '../../../../contexts/TradeTokenContext';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import {
    getFormattedNumber,
    getUnicodeCharacter,
    isStablePair,
    truncateDecimals,
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
    roundDownTick,
    roundUpTick,
} from '../../../../ambient-utils/dataLayer';
import { PositionIF } from '../../../../ambient-utils/types';
import { rangeTutorialSteps } from '../../../../utils/tutorial/Range';

import { useApprove } from '../../../../App/functions/approve';
import { useHandleRangeButtonMessage } from '../../../../App/hooks/useHandleRangeButtonMessage';
import { useRangeInputDisable } from './useRangeInputDisable';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import {
    GAS_DROPS_ESTIMATE_POOL,
    NUM_GWEI_IN_WEI,
    RANGE_BUFFER_MULTIPLIER_MAINNET,
    RANGE_BUFFER_MULTIPLIER_L2,
    IS_LOCAL_ENV,
    NUM_GWEI_IN_ETH,
} from '../../../../ambient-utils/constants';

export const DEFAULT_MIN_PRICE_DIFF_PERCENTAGE = -10;
export const DEFAULT_MAX_PRICE_DIFF_PERCENTAGE = 10;

interface RangePropsIF {
    isEditPanel?: boolean;
    prepopulatedBaseValue?: string;
    prepopulatedQuoteValue?: string;
    isReposition?: boolean;
    position?: PositionIF;
    editFunction?: (params: {
        setTxError: (s: Error | undefined) => void;
        resetConfirmation: () => void;
        setShowConfirmation: Dispatch<SetStateAction<boolean>>;
        defaultLowTick: number;
        defaultHighTick: number;
    }) => Promise<void>;
}
function Range(props: RangePropsIF) {
    const { isEditPanel, isReposition, position, editFunction } = props;
    const {
        chainData: { chainId, gridSize },
        ethMainnetUsdPrice,
        crocEnv,
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei, isActiveNetworkBlast } =
        useContext(ChainDataContext);
    const { poolPriceDisplay, dailyVol } = useContext(PoolContext);
    const {
        advancedHighTick,
        advancedLowTick,
        advancedMode,
        setAdvancedHighTick,
        setAdvancedLowTick,
        isLinesSwitched,

        simpleRangeWidth,
        setSimpleRangeWidth,
        minRangePrice,
        maxRangePrice,
        setMaxRangePrice,
        setMinRangePrice,
        setChartTriggeredBy,
        chartTriggeredBy,
        setRescaleRangeBoundariesWithSlider,
        setCurrentRangeInAdd,
        setIsLinesSwitched,
        pinnedDisplayPrices,
        setPinnedDisplayPrices,
    } = useContext(RangeContext);

    const { tokens } = useContext(TokenContext);
    const {
        tokenAAllowance,
        tokenBAllowance,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isTokenABase,
        baseToken: { decimals: baseTokenDecimals },
        quoteToken: { decimals: quoteTokenDecimals },
    } = useContext(TradeTokenContext);
    const { mintSlippage, dexBalRange, bypassConfirmRange } = useContext(
        UserPreferenceContext,
    );
    const { positionsByUser, liquidityFee } = useContext(GraphDataContext);
    const isPoolInitialized = useSimulatedIsPoolInitialized();

    const [isOpen, openModal, closeModal] = useModal();

    const {
        isDenomBase,
        tokenA,
        tokenB,
        baseToken,
        quoteToken,
        poolPriceNonDisplay,
        isTokenAPrimary,
        primaryQuantity,
        setPrimaryQuantity,
        setIsTokenAPrimary,
    } = useContext(TradeDataContext);

    // RangeTokenInput state values
    // const [tokenAInputQty, setTokenAInputQty] = useState<string>(
    //     isTokenAPrimary ? primaryQuantity : '',
    // );
    // const [tokenBInputQty, setTokenBInputQty] = useState<string>(
    //     !isTokenAPrimary ? primaryQuantity : '',
    // );

    const [tokenAInputQty, setTokenAInputQty] = useState<string>(
        position
            ? position?.positionLiqBaseDecimalCorrected.toString()
            : isTokenAPrimary
              ? primaryQuantity
              : '',
    );
    const [tokenBInputQty, setTokenBInputQty] = useState<string>(
        position
            ? position?.positionLiqQuoteDecimalCorrected.toString()
            : !isTokenAPrimary
              ? primaryQuantity
              : '',
    );

    const [positionCount, setPositionCount] = useState(0);

    useEffect(() => {
        if (position) {
            setTokenAInputQty(
                position?.positionLiqBaseDecimalCorrected.toString(),
            );
            setTokenBInputQty(
                position?.positionLiqQuoteDecimalCorrected.toString(),
            );
        }
        setPositionCount(positionCount + 1);
    }, [position]);

    const [rangeWidthPercentage, setRangeWidthPercentage] =
        useState<number>(simpleRangeWidth);
    const [isAmbient, setIsAmbient] = useState(false);

    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');
    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] =
        useState(DEFAULT_MIN_PRICE_DIFF_PERCENTAGE);
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] =
        useState(DEFAULT_MAX_PRICE_DIFF_PERCENTAGE);
    const [rangeLowBoundNonDisplayPrice, setRangeLowBoundNonDisplayPrice] =
        useState(0);
    const [rangeHighBoundNonDisplayPrice, setRangeHighBoundNonDisplayPrice] =
        useState(0);
    const [pinnedMinPriceDisplayTruncated, setPinnedMinPriceDisplayTruncated] =
        useState('');
    const [pinnedMaxPriceDisplayTruncated, setPinnedMaxPriceDisplayTruncated] =
        useState('');
    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] =
        useState(false);
    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] =
        useState(false);
    // const [pinnedDisplayPrices, setPinnedDisplayPrices] = useState<
    //     | {
    //           pinnedMinPriceDisplay: string;
    //           pinnedMaxPriceDisplay: string;
    //           pinnedMinPriceDisplayTruncated: string;
    //           pinnedMaxPriceDisplayTruncated: string;
    //           pinnedMinPriceDisplayTruncatedWithCommas: string;
    //           pinnedMaxPriceDisplayTruncatedWithCommas: string;
    //           pinnedLowTick: number;
    //           pinnedHighTick: number;
    //           pinnedMinPriceNonDisplay: number;
    //           pinnedMaxPriceNonDisplay: number;
    //       }
    //     | undefined
    // >();

    // local state values whether tx will use dex balance preferentially over
    // ... wallet funds, this layer of logic matters because the DOM may need
    // ... to use wallet funds without switching the persisted preference
    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);

    const [showConfirmation, setShowConfirmation] = useState(false);

    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState('');
    const [txError, setTxError] = useState<Error | undefined>();

    const [rangeGasPriceinDollars, setRangeGasPriceinDollars] = useState<
        string | undefined
    >();

    const slippageTolerancePercentage = isStablePair(
        tokenA.address,
        tokenB.address,
    )
        ? mintSlippage.stable
        : mintSlippage.volatile;

    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;
    const poolPriceCharacter = isDenomBase
        ? isTokenABase
            ? getUnicodeCharacter(tokenB.symbol)
            : getUnicodeCharacter(tokenA.symbol)
        : !isTokenABase
          ? getUnicodeCharacter(tokenB.symbol)
          : getUnicodeCharacter(tokenA.symbol);
    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined
            ? 0
            : Math.log(poolPriceNonDisplay) / Math.log(1.0001);

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

    // default high tick to seed in the DOM (range upper value)
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

    const userPositions = positionsByUser.positions.filter(
        (x) => x.chainId === chainId,
    );
    // Represents whether user is adding to an existing range position
    const isAdd = useMemo(
        () =>
            userPositions.length > 0 &&
            userPositions.some((position: PositionIF) => {
                if (isAmbient && position.positionType === 'ambient') {
                    return true;
                } else if (
                    !isAmbient &&
                    defaultLowTick === position.bidTick &&
                    defaultHighTick === position.askTick
                ) {
                    return true;
                } else {
                    return false;
                }
            }),
        [userPositions, isAmbient, defaultLowTick, defaultHighTick],
    );

    const tokenASurplusMinusTokenARemainderNum =
        fromDisplayQty(tokenADexBalance || '0', tokenA.decimals) -
        fromDisplayQty(tokenAInputQty || '0', tokenA.decimals);
    const tokenBSurplusMinusTokenBRemainderNum =
        fromDisplayQty(tokenBDexBalance || '0', tokenB.decimals) -
        fromDisplayQty(tokenBInputQty || '0', tokenB.decimals);
    const tokenAQtyCoveredByWalletBalance = isWithdrawTokenAFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum < 0
            ? tokenASurplusMinusTokenARemainderNum * -1n
            : 0n
        : fromDisplayQty(tokenAInputQty || '0', tokenA.decimals);
    const tokenBQtyCoveredByWalletBalance = isWithdrawTokenBFromDexChecked
        ? tokenBSurplusMinusTokenBRemainderNum < 0
            ? tokenBSurplusMinusTokenBRemainderNum * -1n
            : 0n
        : fromDisplayQty(tokenBInputQty || '0', tokenB.decimals);
    const isQtyEntered = tokenAInputQty !== '' && tokenBInputQty !== '';
    const showExtraInfoDropdown =
        tokenAInputQty !== '' || tokenBInputQty !== '';

    const rangeSpanAboveCurrentPrice = defaultHighTick - currentPoolPriceTick;
    const rangeSpanBelowCurrentPrice = currentPoolPriceTick - defaultLowTick;
    const isOutOfRange = !advancedMode
        ? false
        : rangeSpanAboveCurrentPrice < 0 || rangeSpanBelowCurrentPrice < 0;
    const isInvalidRange = !isAmbient && defaultHighTick <= defaultLowTick;

    const depositSkew = useMemo(
        () =>
            concDepositSkew(
                poolPriceNonDisplay ?? 0,
                rangeLowBoundNonDisplayPrice,
                rangeHighBoundNonDisplayPrice,
            ),
        [
            poolPriceNonDisplay,
            rangeLowBoundNonDisplayPrice,
            rangeHighBoundNonDisplayPrice,
        ],
    );

    const minPriceDisplay = isAmbient ? '0' : pinnedMinPriceDisplayTruncated;
    const maxPriceDisplay = isAmbient
        ? 'Infinity'
        : pinnedMaxPriceDisplayTruncated;

    // let aprPercentage = ambientApy;
    // if (!isAmbient && ambientApy && poolPriceNonDisplay) {
    //     const concFactor = capitalConcFactor(
    //         poolPriceNonDisplay,
    //         rangeLowBoundNonDisplayPrice,
    //         rangeHighBoundNonDisplayPrice,
    //     );
    //     aprPercentage = ambientApy * concFactor;
    // }
    let daysInRange = isAmbient ? Infinity : 0;
    if (!isAmbient && dailyVol && poolPriceNonDisplay) {
        const upperPercent = Math.log(
            rangeHighBoundNonDisplayPrice / poolPriceNonDisplay,
        );
        const lowerPercent = Math.log(
            poolPriceNonDisplay / rangeLowBoundNonDisplayPrice,
        );

        if (upperPercent > 0 && lowerPercent > 0) {
            const daysBelow = Math.pow(upperPercent / dailyVol, 2);
            const daysAbove = Math.pow(lowerPercent / dailyVol, 2);
            daysInRange = Math.min(daysBelow, daysAbove);
        }
    }

    const pinnedMinPriceDisplayTruncatedInBase = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                true,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            ).pinnedMinPriceDisplayTruncatedWithCommas,
        [
            baseTokenDecimals,
            quoteTokenDecimals,
            defaultLowTick,
            defaultHighTick,
        ],
    );
    const pinnedMinPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            ).pinnedMinPriceDisplayTruncatedWithCommas,
        [
            baseTokenDecimals,
            quoteTokenDecimals,
            defaultLowTick,
            defaultHighTick,
        ],
    );
    const pinnedMaxPriceDisplayTruncatedInBase = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                true,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            ).pinnedMaxPriceDisplayTruncatedWithCommas,
        [
            baseTokenDecimals,
            quoteTokenDecimals,
            defaultLowTick,
            defaultHighTick,
        ],
    );
    const pinnedMaxPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            ).pinnedMaxPriceDisplayTruncatedWithCommas,
        [
            baseTokenDecimals,
            quoteTokenDecimals,
            defaultLowTick,
            defaultHighTick,
        ],
    );

    const liquidityProviderFeeString = (liquidityFee * 100).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    const isTokenAWalletBalanceSufficient =
        fromDisplayQty(tokenABalance || '0', tokenA.decimals) >=
        tokenAQtyCoveredByWalletBalance;

    const isTokenBWalletBalanceSufficient =
        fromDisplayQty(tokenBBalance || '0', tokenB.decimals) >=
        tokenBQtyCoveredByWalletBalance;

    const isTokenAAllowanceSufficient =
        tokenAAllowance === undefined
            ? true
            : tokenAAllowance >= tokenAQtyCoveredByWalletBalance;

    const isTokenBAllowanceSufficient =
        tokenBAllowance === undefined
            ? true
            : tokenBAllowance >= tokenBQtyCoveredByWalletBalance;

    // values if either token needs to be confirmed before transacting

    const needConfirmTokenA = useMemo(() => {
        return !tokens.verify(tokenA.address);
    }, [tokenA.address, tokens]);
    const needConfirmTokenB = useMemo(() => {
        return !tokens.verify(tokenB.address);
    }, [tokenB.address, tokens]);

    // value showing if no acknowledgement is necessary
    const areBothAckd: boolean = !needConfirmTokenA && !needConfirmTokenB;

    useEffect(() => {
        if (simpleRangeWidth !== rangeWidthPercentage) {
            setSimpleRangeWidth(simpleRangeWidth);
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
        setNewRangeTransactionHash('');
    }, [baseToken.address + quoteToken.address]);

    useEffect(() => {
        if (!isAdd) {
            setCurrentRangeInAdd('');
        }
    }, [isAdd]);

    const { isTokenAInputDisabled, isTokenBInputDisabled } =
        useRangeInputDisable(
            isAmbient,
            isTokenABase,
            currentPoolPriceTick,
            defaultLowTick,
            defaultHighTick,
            isDenomBase,
        );

    useEffect(() => {
        if (rangeWidthPercentage === 100 && !advancedMode) {
            setIsAmbient(true);
            setRangeLowBoundNonDisplayPrice(0);
            setRangeHighBoundNonDisplayPrice(Infinity);
        } else if (advancedMode) {
            setIsAmbient(false);
            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            );

            setPinnedDisplayPrices(pinnedDisplayPrices);
        } else {
            setIsAmbient(false);
            if (Math.abs(currentPoolPriceTick) === Infinity) return;
            const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
            const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                lowTick,
                highTick,
                gridSize,
            );

            setPinnedDisplayPrices(pinnedDisplayPrices);

            setRangeLowBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMinPriceNonDisplay,
            );
            setRangeHighBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
            );

            setPinnedMinPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            );
            setPinnedMaxPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            );

            setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick);
            setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick);

            setMaxRangePrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinRangePrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );
        }
    }, [
        rangeWidthPercentage,
        advancedMode,
        isDenomBase,
        currentPoolPriceTick,
        baseToken.address + quoteToken.address,
        baseTokenDecimals,
        quoteTokenDecimals,
        defaultLowTick,
        defaultHighTick,
        gridSize,
    ]);

    useEffect(() => {
        resetConfirmation();
    }, [isTokenAPrimary]);

    useEffect(() => {
        if (isTokenAInputDisabled) setIsTokenAPrimary(false);
        if (isTokenBInputDisabled) setIsTokenAPrimary(true);
    }, [isTokenAInputDisabled, isTokenBInputDisabled]);

    useEffect(() => {
        setIsWithdrawTokenAFromDexChecked(
            fromDisplayQty(tokenADexBalance || '0', tokenA.decimals) > 0,
        );
    }, [tokenADexBalance]);

    useEffect(() => {
        setIsWithdrawTokenBFromDexChecked(
            fromDisplayQty(tokenBDexBalance || '0', tokenB.decimals) > 0,
        );
    }, [tokenBDexBalance]);

    useEffect(() => {
        if (advancedMode) {
            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            );
            setRangeLowBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMinPriceNonDisplay,
            );
            setRangeHighBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
            );

            setPinnedMinPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            );
            setPinnedMaxPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            );

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

            setMaxRangePrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinRangePrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );
        }
    }, [
        currentPoolPriceTick,
        defaultLowTick,
        defaultHighTick,
        isDenomBase,
        baseTokenDecimals,
        quoteTokenDecimals,
        advancedMode,
    ]);

    useEffect(() => {
        if (rangeLowBoundFieldBlurred || chartTriggeredBy === 'low_line') {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;
            const targetMinValue = minRangePrice;
            const targetMaxValue = maxRangePrice;

            const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                gridSize,
            );

            !isDenomBase
                ? setRangeLowBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMinPriceNonDisplay,
                  )
                : setRangeHighBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
                  );

            !isDenomBase
                ? setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick)
                : setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick);

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

            setPinnedMinPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            );

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
    }, [
        rangeLowBoundFieldBlurred,
        chartTriggeredBy,
        minRangePrice,
        maxRangePrice,
        isDenomBase,
    ]);

    useEffect(() => {
        if (rangeHighBoundFieldBlurred || chartTriggeredBy === 'high_line') {
            const rangeHighBoundDisplayField = document.getElementById(
                'max-price-input-quantity',
            ) as HTMLInputElement;

            const repoMaxPriceDisplay = document.getElementById(
                ' repo-info-max-price-display',
            ) as HTMLInputElement;

            const targetMaxValue = maxRangePrice;
            const targetMinValue = minRangePrice;

            const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                gridSize,
            );

            isDenomBase
                ? setRangeLowBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMinPriceNonDisplay,
                  )
                : setRangeHighBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
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

            setPinnedMaxPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            );

            if (rangeHighBoundDisplayField) {
                rangeHighBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;

                if (repoMaxPriceDisplay) {
                    repoMaxPriceDisplay.value =
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
                }
            } else {
                IS_LOCAL_ENV && console.debug('high bound field not found');
            }

            setRangeHighBoundFieldBlurred(false);
            setChartTriggeredBy('none');
            setIsLinesSwitched(false);
        }
    }, [
        rangeHighBoundFieldBlurred,
        chartTriggeredBy,
        minRangePrice,
        maxRangePrice,
        isDenomBase,
    ]);

    const [
        amountToReduceNativeTokenQtyMainnet,
        setAmountToReduceNativeTokenQtyMainnet,
    ] = useState<number>(0.01);
    const [amountToReduceNativeTokenQtyL2, setAmountToReduceNativeTokenQtyL2] =
        useState<number>(0.0005);

    const isScroll = chainId === '0x82750' || chainId === '0x8274f';
    const [l1GasFeePoolInGwei] = useState<number>(
        isScroll ? 10000 : isActiveNetworkBlast ? 10000 : 0,
    );
    const [extraL1GasFeePool] = useState(
        isScroll ? 0.01 : isActiveNetworkBlast ? 0.01 : 0,
    );

    const amountToReduceNativeTokenQty =
        chainId === '0x82750' || chainId === '0x8274f' || chainId === '0x13e31'
            ? amountToReduceNativeTokenQtyL2
            : amountToReduceNativeTokenQtyMainnet;

    const activeRangeTxHash = useRef<string>('');

    // reset activeTxHash when the pair changes or user updates quantity
    useEffect(() => {
        activeRangeTxHash.current = '';
    }, [tokenA.address + tokenB.address, primaryQuantity]);

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const costOfMainnetPoolInETH =
                gasPriceInGwei * GAS_DROPS_ESTIMATE_POOL * NUM_GWEI_IN_WEI;

            setAmountToReduceNativeTokenQtyMainnet(
                costOfMainnetPoolInETH * RANGE_BUFFER_MULTIPLIER_MAINNET,
            );

            const l2CostOfScrollPoolInETH =
                gasPriceInGwei * GAS_DROPS_ESTIMATE_POOL * NUM_GWEI_IN_WEI;

            const l1CostOfScrollPoolInETH =
                l1GasFeePoolInGwei / NUM_GWEI_IN_ETH;

            const costOfScrollPoolInETH =
                l1CostOfScrollPoolInETH + l2CostOfScrollPoolInETH;

            setAmountToReduceNativeTokenQtyMainnet(
                RANGE_BUFFER_MULTIPLIER_MAINNET * costOfMainnetPoolInETH,
            );

            setAmountToReduceNativeTokenQtyL2(
                RANGE_BUFFER_MULTIPLIER_L2 * costOfScrollPoolInETH,
            );

            const gasPriceInDollarsNum =
                gasPriceInGwei *
                GAS_DROPS_ESTIMATE_POOL *
                NUM_GWEI_IN_WEI *
                ethMainnetUsdPrice;

            setRangeGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum + extraL1GasFeePool,
                    isUSD: true,
                }),
            );
        }
    }, [
        gasPriceInGwei,
        ethMainnetUsdPrice,
        l1GasFeePoolInGwei,
        extraL1GasFeePool,
    ]);

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setTxError(undefined);
        setNewRangeTransactionHash('');
    };
    const { createRangePosition } = useCreateRangePosition();
    const sendTransaction = async () => {
        if (!crocEnv) return;
        setShowConfirmation(true);

        editFunction
            ? editFunction({
                  setTxError,
                  resetConfirmation,
                  setShowConfirmation,
                  defaultLowTick,
                  defaultHighTick,
              })
            : createRangePosition({
                  slippageTolerancePercentage,
                  isAmbient,
                  tokenAInputQty: isTokenAInputDisabled ? '0' : tokenAInputQty,
                  tokenBInputQty: isTokenBInputDisabled ? '0' : tokenBInputQty,
                  isWithdrawTokenAFromDexChecked,
                  isWithdrawTokenBFromDexChecked,
                  defaultLowTick,
                  defaultHighTick,
                  isAdd,
                  setNewRangeTransactionHash,
                  setTxError,
                  resetConfirmation,
                  activeRangeTxHash,
              });
    };

    const handleModalOpen = () => {
        resetConfirmation();
        openModal();
    };

    const handleModalClose = () => {
        resetConfirmation();
        closeModal();
    };

    const toggleDexSelection = (tokenAorB: 'A' | 'B') => {
        if (tokenAorB === 'A') {
            setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked);
        } else {
            setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked);
        }
    };

    const clearTokenInputs = () => {
        setTokenAInputQty('');
        setTokenBInputQty('');
        setPrimaryQuantity('');
    };
    const {
        tokenAllowed: tokenAAllowed,
        rangeButtonErrorMessage: rangeButtonErrorMessageTokenA,
    } = useHandleRangeButtonMessage(
        tokenA,
        tokenAInputQty,
        tokenABalance,
        tokenADexBalance,
        isTokenAInputDisabled,
        isWithdrawTokenAFromDexChecked,
        isPoolInitialized,
        tokenAQtyCoveredByWalletBalance,
        amountToReduceNativeTokenQty,
        activeRangeTxHash,
        clearTokenInputs,
    );
    const {
        tokenAllowed: tokenBAllowed,
        rangeButtonErrorMessage: rangeButtonErrorMessageTokenB,
    } = useHandleRangeButtonMessage(
        tokenB,
        tokenBInputQty,
        tokenBBalance,
        tokenBDexBalance,
        isTokenBInputDisabled,
        isWithdrawTokenBFromDexChecked,
        isPoolInitialized,
        tokenBQtyCoveredByWalletBalance,
        amountToReduceNativeTokenQty,
        activeRangeTxHash,
        clearTokenInputs,
    );

    const { approve, isApprovalPending } = useApprove();

    // logic to acknowledge one or both tokens as necessary
    const ackAsNeeded = (): void => {
        needConfirmTokenA && tokens.acknowledge(tokenA);
        needConfirmTokenB && tokens.acknowledge(tokenB);
    };

    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider:
            setRescaleRangeBoundariesWithSlider,
        inputId: 'input-slider-range',
    };

    const rangePriceInfoProps = {
        pinnedDisplayPrices: pinnedDisplayPrices,
        spotPriceDisplay: getFormattedNumber({
            value: displayPriceWithDenom,
        }),
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        // aprPercentage: aprPercentage,
        daysInRange: daysInRange,
        isTokenABase: isTokenABase,
        poolPriceCharacter: poolPriceCharacter,
        isAmbient: isAmbient,
    };

    const minMaxPriceProps = {
        minPricePercentage: minPriceDifferencePercentage,
        maxPricePercentage: maxPriceDifferencePercentage,
        minPriceInputString: minPriceInputString,
        maxPriceInputString: maxPriceInputString,
        setMinPriceInputString: setMinPriceInputString,
        setMaxPriceInputString: setMaxPriceInputString,
        isDenomBase: isDenomBase,
        highBoundOnBlur: () => setRangeHighBoundFieldBlurred(true),
        lowBoundOnBlur: () => setRangeLowBoundFieldBlurred(true),
        rangeLowTick: defaultLowTick,
        rangeHighTick: defaultHighTick,
        disable: isInvalidRange || !isPoolInitialized,
        maxRangePrice: maxRangePrice,
        minRangePrice: minRangePrice,
        setMaxRangePrice: setMaxRangePrice,
        setMinRangePrice: setMinRangePrice,
    };

    const rangeExtraInfoProps = {
        isQtyEntered: isQtyEntered,
        rangeGasPriceinDollars: rangeGasPriceinDollars,
        poolPriceDisplay: getFormattedNumber({
            value: displayPriceWithDenom,
        }),
        slippageTolerance: slippageTolerancePercentage,
        liquidityProviderFeeString: liquidityProviderFeeString,
        quoteTokenIsBuy: true,
        isTokenABase: isTokenABase,
        showExtraInfoDropdown: showExtraInfoDropdown,
        isBalancedMode: !advancedMode,
        // aprPercentage: aprPercentage,
        daysInRange: daysInRange,
    };

    if (isReposition)
        return (
            <RangeBounds
                isRangeBoundsDisabled={!isPoolInitialized}
                {...rangeWidthProps}
                {...rangePriceInfoProps}
                {...minMaxPriceProps}
                isEditPanel={isEditPanel}
                isReposition={isReposition}
            />
        );

    return (
        <TradeModuleSkeleton
            isEditPanel={isEditPanel}
            chainId={chainId}
            header={
                isEditPanel ? null : (
                    <TradeModuleHeader
                        slippage={mintSlippage}
                        bypassConfirm={bypassConfirmRange}
                        settingsTitle='Pool'
                    />
                )
            }
            input={
                <RangeTokenInput
                    isAmbient={isAmbient}
                    depositSkew={depositSkew}
                    poolPriceNonDisplay={poolPriceNonDisplay}
                    isWithdrawFromDexChecked={{
                        tokenA: isWithdrawTokenAFromDexChecked,
                        tokenB: isWithdrawTokenBFromDexChecked,
                    }}
                    isOutOfRange={isOutOfRange}
                    tokenAInputQty={{
                        value: tokenAInputQty,
                        set: setTokenAInputQty,
                    }}
                    tokenBInputQty={{
                        value: tokenBInputQty,
                        set: setTokenBInputQty,
                    }}
                    toggleDexSelection={toggleDexSelection}
                    isInputDisabled={{
                        tokenA: isTokenAInputDisabled,
                        tokenB: isTokenBInputDisabled,
                    }}
                    amountToReduceNativeTokenQty={amountToReduceNativeTokenQty}
                    isEditPanel={isEditPanel}
                />
            }
            inputOptions={
                <RangeBounds
                    isRangeBoundsDisabled={!isPoolInitialized}
                    {...rangeWidthProps}
                    {...rangePriceInfoProps}
                    {...minMaxPriceProps}
                    isEditPanel={isEditPanel}
                />
            }
            transactionDetails={
                isEditPanel ? null : <RangeExtraInfo {...rangeExtraInfoProps} />
            }
            modal={
                isOpen ? (
                    <ConfirmRangeModal
                        tokenAQty={isTokenAInputDisabled ? '' : tokenAInputQty}
                        tokenBQty={isTokenBInputDisabled ? '' : tokenBInputQty}
                        spotPriceDisplay={getFormattedNumber({
                            value: displayPriceWithDenom,
                        })}
                        isTokenABase={isTokenABase}
                        isAmbient={isAmbient}
                        isAdd={isAdd}
                        maxPriceDisplay={maxPriceDisplay}
                        minPriceDisplay={minPriceDisplay}
                        sendTransaction={sendTransaction}
                        newRangeTransactionHash={newRangeTransactionHash}
                        resetConfirmation={resetConfirmation}
                        showConfirmation={showConfirmation}
                        txError={txError}
                        isInRange={!isOutOfRange}
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
                        onClose={handleModalClose}
                        slippageTolerance={slippageTolerancePercentage}
                        isEditPanel={isEditPanel}
                    />
                ) : (
                    <></>
                )
            }
            button={
                <Button
                    idForDOM='submit_range_position_button'
                    style={{ textTransform: 'none' }}
                    title={
                        areBothAckd
                            ? tokenAAllowed && tokenBAllowed
                                ? bypassConfirmRange.isEnabled
                                    ? isAdd
                                        ? `Add ${
                                              isAmbient ? 'Ambient' : ''
                                          } Liquidity`
                                        : `Submit ${
                                              isAmbient ? 'Ambient' : ''
                                          } Liquidity`
                                    : 'Confirm'
                                : rangeButtonErrorMessageTokenA ||
                                  rangeButtonErrorMessageTokenB
                            : 'Acknowledge'
                    }
                    action={
                        areBothAckd
                            ? bypassConfirmRange.isEnabled
                                ? sendTransaction
                                : handleModalOpen
                            : ackAsNeeded
                    }
                    disabled={
                        (!isPoolInitialized ||
                            !(tokenAAllowed && tokenBAllowed) ||
                            isInvalidRange) &&
                        areBothAckd
                    }
                    flat={true}
                />
            }
            bypassConfirm={
                showConfirmation && bypassConfirmRange.isEnabled ? (
                    <SubmitTransaction
                        type='Range'
                        newTransactionHash={newRangeTransactionHash}
                        txError={txError}
                        resetConfirmation={resetConfirmation}
                        sendTransaction={sendTransaction}
                        transactionPendingDisplayString={
                            isAdd
                                ? `Adding ${tokenA.symbol} and ${tokenB.symbol}`
                                : `Minting a Position with ${
                                      !isTokenAInputDisabled
                                          ? tokenA.symbol
                                          : ''
                                  } ${
                                      !isTokenAInputDisabled &&
                                      !isTokenBInputDisabled
                                          ? 'and'
                                          : ''
                                  } ${
                                      !isTokenBInputDisabled
                                          ? tokenB.symbol
                                          : ''
                                  }
                                        `
                        }
                    />
                ) : undefined
            }
            approveButton={
                isPoolInitialized &&
                parseFloat(tokenAInputQty) > 0 &&
                isTokenAWalletBalanceSufficient &&
                !isTokenAAllowanceSufficient ? (
                    <Button
                        idForDOM='approve_token_for_range'
                        style={{ textTransform: 'none' }}
                        title={
                            !isApprovalPending
                                ? `Approve ${tokenA.symbol}`
                                : `${tokenA.symbol} Approval Pending`
                        }
                        disabled={isApprovalPending}
                        action={async () => {
                            await approve(tokenA.address, tokenA.symbol);
                        }}
                        flat={true}
                    />
                ) : isPoolInitialized &&
                  parseFloat(tokenBInputQty) > 0 &&
                  isTokenBWalletBalanceSufficient &&
                  !isTokenBAllowanceSufficient ? (
                    <Button
                        idForDOM='approve_token_for_range'
                        style={{ textTransform: 'none' }}
                        title={
                            !isApprovalPending
                                ? `Approve ${tokenB.symbol}`
                                : `${tokenB.symbol} Approval Pending`
                        }
                        disabled={isApprovalPending}
                        action={async () => {
                            await approve(tokenB.address, tokenB.symbol);
                        }}
                        flat={true}
                    />
                ) : undefined
            }
            tutorialSteps={rangeTutorialSteps}
        />
    );
}

export default memo(Range);
