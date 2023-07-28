/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { useState, useEffect, useMemo, useContext, memo } from 'react';
import { motion } from 'framer-motion';
import { concDepositSkew, capitalConcFactor } from '@crocswap-libs/sdk';

// START: Import JSX Elements
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import RangeButton from '../../../components/Trade/Range/RangeButton/RangeButton';
import RangeCurrencyConverter from '../../../components/Trade/Range/RangeCurrencyConverter/RangeCurrencyConverter';
import RangePriceInfo from '../../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeWidth from '../../../components/Trade/Range/RangeWidth/RangeWidth';
// import DenominationSwitch from '../../../components/Swap/DenominationSwitch/DenominationSwitch';
import AdvancedModeToggle from '../../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import AdvancedPriceInfo from '../../../components/Trade/Range/AdvancedModeComponents/AdvancedPriceInfo/AdvancedPriceInfo';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import Button from '../../../components/Global/Button/Button';
import RangeExtraInfo from '../../../components/Trade/Range/RangeExtraInfo/RangeExtraInfo';
import ConfirmRangeModal from '../../../components/Trade/Range/ConfirmRangeModal/ConfirmRangeModal';
import { FiExternalLink } from 'react-icons/fi';
// START: Import Local Files
import styles from './Range.module.css';
import {
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
    roundDownTick,
    roundUpTick,
} from './rangeFunctions';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import { PositionIF } from '../../../utils/interfaces/exports';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setIsLinesSwitched,
} from '../../../utils/state/tradeDataSlice';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
} from '../../../utils/state/receiptDataSlice';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import BypassConfirmRangeButton from '../../../components/Trade/Range/RangeButton/BypassConfirmRangeButton';
import TutorialOverlay from '../../../components/Global/TutorialOverlay/TutorialOverlay';
import {
    rangeTutorialSteps,
    rangeTutorialStepsAdvanced,
} from '../../../utils/tutorial/Range';
import { IS_LOCAL_ENV } from '../../../constants';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { diffHashSig } from '../../../utils/functions/diffHashSig';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { RangeContext } from '../../../contexts/RangeContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { isStablePair } from '../../../utils/data/stablePairs';
import { useTradeData } from '../../../App/hooks/useTradeData';
import { getReceiptTxHashes } from '../../../App/functions/getReceiptTxHashes';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import OrderHeader from '../../../components/Trade/OrderHeader/OrderHeader';
import { useModal } from '../../../components/Global/Modal/useModal';

