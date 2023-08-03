import { concDepositSkew, capitalConcFactor } from '@crocswap-libs/sdk';
import { motion } from 'framer-motion';
import { useContext, useState, useEffect, useMemo, memo } from 'react';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import { getReceiptTxHashes } from '../../../App/functions/getReceiptTxHashes';
import Button from '../../../components/Global/Button/Button';
// import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import Modal from '../../../components/Global/Modal/Modal';
import { useModal } from '../../../components/Global/Modal/useModal';
// import AdvancedPriceInfo from '../../../components/Trade/Range/AdvancedModeComponents/AdvancedPriceInfo/AdvancedPriceInfo';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import AdvancedModeToggle from '../../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import ConfirmRangeModal from '../../../components/Trade/Range/ConfirmRangeModal/ConfirmRangeModal';
import RangeExtraInfo from '../../../components/Trade/Range/RangeExtraInfo/RangeExtraInfo';
import RangePriceInfo from '../../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeTokenInput from '../../../components/Trade/Range/RangeTokenInput/RangeTokenInput';
import RangeWidth from '../../../components/Trade/Range/RangeWidth/RangeWidth';
import BypassConfirmButton from '../../../components/Trade/TradeModules/BypassConfirmButton/BypassConfirmButton';
import TradeModuleHeader from '../../../components/Trade/TradeModules/TradeModuleHeader';
import { TradeModuleSkeleton } from '../../../components/Trade/TradeModules/TradeModuleSkeleton';
import { IS_LOCAL_ENV } from '../../../constants';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { RangeContext } from '../../../contexts/RangeContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { isStablePair } from '../../../utils/data/stablePairs';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import { diffHashSig } from '../../../utils/functions/diffHashSig';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
import {
    addPendingTx,
    addTransactionByType,
    removePendingTx,
    addReceipt,
} from '../../../utils/state/receiptDataSlice';
import {
    setAdvancedLowTick,
    setAdvancedHighTick,
    setIsLinesSwitched,
    setIsTokenAPrimaryRange,
} from '../../../utils/state/tradeDataSlice';
import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
} from '../../../utils/TransactionError';
import { rangeTutorialSteps } from '../../../utils/tutorial/Range';
import styles from './Range.module.css';
import {
    roundDownTick,
    roundUpTick,
    getPinnedPriceValuesFromTicks,
    getPinnedPriceValuesFromDisplayPrices,
} from './rangeFunctions';

const DEFAULT_MIN_PRICE_DIFF_PERCENTAGE = -10;
const DEFAULT_MAX_PRICE_DIFF_PERCENTAGE = 10;