function Range() {
    const {
        tutorial: { isActive: isTutorialActive },
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);
    const {
        chainData: { chainId, gridSize, blockExplorer },
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
    } = useContext(TradeTokenContext);
    const { mintSlippage, dexBalRange, bypassConfirmRange } = useContext(
        UserPreferenceContext,
    );

    const [isOpen, openModal, closeModal] = useModal();

    const [
        tokenAQtyCoveredByWalletBalance,
        setTokenAQtyCoveredByWalletBalance,
    ] = useState<number>(0);

    const [
        tokenBQtyCoveredByWalletBalance,
        setTokenBQtyCoveredByWalletBalance,
    ] = useState<number>(0);

    const [isAmbient, setIsAmbient] = useState(false);

    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<number>(0);
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<number>(0);

    const dispatch = useAppDispatch();

    // local state values whether tx will use dex balance preferentially over
    // ... wallet funds, this layer of logic matters because the DOM may need
    // ... to use wallet funds without switching the persisted preference
    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);

    const { crocEnv } = useContext(CrocEnvContext);
    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [txErrorCode, setTxErrorCode] = useState('');
    const [rangeGasPriceinDollars, setRangeGasPriceinDollars] = useState<
        string | undefined
    >();
    const userPositions = useAppSelector(
        (state) => state.graphData,
    ).positionsByUser.positions.filter((x) => x.chainId === chainId);

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const {
        tradeData: {
            isDenomBase,
            isTokenAPrimaryRange,
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
        receiptData,
    } = useAppSelector((state) => state);

    const { navigationMenu } = useTradeData();

    const [rangeAllowed, setRangeAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

    const isTokenABase = tokenA.address === baseTokenAddress;

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

    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const poolPriceCharacter = isDenomBase
        ? isTokenABase
            ? getUnicodeCharacter(tokenB.symbol)
            : getUnicodeCharacter(tokenA.symbol)
        : !isTokenABase
        ? getUnicodeCharacter(tokenB.symbol)
        : getUnicodeCharacter(tokenA.symbol);

    const [rangeButtonErrorMessage, setRangeButtonErrorMessage] =
        useState<string>('');

    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined
            ? 0
            : Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    const [rangeWidthPercentage, setRangeWidthPercentage] =
        useState<number>(simpleRangeWidth);

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

    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');

    const defaultMinPriceDifferencePercentage = -10;
    const defaultMaxPriceDifferencePercentage = 10;

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
                      defaultMinPriceDifferencePercentage * 100,
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
                      defaultMaxPriceDifferencePercentage * 100,
                  gridSize,
              )
            : advancedHighTick;
        return value;
    }, [advancedHighTick, currentPoolPriceTick, shouldResetAdvancedHighTick]);

    useEffect(() => {
        setNewRangeTransactionHash('');
        setShowBypassConfirmButton(false);
        setPinnedDisplayPrices(undefined);
    }, [baseToken.address + quoteToken.address]);

    const selectedRangeMatchesOpenPosition = (position: PositionIF) => {
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
    };

    const isAdd = useMemo(
        () => userPositions.some(selectedRangeMatchesOpenPosition),
        [
            diffHashSig(userPositions),
            isAmbient,
            defaultLowTick,
            defaultHighTick,
        ],
    );

    useEffect(() => {
        if (!isAdd) {
            setCurrentRangeInAdd('');
        }
    }, [isAdd]);

    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] =
        useState(defaultMinPriceDifferencePercentage);
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] =
        useState(defaultMaxPriceDifferencePercentage);

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

    const isQtyEntered = tokenAInputQty !== '' && tokenBInputQty !== '';

    const showExtraInfoDropdown =
        tokenAInputQty !== '' || tokenBInputQty !== '';

    const rangeSpanAboveCurrentPrice = defaultHighTick - currentPoolPriceTick;
    const rangeSpanBelowCurrentPrice = currentPoolPriceTick - defaultLowTick;

    const isOutOfRange = !advancedMode
        ? false
        : rangeSpanAboveCurrentPrice < 0 || rangeSpanBelowCurrentPrice < 0;

    const isInvalidRange = !isAmbient && defaultHighTick <= defaultLowTick;

    useEffect(() => {
        if (
            isPoolInitialized === undefined ||
            poolPriceNonDisplay === undefined
        ) {
            setRangeButtonErrorMessage('…');
        } else if (!isPoolInitialized) {
            setRangeButtonErrorMessage('Pool Not Initialized');
        } else if (isInvalidRange) {
            setRangeButtonErrorMessage('Please Enter a Valid Range');
        } else if (!isQtyEntered) {
            setRangeButtonErrorMessage('Enter an Amount');
        }
    }, [isQtyEntered, isPoolInitialized, isInvalidRange, poolPriceNonDisplay]);

    const [isTokenADisabled, setIsTokenADisabled] = useState(false);
    const [isTokenBDisabled, setIsTokenBDisabled] = useState(false);

    useEffect(() => {
        if (!isAmbient) {
            if (isTokenABase) {
                if (defaultHighTick < currentPoolPriceTick) {
                    setIsTokenBDisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenADisabled(false);
                    } else setIsTokenADisabled(true);
                } else if (defaultLowTick > currentPoolPriceTick) {
                    setIsTokenADisabled(true);
                    if (defaultLowTick < defaultHighTick) {
                        setIsTokenBDisabled(false);
                    } else setIsTokenBDisabled(true);
                } else {
                    setIsTokenADisabled(false);
                    setIsTokenBDisabled(false);
                }
            } else {
                if (defaultHighTick < currentPoolPriceTick) {
                    setIsTokenADisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenBDisabled(false);
                    } else setIsTokenBDisabled(true);
                } else if (defaultLowTick > currentPoolPriceTick) {
                    setIsTokenBDisabled(true);
                    if (defaultLowTick < defaultHighTick) {
                        setIsTokenADisabled(false);
                    } else setIsTokenBDisabled(true);
                } else {
                    setIsTokenBDisabled(false);
                    setIsTokenADisabled(false);
                }
            }
        } else {
            setIsTokenBDisabled(false);
            setIsTokenADisabled(false);
        }
    }, [
        isAmbient,
        isTokenABase,
        currentPoolPriceTick,
        defaultLowTick,
        defaultHighTick,
        isDenomBase,
    ]);

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

    const lowBoundOnBlur = () => {
        setRangeLowBoundFieldBlurred(true);
    };

    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] =
        useState(false);
    const highBoundOnBlur = () => {
        setRangeHighBoundFieldBlurred(true);
    };

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');
    };

    const [showBypassConfirmButton, setShowBypassConfirmButton] =
        useState(false);

    const sessionReceipts = receiptData.sessionReceipts;

    const pendingTransactions = receiptData.pendingTransactions;

    let receiveReceiptHashes: Array<string> = [];

    useEffect(() => {
        receiveReceiptHashes = getReceiptTxHashes(sessionReceipts);
    }, [sessionReceipts]);

    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receiveReceiptHashes.includes(hash),
    );

    const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);

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

    const minPriceDisplay = isAmbient ? '0' : pinnedMinPriceDisplayTruncated;

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
                          tokenAInputQty,
                          [minPrice, maxPrice],
                          {
                              surplus: [
                                  isWithdrawTokenAFromDexChecked,
                                  isWithdrawTokenBFromDexChecked,
                              ],
                          },
                      )
                    : pool.mintAmbientBase(
                          tokenBInputQty,
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
                      tokenAInputQty,
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
                      tokenBInputQty,
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

    // TODO:  @Emily refactor this fragment to use the same denomination switch
    // TODO:  ... component used in the Market and Limit modules
    const advancedModeToggle = (
        <div className={styles.denomination_switch_container}>
            <AdvancedModeToggle advancedMode={advancedMode} />
        </div>
    );

    // props for <RangePriceInfo/> React element
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

    const handleModalClose = () => {
        setNewRangeTransactionHash('');
        resetConfirmation();
        closeModal();
    };

    const handleRangeButtonClickWithBypass = () => {
        setShowBypassConfirmButton(true);
        sendTransaction();
    };

    const bypassConfirmButtonProps = {
        newRangeTransactionHash: newRangeTransactionHash,
        txErrorCode: txErrorCode,
        resetConfirmation: resetConfirmation,
        sendTransaction: sendTransaction,
        setShowBypassConfirmButton: setShowBypassConfirmButton,
        showBypassConfirmButton: showBypassConfirmButton,
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
    };

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencyConverterProps = {
        isAmbient: isAmbient,
        isTokenABase: isTokenABase,
        depositSkew: depositSkew,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        setTokenAInputQty: setTokenAInputQty,
        setTokenBInputQty: setTokenBInputQty,
        setRangeButtonErrorMessage: setRangeButtonErrorMessage,
        setRangeAllowed: setRangeAllowed,
        isTokenADisabled: isTokenADisabled,
        isTokenBDisabled: isTokenBDisabled,
        isOutOfRange: isOutOfRange,
        rangeSpanAboveCurrentPrice: rangeSpanAboveCurrentPrice,
        rangeSpanBelowCurrentPrice: rangeSpanBelowCurrentPrice,
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
        tokenAQtyLocal,
        tokenBQtyLocal,
        setTokenAQtyLocal,
        setTokenBQtyLocal,
        setTokenAQtyCoveredByWalletBalance: setTokenAQtyCoveredByWalletBalance,
        setTokenBQtyCoveredByWalletBalance: setTokenBQtyCoveredByWalletBalance,
    };

    // props for <RangeWidth/> React element
    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider:
            setRescaleRangeBoundariesWithSlider,
    };
    // props for <RangeExtraInfo/> React element

    const liquidityProviderFeeString = (liquidityFee * 100).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

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
                        highBoundOnBlur={highBoundOnBlur}
                        lowBoundOnBlur={lowBoundOnBlur}
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
            <DividerDark addMarginTop />

            <AdvancedPriceInfo
                poolPriceDisplay={getFormattedNumber({
                    value: displayPriceWithDenom,
                })}
                isTokenABase={isTokenABase}
                isOutOfRange={isOutOfRange}
                aprPercentage={aprPercentage}
            />
        </>
    );

    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= tokenAQtyCoveredByWalletBalance;

    const isTokenBAllowanceSufficient =
        parseFloat(tokenBAllowance) >= tokenBQtyCoveredByWalletBalance;

    const loginButton = (
        <button onClick={openWagmiModal} className={styles.authenticate_button}>
            Connect Wallet
        </button>
    );

    const [isApprovalPending, setIsApprovalPending] = useState(false);

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

    const tokenAApprovalButton = (
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
    );

    const tokenBApprovalButton = (
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
    );

    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

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

    return (
        <section data-testid={'range'} className={styles.scrollable_container}>
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

            <ContentContainer isOnTradeRoute>
                <OrderHeader
                    slippage={mintSlippage}
                    bypassConfirm={bypassConfirmRange}
                    settingsTitle='Pool'
                />
                {navigationMenu}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <RangeCurrencyConverter
                        {...rangeCurrencyConverterProps}
                        isAdvancedMode
                    />
                    {advancedModeToggle}
                </motion.div>
                {advancedMode ? advancedModeContent : baseModeContent}
                <div className={styles.info_button_container}>
                    <RangeExtraInfo {...rangeExtraInfoProps} />
                    {isUserConnected === undefined ? null : isUserConnected ===
                      true ? (
                        poolPriceNonDisplay !== 0 &&
                        parseFloat(tokenAInputQty) > 0 &&
                        !isTokenAAllowanceSufficient ? (
                            tokenAApprovalButton
                        ) : poolPriceNonDisplay !== 0 &&
                          parseFloat(tokenBInputQty) > 0 &&
                          !isTokenBAllowanceSufficient ? (
                            tokenBApprovalButton
                        ) : showBypassConfirmButton ? (
                            <BypassConfirmRangeButton
                                {...bypassConfirmButtonProps}
                            />
                        ) : (
                            <>
                                <RangeButton
                                    onClickFn={
                                        areBothAckd
                                            ? bypassConfirmRange.isEnabled
                                                ? handleRangeButtonClickWithBypass
                                                : openModal
                                            : ackAsNeeded
                                    }
                                    rangeAllowed={
                                        isPoolInitialized === true &&
                                        rangeAllowed &&
                                        !isInvalidRange
                                    }
                                    rangeButtonErrorMessage={
                                        rangeButtonErrorMessage
                                    }
                                    isAmbient={isAmbient}
                                    isAdd={isAdd}
                                    areBothAckd={areBothAckd}
                                />
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
                                            aria-label={tokenA.symbol}
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
                                            aria-label={tokenB.symbol}
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
                </div>
            </ContentContainer>
            <ConfirmRangeModal
                tokenAQtyLocal={tokenAQtyLocal}
                tokenBQtyLocal={tokenBQtyLocal}
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
                isOpen={isOpen}
                onClose={handleModalClose}
            />
            <TutorialOverlay
                isTutorialEnabled={isTutorialEnabled}
                setIsTutorialEnabled={setIsTutorialEnabled}
                steps={
                    !advancedMode
                        ? rangeTutorialStepsAdvanced
                        : rangeTutorialSteps
                }
            />
        </section>
    );
}

export default memo(Range);