function Range() {
    const {
        crocEnv,
        chainData: { chainId, gridSize },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { isPoolInitialized, poolPriceDisplay, ambientApy, dailyVol } =
        useContext(PoolContext);
    const {
        simpleRangeWidth,
        setSimpleRangeWidth,
        minRangePrice: minPrice,
        maxRangePrice: maxPrice,
        setMaxRangePrice: setMaxPrice,
        setMinRangePrice: setMinPrice,
        setChartTriggeredBy,
        chartTriggeredBy,
        setRescaleRangeBoundariesWithSlider,
        setCurrentRangeInAdd,
    } = useContext(RangeContext);
    const { tokens } = useContext(TokenContext);
    const {
        baseToken: { address: baseTokenAddress },
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
        baseToken: {
            balance: baseTokenBalance,
            dexBalance: baseTokenDexBalance,
        },
        quoteToken: {
            balance: quoteTokenBalance,
            dexBalance: quoteTokenDexBalance,
        },
    } = useContext(TradeTokenContext);
    const { mintSlippage, dexBalRange, bypassConfirmRange } = useContext(
        UserPreferenceContext,
    );

    const dispatch = useAppDispatch();
    const [
        isConfirmationModalOpen,
        openConfirmationModal,
        closeConfirmationModal,
    ] = useModal();
    const {
        tradeData: {
            isDenomBase,
            isTokenAPrimaryRange,
            primaryQuantityRange,
            isLinesSwitched,
            tokenA,
            tokenB,
            poolPriceNonDisplay,
            baseToken,
            quoteToken,
            advancedHighTick,
            advancedLowTick,
            advancedMode,
            liquidityFee,
        },
        receiptData: { sessionReceipts, pendingTransactions },
        graphData,
    } = useAppSelector((state) => state);

    const [tokenAAllowed, setTokenAAllowed] = useState<boolean>(false);
    const [tokenBAllowed, setTokenBAllowed] = useState<boolean>(false);
    const [isTokenAInputDisabled, setIsTokenAInputDisabled] = useState(false);
    const [isTokenBInputDisabled, setIsTokenBInputDisabled] = useState(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>(
        isTokenAPrimaryRange ? primaryQuantityRange : '',
    );
    const [tokenBInputQty, setTokenBInputQty] = useState<string>(
        !isTokenAPrimaryRange ? primaryQuantityRange : '',
    );
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
    const [pinnedDisplayPrices, setPinnedDisplayPrices] = useState<
        | {
              pinnedMinPriceDisplay: string;
              pinnedMaxPriceDisplay: string;
              pinnedMinPriceDisplayTruncated: string;
              pinnedMaxPriceDisplayTruncated: string;
              pinnedMinPriceDisplayTruncatedWithCommas: string;
              pinnedMaxPriceDisplayTruncatedWithCommas: string;
              pinnedLowTick: number;
              pinnedHighTick: number;
              pinnedMinPriceNonDisplay: number;
              pinnedMaxPriceNonDisplay: number;
          }
        | undefined
    >();

    // local state values whether tx will use dex balance preferentially over
    // ... wallet funds, this layer of logic matters because the DOM may need
    // ... to use wallet funds without switching the persisted preference
    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);
    const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);
    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const [showConfirmation, setShowConfirmation] = useState(true);
    const [showBypassConfirmButton, setShowBypassConfirmButton] =
        useState(false);

    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [rangeButtonErrorMessage, setRangeButtonErrorMessage] =
        useState<string>('');

    const [rangeGasPriceinDollars, setRangeGasPriceinDollars] = useState<
        string | undefined
    >();

    const isTokenABase = tokenA.address === baseTokenAddress;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const slippageTolerancePercentage = isStablePair(
        tokenA.address,
        tokenB.address,
        chainId,
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
        (advancedLowTick === 0 ||
            advancedHighTick > currentPoolPriceTick + 100000 ||
            advancedLowTick < currentPoolPriceTick - 100000);
    const shouldResetAdvancedHighTick =
        !ticksInParams &&
        (advancedHighTick === 0 ||
            advancedHighTick > currentPoolPriceTick + 100000 ||
            advancedLowTick < currentPoolPriceTick - 100000);
    // default low tick to seed in the DOM (range lower value)
    const defaultLowTick = useMemo(() => {
        const value = shouldResetAdvancedLowTick
            ? roundDownTick(
                  currentPoolPriceTick +
                      DEFAULT_MIN_PRICE_DIFF_PERCENTAGE * 100,
                  gridSize,
              )
            : advancedLowTick;
        return value;
    }, [advancedLowTick, currentPoolPriceTick, shouldResetAdvancedLowTick]);
    // default high tick to seed in the DOM (range upper value)
    const defaultHighTick = useMemo(() => {
        const value = shouldResetAdvancedHighTick
            ? roundUpTick(
                  currentPoolPriceTick +
                      DEFAULT_MAX_PRICE_DIFF_PERCENTAGE * 100,
                  gridSize,
              )
            : advancedHighTick;
        return value;
    }, [advancedHighTick, currentPoolPriceTick, shouldResetAdvancedHighTick]);

    const userPositions = graphData.positionsByUser.positions.filter(
        (x) => x.chainId === chainId,
    );
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
        [
            diffHashSig(userPositions),
            isAmbient,
            defaultLowTick,
            defaultHighTick,
        ],
    );

    const tokenABalance = isTokenABase ? baseTokenBalance : quoteTokenBalance;
    const tokenBBalance = isTokenABase ? quoteTokenBalance : baseTokenBalance;
    const tokenADexBalance = isTokenABase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;
    const tokenBDexBalance = isTokenABase
        ? quoteTokenDexBalance
        : baseTokenDexBalance;
    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - parseFloat(tokenAInputQty || '0');
    const tokenBSurplusMinusTokenBRemainderNum =
        parseFloat(tokenBDexBalance || '0') - parseFloat(tokenBInputQty || '0');
    const tokenAQtyCoveredByWalletBalance = isWithdrawTokenAFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum < 0
            ? tokenASurplusMinusTokenARemainderNum * -1
            : 0
        : parseFloat(tokenAInputQty || '0');
    const tokenBQtyCoveredByWalletBalance = isWithdrawTokenBFromDexChecked
        ? tokenBSurplusMinusTokenBRemainderNum < 0
            ? tokenBSurplusMinusTokenBRemainderNum * -1
            : 0
        : parseFloat(tokenBInputQty || '0');
    const isQtyEntered = tokenAInputQty !== '' && tokenBInputQty !== '';
    const showExtraInfoDropdown =
        tokenAInputQty !== '' || tokenBInputQty !== '';

    const rangeSpanAboveCurrentPrice = defaultHighTick - currentPoolPriceTick;
    const rangeSpanBelowCurrentPrice = currentPoolPriceTick - defaultLowTick;
    const isOutOfRange = !advancedMode
        ? false
        : rangeSpanAboveCurrentPrice < 0 || rangeSpanBelowCurrentPrice < 0;
    const isInvalidRange = !isAmbient && defaultHighTick <= defaultLowTick;

    let receiveReceiptHashes: Array<string> = [];
    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receiveReceiptHashes.includes(hash),
    );
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

    let aprPercentage = ambientApy;
    if (!isAmbient && ambientApy && poolPriceNonDisplay) {
        const concFactor = capitalConcFactor(
            poolPriceNonDisplay,
            rangeLowBoundNonDisplayPrice,
            rangeHighBoundNonDisplayPrice,
        );
        aprPercentage = ambientApy * concFactor;
    }
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

    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= tokenAQtyCoveredByWalletBalance;

    const isTokenBAllowanceSufficient =
        parseFloat(tokenBAllowance) >= tokenBQtyCoveredByWalletBalance;

    // values if either token needs to be confirmed before transacting
    const needConfirmTokenA = !tokens.verify(tokenA.address);
    const needConfirmTokenB = !tokens.verify(tokenB.address);
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
            // dispatch(setRangeModuleTriggered(true));
            setSimpleRangeWidth(rangeWidthPercentage);
        }
    }, [rangeWidthPercentage]);

    useEffect(() => {
        setNewRangeTransactionHash('');
        setShowBypassConfirmButton(false);
        setPinnedDisplayPrices(undefined);
    }, [baseToken.address + quoteToken.address]);

    useEffect(() => {
        if (!isAdd) {
            setCurrentRangeInAdd('');
        }
    }, [isAdd]);

    useEffect(() => {
        if (!isAmbient) {
            if (isTokenABase) {
                if (defaultHighTick < currentPoolPriceTick) {
                    setIsTokenBInputDisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenAInputDisabled(false);
                    } else setIsTokenAInputDisabled(true);
                } else if (defaultLowTick > currentPoolPriceTick) {
                    setIsTokenAInputDisabled(true);
                    if (defaultLowTick < defaultHighTick) {
                        setIsTokenBInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else {
                    setIsTokenAInputDisabled(false);
                    setIsTokenBInputDisabled(false);
                }
            } else {
                if (defaultHighTick < currentPoolPriceTick) {
                    setIsTokenAInputDisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenBInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else if (defaultLowTick > currentPoolPriceTick) {
                    setIsTokenBInputDisabled(true);
                    if (defaultLowTick < defaultHighTick) {
                        setIsTokenAInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else {
                    setIsTokenBInputDisabled(false);
                    setIsTokenAInputDisabled(false);
                }
            }
        } else {
            setIsTokenBInputDisabled(false);
            setIsTokenAInputDisabled(false);
        }
    }, [
        isAmbient,
        isTokenABase,
        currentPoolPriceTick,
        defaultLowTick,
        defaultHighTick,
        isDenomBase,
    ]);

    useEffect(() => {
        if (rangeWidthPercentage === 100 && !advancedMode) {
            setIsAmbient(true);
            setRangeLowBoundNonDisplayPrice(0);
            setRangeHighBoundNonDisplayPrice(Infinity);
        } else if (advancedMode) {
            setIsAmbient(false);
        } else {
            setIsAmbient(false);
            updatePinnedDisplayPrices();
            if (
                Math.abs(currentPoolPriceTick) === Infinity ||
                Math.abs(currentPoolPriceTick) === 0
            )
                return;
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

            dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick));
            dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

            setMaxPrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinPrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );
        }
    }, [
        rangeWidthPercentage,
        advancedMode,
        isDenomBase,
        currentPoolPriceTick,
        baseToken.address + quoteToken.address,
    ]);

    useEffect(() => {
        handleRangeButtonMessageTokenA(tokenAInputQty);
        handleRangeButtonMessageTokenB(tokenBInputQty);
    }, [isQtyEntered, isPoolInitialized, isInvalidRange, poolPriceNonDisplay]);

    useEffect(() => {
        if (isTokenAInputDisabled) dispatch(setIsTokenAPrimaryRange(false));
        if (isTokenBInputDisabled) dispatch(setIsTokenAPrimaryRange(true));
    }, [isTokenAInputDisabled, isTokenBInputDisabled]);

    useEffect(() => {
        receiveReceiptHashes = getReceiptTxHashes(sessionReceipts);
    }, [sessionReceipts]);

    useEffect(() => {
        setIsWithdrawTokenAFromDexChecked(parseFloat(tokenADexBalance) > 0);
    }, [tokenADexBalance]);

    useEffect(() => {
        setIsWithdrawTokenBFromDexChecked(parseFloat(tokenBDexBalance) > 0);
    }, [tokenBDexBalance]);

    useEffect(() => {
        if (
            !currentPendingTransactionsArray.length &&
            !isWaitingForWallet &&
            txErrorCode === ''
        ) {
            setShowBypassConfirmButton(false);
        }
    }, [
        currentPendingTransactionsArray.length,
        isWaitingForWallet,
        txErrorCode === '',
    ]);

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

            dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick));
            dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

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

            !isDenomBase
                ? setRangeLowBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMinPriceNonDisplay,
                  )
                : setRangeHighBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
                  );

            !isDenomBase
                ? dispatch(
                      setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick),
                  )
                : dispatch(
                      setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick),
                  );

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
                    ? dispatch(
                          setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick),
                      )
                    : dispatch(
                          setAdvancedHighTick(
                              pinnedDisplayPrices.pinnedHighTick,
                          ),
                      );
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
            dispatch(setIsLinesSwitched(false));
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

            isDenomBase
                ? setRangeLowBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMinPriceNonDisplay,
                  )
                : setRangeHighBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
                  );

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
                ? dispatch(
                      setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick),
                  )
                : dispatch(
                      setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick),
                  );
            if (isLinesSwitched) {
                !isDenomBase
                    ? dispatch(
                          setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick),
                      )
                    : dispatch(
                          setAdvancedHighTick(
                              pinnedDisplayPrices.pinnedHighTick,
                          ),
                      );
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
            } else {
                IS_LOCAL_ENV && console.debug('high bound field not found');
            }

            setRangeHighBoundFieldBlurred(false);
            setChartTriggeredBy('none');
            dispatch(setIsLinesSwitched(false));
        }
    }, [rangeHighBoundFieldBlurred, chartTriggeredBy]);

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const averageRangeCostInGasDrops = 140000;
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageRangeCostInGasDrops *
                1e-9 *
                ethMainnetUsdPrice;

            setRangeGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const updatePinnedDisplayPrices = () => {
        if (
            Math.abs(currentPoolPriceTick) === Infinity ||
            Math.abs(currentPoolPriceTick) === 0
        )
            return;
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

        dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick));
        dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

        setMaxPrice(
            parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
        );
        setMinPrice(
            parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
        );
    };

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');
    };

    const sendTransaction = async () => {
        if (!crocEnv) return;

        resetConfirmation();
        setIsWaitingForWallet(true);

        const pool = crocEnv.pool(tokenA.address, tokenB.address);

        const spot = await pool.displayPrice();

        const minPrice = spot * (1 - slippageTolerancePercentage / 100);
        const maxPrice = spot * (1 + slippageTolerancePercentage / 100);

        let tx;
        try {
            tx = await (isAmbient
                ? isTokenAPrimaryRange
                    ? pool.mintAmbientQuote(
                          isTokenAInputDisabled ? 0 : tokenAInputQty,
                          [minPrice, maxPrice],
                          {
                              surplus: [
                                  isWithdrawTokenAFromDexChecked,
                                  isWithdrawTokenBFromDexChecked,
                              ],
                          },
                      )
                    : pool.mintAmbientBase(
                          isTokenBInputDisabled ? 0 : tokenBInputQty,
                          [minPrice, maxPrice],
                          {
                              surplus: [
                                  isWithdrawTokenAFromDexChecked,
                                  isWithdrawTokenBFromDexChecked,
                              ],
                          },
                      )
                : isTokenAPrimaryRange
                ? pool.mintRangeQuote(
                      isTokenAInputDisabled ? 0 : tokenAInputQty,
                      [defaultLowTick, defaultHighTick],
                      [minPrice, maxPrice],
                      {
                          surplus: [
                              isWithdrawTokenAFromDexChecked,
                              isWithdrawTokenBFromDexChecked,
                          ],
                      },
                  )
                : pool.mintRangeBase(
                      isTokenBInputDisabled ? 0 : tokenBInputQty,
                      [defaultLowTick, defaultHighTick],
                      [minPrice, maxPrice],
                      {
                          surplus: [
                              isWithdrawTokenAFromDexChecked,
                              isWithdrawTokenBFromDexChecked,
                          ],
                      },
                  ));
            setNewRangeTransactionHash(tx?.hash);
            dispatch(addPendingTx(tx?.hash));
            if (tx?.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: isAdd
                            ? `Add to Range ${tokenA.symbol}+${tokenB.symbol}`
                            : `Create Range ${tokenA.symbol}+${tokenB.symbol}`,
                    }),
                );
            setIsWaitingForWallet(false);
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
                setNewRangeTransactionHash(newTransactionHash);
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }
        if (receipt) {
            dispatch(addReceipt(JSON.stringify(receipt)));
            dispatch(removePendingTx(receipt.transactionHash));
        }
    };

    const handleModalClose = () => {
        closeConfirmationModal();
        setNewRangeTransactionHash('');
        resetConfirmation();
    };

    const handleRangeButtonClickWithBypass = () => {
        setShowBypassConfirmButton(true);
        sendTransaction();
    };

    const toggleDexSelection = (tokenAorB: 'A' | 'B') => {
        if (tokenAorB === 'A') {
            setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked);
        } else {
            setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked);
        }
    };

    const handleRangeButtonMessageTokenA = (tokenAAmount: string) => {
        if (poolPriceNonDisplay === 0) {
            setTokenAAllowed(false);
            setRangeButtonErrorMessage('Invalid Token Pair');
        } else if (
            (isNaN(parseFloat(tokenAAmount)) ||
                parseFloat(tokenAAmount) <= 0) &&
            !isTokenAInputDisabled
        ) {
            setTokenAAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
        } else {
            if (isWithdrawTokenAFromDexChecked) {
                if (
                    parseFloat(tokenAAmount) >
                    parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                ) {
                    setTokenAAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tokenA.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else {
                    setTokenAAllowed(true);
                }
            } else {
                if (parseFloat(tokenAAmount) > parseFloat(tokenABalance)) {
                    setTokenAAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tokenA.symbol} Amount Exceeds Wallet Balance`,
                    );
                } else {
                    setTokenAAllowed(true);
                }
            }
        }
    };

    const handleRangeButtonMessageTokenB = (tokenBAmount: string) => {
        if (poolPriceNonDisplay === 0) {
            setTokenBAllowed(false);
            setRangeButtonErrorMessage('Invalid Token Pair');
        } else if (
            (isNaN(parseFloat(tokenBAmount)) ||
                parseFloat(tokenBAmount) <= 0) &&
            !isTokenBInputDisabled
        ) {
            setTokenBAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
        } else {
            if (isWithdrawTokenBFromDexChecked) {
                if (
                    parseFloat(tokenBAmount) >
                    parseFloat(tokenBDexBalance) + parseFloat(tokenBBalance)
                ) {
                    setTokenBAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tokenB.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else {
                    setTokenBAllowed(true);
                }
            } else {
                if (parseFloat(tokenBAmount) > parseFloat(tokenBBalance)) {
                    setTokenBAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tokenB.symbol} Amount Exceeds Wallet Balance`,
                    );
                } else {
                    setTokenBAllowed(true);
                }
            }
        }
    };

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
            setRecheckTokenBApproval(true);
        }
    };

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
    };

    const rangePriceInfoProps = {
        pinnedDisplayPrices: pinnedDisplayPrices,
        spotPriceDisplay: getFormattedNumber({
            value: displayPriceWithDenom,
        }),
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        aprPercentage: aprPercentage,
        daysInRange: daysInRange,
        isTokenABase: isTokenABase,
        poolPriceCharacter: poolPriceCharacter,
        isAmbient: isAmbient,
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
        aprPercentage: aprPercentage,
        daysInRange: daysInRange,
    };

    const baseModeContent = (
        <div className={styles.info_container}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <RangeWidth {...rangeWidthProps} />
            </motion.div>
            <RangePriceInfo {...rangePriceInfoProps} />
        </div>
    );
    const advancedModeContent = (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.advanced_info_container}>
                    <MinMaxPrice
                        minPricePercentage={minPriceDifferencePercentage}
                        maxPricePercentage={maxPriceDifferencePercentage}
                        minPriceInputString={minPriceInputString}
                        maxPriceInputString={maxPriceInputString}
                        setMinPriceInputString={setMinPriceInputString}
                        setMaxPriceInputString={setMaxPriceInputString}
                        isDenomBase={isDenomBase}
                        highBoundOnBlur={() =>
                            setRangeHighBoundFieldBlurred(true)
                        }
                        lowBoundOnBlur={() =>
                            setRangeLowBoundFieldBlurred(true)
                        }
                        rangeLowTick={defaultLowTick}
                        rangeHighTick={defaultHighTick}
                        disable={isInvalidRange || !isPoolInitialized}
                        maxPrice={maxPrice}
                        minPrice={minPrice}
                        setMaxPrice={setMaxPrice}
                        setMinPrice={setMinPrice}
                    />
                </div>
            </motion.div>
            {/* <DividerDark addMarginTop /> */}

            {/* <AdvancedPriceInfo
                poolPriceDisplay={getFormattedNumber({
                    value: displayPriceWithDenom,
                })}
                isTokenABase={isTokenABase}
                isOutOfRange={isOutOfRange}
                aprPercentage={aprPercentage}
            /> */}
        </>
    );

    return (
        <TradeModuleSkeleton
            header={
                <TradeModuleHeader
                    slippage={mintSlippage}
                    bypassConfirm={bypassConfirmRange}
                    settingsTitle='Pool'
                />
            }
            input={
                <>
                    <RangeTokenInput
                        isAmbient={isAmbient}
                        depositSkew={depositSkew}
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
                        handleButtonMessage={{
                            tokenA: handleRangeButtonMessageTokenA,
                            tokenB: handleRangeButtonMessageTokenB,
                        }}
                        isInputDisabled={{
                            tokenA: isTokenAInputDisabled,
                            tokenB: isTokenBInputDisabled,
                        }}
                    />
                </>
            }
            inputOptions={
                <>
                    {
                        <div className={styles.denomination_switch_container}>
                            <AdvancedModeToggle advancedMode={advancedMode} />
                        </div>
                    }
                    {advancedMode ? advancedModeContent : baseModeContent}
                </>
            }
            transactionDetails={<RangeExtraInfo {...rangeExtraInfoProps} />}
            modal={
                isConfirmationModalOpen ? (
                    <Modal
                        onClose={handleModalClose}
                        title={'Pool Confirmation'}
                        centeredTitle
                    >
                        <ConfirmRangeModal
                            tokenAQty={
                                isTokenAInputDisabled ? '' : tokenAInputQty
                            }
                            tokenBQty={
                                isTokenBInputDisabled ? '' : tokenBInputQty
                            }
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
                            setShowConfirmation={setShowConfirmation}
                            txErrorCode={txErrorCode}
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
                        />
                    </Modal>
                ) : undefined
            }
            button={
                <Button
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
                                : rangeButtonErrorMessage
                            : 'Acknowledge'
                    }
                    action={
                        areBothAckd
                            ? bypassConfirmRange.isEnabled
                                ? handleRangeButtonClickWithBypass
                                : openConfirmationModal
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
                showBypassConfirmButton ? (
                    <BypassConfirmButton
                        newTransactionHash={newRangeTransactionHash}
                        txErrorCode={txErrorCode}
                        resetConfirmation={resetConfirmation}
                        setShowBypassConfirmButton={setShowBypassConfirmButton}
                        sendTransaction={sendTransaction}
                        setNewTransactionHash={setNewRangeTransactionHash}
                        transactionPendingDisplayString={`Minting a Position with ${
                            tokenAInputQty ?? '0'
                        } ${tokenA.symbol} and ${tokenBInputQty ?? '0'} ${
                            tokenB.symbol
                        }.`}
                    />
                ) : undefined
            }
            approveButton={
                poolPriceNonDisplay !== 0 &&
                parseFloat(tokenAInputQty) > 0 &&
                !isTokenAAllowanceSufficient ? (
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
                        flat={true}
                    />
                ) : poolPriceNonDisplay !== 0 &&
                  parseFloat(tokenBInputQty) > 0 &&
                  !isTokenBAllowanceSufficient ? (
                    <Button
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
