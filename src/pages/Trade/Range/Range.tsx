/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { concDepositSkew, MIN_TICK, MAX_TICK, CrocEnv } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import JSX Elements
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import RangeButton from '../../../components/Trade/Range/RangeButton/RangeButton';
import RangeCurrencyConverter from '../../../components/Trade/Range/RangeCurrencyConverter/RangeCurrencyConverter';
import RangePriceInfo from '../../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeWidth from '../../../components/Trade/Range/RangeWidth/RangeWidth';
import RangeHeader from '../../../components/Trade/Range/RangeHeader/RangeHeader';
import DenominationSwitch from '../../../components/Swap/DenominationSwitch/DenominationSwitch';
import AdvancedModeToggle from '../../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import AdvancedPriceInfo from '../../../components/Trade/Range/AdvancedModeComponents/AdvancedPriceInfo/AdvancedPriceInfo';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Global/Button/Button';
import RangeExtraInfo from '../../../components/Trade/Range/RangeExtraInfo/RangeExtraInfo';
import ConfirmRangeModal from '../../../components/Trade/Range/ConfirmRangeModal/ConfirmRangeModal';

// START: Import Local Files
import styles from './Range.module.css';
import {
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
} from './rangeFunctions';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { isTransactionReplacedError, TransactionError } from '../../../utils/TransactionError';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import { SlippagePairIF, TokenIF } from '../../../utils/interfaces/exports';
import { useTradeData } from '../Trade';
import { useModal } from '../../../components/Global/Modal/useModal';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setSimpleRangeWidth,
    setPinnedMaxPrice,
    setPinnedMinPrice,
    setSpotPriceDisplay,
    targetData,
} from '../../../utils/state/tradeDataSlice';
import { addReceipt } from '../../../utils/state/receiptDataSlice';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';

interface RangePropsIF {
    isUserLoggedIn: boolean;
    importedTokens: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    mintSlippage: SlippagePairIF;
    isPairStable: boolean;
    provider?: ethers.providers.Provider;
    gasPriceInGwei: number | undefined;
    ethMainnetUsdPrice?: number;
    lastBlockNumber: number;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    poolPriceDisplay: string;
    poolPriceNonDisplay: number | undefined;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    tokenAAllowance: string;
    setRecheckTokenAApproval: Dispatch<SetStateAction<boolean>>;
    tokenBAllowance: string;
    setRecheckTokenBApproval: Dispatch<SetStateAction<boolean>>;
    chainId: string;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
    openModalWallet: () => void;
    ambientApy: number | undefined;

    pendingTransactions: string[];
    targets: targetData[];
    setTargets: Dispatch<SetStateAction<targetData[]>>;
}

export default function Range(props: RangePropsIF) {
    const {
        isUserLoggedIn,
        importedTokens,
        setImportedTokens,
        searchableTokens,
        mintSlippage,
        isPairStable,
        provider,
        baseTokenAddress,
        quoteTokenAddress,
        poolPriceDisplay,
        poolPriceNonDisplay,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenAAllowance,
        setRecheckTokenAApproval,
        tokenBAllowance,
        setRecheckTokenBApproval,
        gasPriceInGwei,
        ethMainnetUsdPrice,
        chainId,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
        openModalWallet,
        ambientApy,

        pendingTransactions,
    } = props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] = useState(false);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] = useState(false);
    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [rangeGasPriceinDollars, setRangeGasPriceinDollars] = useState<string | undefined>();

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode(0);
        setTxErrorMessage('');
    };

    const { account, isAuthenticated, isWeb3Enabled } = useMoralis();

    const { tradeData, navigationMenu } = useTradeData();

    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };
    const isAdvancedModeActive = tradeData.advancedMode;

    const denominationsInBase = tradeData.isDenomBase;
    const isTokenAPrimary = tradeData.isTokenAPrimaryRange;
    const targetData = props.targets;

    const [rangeAllowed, setRangeAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

    const isTokenABase = tokenPair?.dataTokenA.address === baseTokenAddress;

    const slippageTolerancePercentage = isPairStable
        ? mintSlippage.stable.value
        : mintSlippage.volatile.value;

    const poolPriceDisplayNum = parseFloat(poolPriceDisplay);

    const displayPriceWithDenom = denominationsInBase
        ? 1 / poolPriceDisplayNum
        : poolPriceDisplayNum;

    const displayPriceString =
        displayPriceWithDenom === Infinity || displayPriceWithDenom === 0
            ? '…'
            : displayPriceWithDenom < 2
            ? displayPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : displayPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    useEffect(() => {
        dispatch(setSpotPriceDisplay(displayPriceString));
    }, [displayPriceString]);

    const poolPriceCharacter = denominationsInBase
        ? isTokenABase
            ? getUnicodeCharacter(tokenB.symbol)
            : getUnicodeCharacter(tokenA.symbol)
        : !isTokenABase
        ? getUnicodeCharacter(tokenB.symbol)
        : getUnicodeCharacter(tokenA.symbol);

    const [rangeButtonErrorMessage, setRangeButtonErrorMessage] =
        useState<string>('Enter an Amount');
    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined ? 0 : Math.log(poolPriceNonDisplay) / Math.log(1.0001);
    const [rangeWidthPercentage, setRangeWidthPercentage] = useState<number>(
        tradeData.simpleRangeWidth,
    );

    useEffect(() => {
        if (tradeData.simpleRangeWidth !== rangeWidthPercentage) {
            setSimpleRangeWidth(tradeData.simpleRangeWidth);
            setRangeWidthPercentage(tradeData.simpleRangeWidth);
            const sliderInput = document.getElementById('input-slider-range') as HTMLInputElement;
            if (sliderInput) sliderInput.value = tradeData.simpleRangeWidth.toString();
        }
    }, [tradeData.simpleRangeWidth]);

    useEffect(() => {
        if (tradeData.simpleRangeWidth !== rangeWidthPercentage) {
            dispatch(setSimpleRangeWidth(rangeWidthPercentage));
        }
    }, [rangeWidthPercentage]);

    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');

    const defaultMinPriceDifferencePercentage = -15;
    const defaultMaxPriceDifferencePercentage = 15;

    const defaultLowTick =
        tradeData.advancedLowTick === 0
            ? currentPoolPriceTick + defaultMinPriceDifferencePercentage * 100
            : tradeData.advancedLowTick;

    const defaultHighTick =
        tradeData.advancedHighTick === 0
            ? currentPoolPriceTick + defaultMaxPriceDifferencePercentage * 100
            : tradeData.advancedHighTick;

    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] = useState(
        defaultMinPriceDifferencePercentage,
    );
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] = useState(
        defaultMaxPriceDifferencePercentage,
    );

    const [isAmbient, setIsAmbient] = useState(false);

    useEffect(() => {
        if (rangeWidthPercentage === 100 && !isAdvancedModeActive) {
            setIsAmbient(true);
            setRangeLowTick(MIN_TICK);
            setRangeHighTick(MAX_TICK);
            setRangeLowBoundNonDisplayPrice(0);
            setRangeHighBoundNonDisplayPrice(Infinity);
        } else {
            setIsAmbient(false);
            const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
            const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                lowTick,
                highTick,
                lookupChain(chainId).gridSize,
            );
            setRangeLowBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMinPriceNonDisplay);
            setRangeHighBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMaxPriceNonDisplay);

            setPinnedMinPriceDisplayTruncated(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);
            setPinnedMaxPriceDisplayTruncated(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated);

            setRangeLowTick(pinnedDisplayPrices.pinnedLowTick);
            setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);

            dispatch(
                setPinnedMinPrice(parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated)),
            );
            dispatch(
                setPinnedMaxPrice(parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated)),
            );
        }
    }, [rangeWidthPercentage, isAdvancedModeActive, denominationsInBase]);

    const [rangeLowTick, setRangeLowTick] = useState(tradeData.advancedLowTick);
    const [rangeHighTick, setRangeHighTick] = useState(tradeData.advancedHighTick);

    const rangeSpanAboveCurrentPrice = rangeHighTick - currentPoolPriceTick;
    const rangeSpanBelowCurrentPrice = currentPoolPriceTick - rangeLowTick;

    const isOutOfRange = rangeSpanAboveCurrentPrice < 0 || rangeSpanBelowCurrentPrice < 0;
    const isInvalidRange = rangeHighTick <= rangeLowTick;

    useEffect(() => {
        if (poolPriceNonDisplay === undefined) {
            setRangeButtonErrorMessage('…');
        } else if (poolPriceNonDisplay === 0) {
            setRangeButtonErrorMessage('Token Pair Invalid');
        } else if (isInvalidRange) {
            setRangeButtonErrorMessage('Please Enter a Valid Range');
        } else {
            setRangeButtonErrorMessage('Enter an Amount');
        }
    }, [isInvalidRange, poolPriceNonDisplay]);

    const minimumSpan =
        rangeSpanAboveCurrentPrice < rangeSpanBelowCurrentPrice
            ? rangeSpanAboveCurrentPrice
            : rangeSpanBelowCurrentPrice;

    const [isTokenADisabled, setIsTokenADisabled] = useState(false);
    const [isTokenBDisabled, setIsTokenBDisabled] = useState(false);

    useEffect(() => {
        if (isTokenABase) {
            if (rangeHighTick < currentPoolPriceTick) {
                setIsTokenBDisabled(true);
                if (rangeHighTick > rangeLowTick) {
                    setIsTokenADisabled(false);
                } else setIsTokenADisabled(true);
            } else if (rangeLowTick > currentPoolPriceTick) {
                setIsTokenADisabled(true);
                if (rangeLowTick < rangeHighTick) {
                    setIsTokenBDisabled(false);
                } else setIsTokenBDisabled(true);
            } else {
                setIsTokenADisabled(false);
                setIsTokenBDisabled(false);
            }
        } else {
            if (rangeHighTick < currentPoolPriceTick) {
                setIsTokenADisabled(true);
                if (rangeHighTick > rangeLowTick) {
                    setIsTokenBDisabled(false);
                } else setIsTokenBDisabled(true);
            } else if (rangeLowTick > currentPoolPriceTick) {
                setIsTokenBDisabled(true);
                if (rangeLowTick < rangeHighTick) {
                    setIsTokenADisabled(false);
                } else setIsTokenBDisabled(true);
            } else {
                setIsTokenBDisabled(false);
                setIsTokenADisabled(false);
            }
        }
    }, [currentPoolPriceTick, rangeLowTick, rangeHighTick, denominationsInBase]);

    const [rangeLowBoundNonDisplayPrice, setRangeLowBoundNonDisplayPrice] = useState(0);
    const [rangeHighBoundNonDisplayPrice, setRangeHighBoundNonDisplayPrice] = useState(0);

    const [pinnedMinPriceDisplayTruncated, setPinnedMinPriceDisplayTruncated] = useState('');
    const [pinnedMaxPriceDisplayTruncated, setPinnedMaxPriceDisplayTruncated] = useState('');

    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] = useState(false);
    const lowBoundOnBlur = () => setRangeLowBoundFieldBlurred(true);

    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] = useState(false);
    const highBoundOnBlur = () => setRangeHighBoundFieldBlurred(true);

    const [initializationComplete, setInitializationComplete] = useState(false);

    useEffect(() => {
        if (isAdvancedModeActive) {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeLowBoundDisplayField) {
                setInitializationComplete(false);
            }
            const rangeHighBoundDisplayField = document.getElementById(
                'max-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeHighBoundDisplayField) {
                setInitializationComplete(false);
            }
        }
    }, [isAdvancedModeActive, rangeLowTick, rangeHighTick]);

    useEffect(() => {
        if (!initializationComplete && isAdvancedModeActive) {
            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                lookupChain(chainId).gridSize,
            );
            setRangeLowBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMinPriceNonDisplay);
            setRangeHighBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMaxPriceNonDisplay);

            setPinnedMinPriceDisplayTruncated(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);
            setPinnedMaxPriceDisplayTruncated(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated);

            setRangeLowTick(pinnedDisplayPrices.pinnedLowTick);
            setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);

            const highTickDiff = pinnedDisplayPrices.pinnedHighTick - currentPoolPriceTick;
            const lowTickDiff = pinnedDisplayPrices.pinnedLowTick - currentPoolPriceTick;

            const highGeometricDifferencePercentage =
                Math.abs(highTickDiff) < 200
                    ? parseFloat(truncateDecimals(highTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(highTickDiff / 100, 0));
            const lowGeometricDifferencePercentage =
                Math.abs(lowTickDiff) < 200
                    ? parseFloat(truncateDecimals(lowTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(lowTickDiff / 100, 0));
            denominationsInBase
                ? setMaxPriceDifferencePercentage(-lowGeometricDifferencePercentage)
                : setMaxPriceDifferencePercentage(highGeometricDifferencePercentage);

            denominationsInBase
                ? setMinPriceDifferencePercentage(-highGeometricDifferencePercentage)
                : setMinPriceDifferencePercentage(lowGeometricDifferencePercentage);

            // console.log({ pinnedDisplayPrices });

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
                    setInitializationComplete(true);
                } else {
                    // console.log('high bound field not found');
                }
            } else {
                // console.log('low bound field not found');
            }
        }
    }, [
        currentPoolPriceTick,
        initializationComplete,
        isAdvancedModeActive,
        denominationsInBase,
        baseTokenDecimals,
        quoteTokenDecimals,
    ]);
    useEffect(() => {
        if (rangeLowBoundFieldBlurred) {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;

            const targetMinValue = targetData.filter((target: any) => target.name === 'Min')[0]
                .value;

            const setValues = parseFloat(rangeLowBoundDisplayField.value) !== targetMinValue;

            if (targetMinValue !== undefined && targetMinValue > 0) {
                rangeLowBoundDisplayField.value = targetMinValue.toString();
            }

            if (rangeLowBoundDisplayField.value !== pinnedMinPriceDisplayTruncated && setValues) {
                const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                    denominationsInBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    rangeLowBoundDisplayField.value,
                    pinnedMaxPriceDisplayTruncated,
                    lookupChain(chainId).gridSize,
                );
                console.log({ pinnedDisplayPrices });

                setRangeLowBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMinPriceNonDisplay);
                setRangeHighBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMaxPriceNonDisplay);

                !denominationsInBase
                    ? dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick))
                    : dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

                !denominationsInBase
                    ? setRangeLowTick(pinnedDisplayPrices.pinnedLowTick)
                    : setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);

                const highGeometricDifferencePercentage = parseFloat(
                    truncateDecimals(
                        (pinnedDisplayPrices.pinnedHighTick - currentPoolPriceTick) / 100,
                        0,
                    ),
                );
                const lowGeometricDifferencePercentage = parseFloat(
                    truncateDecimals(
                        (pinnedDisplayPrices.pinnedLowTick - currentPoolPriceTick) / 100,
                        0,
                    ),
                );
                denominationsInBase
                    ? setMinPriceDifferencePercentage(-highGeometricDifferencePercentage)
                    : setMinPriceDifferencePercentage(lowGeometricDifferencePercentage);

                setPinnedMinPriceDisplayTruncated(
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                );

                if (rangeLowBoundDisplayField) {
                    rangeLowBoundDisplayField.value =
                        pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
                } else {
                    console.log('low bound field not found');
                }

                const newTargetData: typeof targetData = [
                    {
                        name: 'Max',
                        value: targetData.filter((target: any) => target.name === 'Max')[0].value,
                    },
                    {
                        name: 'Min',
                        value: parseFloat(rangeLowBoundDisplayField.value),
                    },
                ];

                props.setTargets(newTargetData);
            }
            setRangeLowBoundFieldBlurred(false);
        }
    }, [rangeLowBoundFieldBlurred, props.targets]);

    useEffect(() => {
        if (rangeHighBoundFieldBlurred) {
            const rangeHighBoundDisplayField = document.getElementById(
                'max-price-input-quantity',
            ) as HTMLInputElement;

            const targetMaxValue = targetData.filter((target: any) => target.name === 'Max')[0]
                .value;

            const setValues = parseFloat(rangeHighBoundDisplayField.value) !== targetMaxValue;

            if (targetMaxValue !== undefined && targetMaxValue > 0) {
                rangeHighBoundDisplayField.value = targetMaxValue.toString();
            }

            if (rangeHighBoundDisplayField.value !== pinnedMaxPriceDisplayTruncated && setValues) {
                const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                    denominationsInBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    pinnedMinPriceDisplayTruncated,
                    rangeHighBoundDisplayField.value,
                    lookupChain(chainId).gridSize,
                );
                // console.log({ pinnedDisplayPrices });
                denominationsInBase
                    ? dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick))
                    : dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

                denominationsInBase
                    ? dispatch(setPinnedMinPrice(pinnedDisplayPrices.pinnedLowTick))
                    : dispatch(setPinnedMaxPrice(pinnedDisplayPrices.pinnedHighTick));

                denominationsInBase
                    ? setRangeLowTick(pinnedDisplayPrices.pinnedLowTick)
                    : setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);

                setRangeLowBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMinPriceNonDisplay);
                setRangeHighBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMaxPriceNonDisplay);

                const highGeometricDifferencePercentage = parseFloat(
                    truncateDecimals(
                        (pinnedDisplayPrices.pinnedHighTick - currentPoolPriceTick) / 100,
                        0,
                    ),
                );
                const lowGeometricDifferencePercentage = parseFloat(
                    truncateDecimals(
                        (pinnedDisplayPrices.pinnedLowTick - currentPoolPriceTick) / 100,
                        0,
                    ),
                );
                denominationsInBase
                    ? setMaxPriceDifferencePercentage(-lowGeometricDifferencePercentage)
                    : setMaxPriceDifferencePercentage(highGeometricDifferencePercentage);

                setPinnedMaxPriceDisplayTruncated(
                    pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                );

                if (rangeHighBoundDisplayField) {
                    rangeHighBoundDisplayField.value =
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
                } else {
                    console.log('high bound field not found');
                }

                const newTargetData: typeof targetData = [
                    {
                        name: 'Max',
                        value: parseFloat(rangeHighBoundDisplayField.value),
                    },
                    {
                        name: 'Min',
                        value: targetData.filter((target: any) => target.name === 'Min')[0].value,
                    },
                ];

                props.setTargets(newTargetData);
            }
            setRangeHighBoundFieldBlurred(false);
        }
    }, [rangeHighBoundFieldBlurred, props.targets]);

    const depositSkew = useMemo(
        () =>
            concDepositSkew(
                poolPriceNonDisplay ?? 0,
                rangeLowBoundNonDisplayPrice,
                rangeHighBoundNonDisplayPrice,
            ),
        [poolPriceNonDisplay, rangeLowBoundNonDisplayPrice, rangeHighBoundNonDisplayPrice],
    );

    let maxPriceDisplay: string;

    if (isAmbient) {
        maxPriceDisplay = 'Infinity';
    } else {
        maxPriceDisplay = pinnedMaxPriceDisplayTruncated;
    }

    const apyPercentage: number | undefined = ambientApy
        ? 100 - rangeWidthPercentage + ambientApy
        : undefined;

    const advancedDaysInRangeEstimation =
        minimumSpan < 0 ? 0 : parseFloat(truncateDecimals(minimumSpan / 100, 0));

    const daysInRangeEstimation: number = isAmbient
        ? 365
        : isAdvancedModeActive
        ? advancedDaysInRangeEstimation
        : rangeWidthPercentage;

    let minPriceDisplay: string;

    if (isAmbient) {
        minPriceDisplay = '0';
    } else {
        minPriceDisplay = pinnedMinPriceDisplayTruncated;
    }

    const sendTransaction = async () => {
        if (!provider || !(provider as ethers.providers.WebSocketProvider).getSigner()) {
            return;
        }

        const pool = new CrocEnv(provider).pool(tokenA.address, tokenB.address);

        const spot = await pool.displayPrice();
        const minPrice = spot * (1 - parseFloat(slippageTolerancePercentage) / 100);
        const maxPrice = spot * (1 + parseFloat(slippageTolerancePercentage) / 100);

        let tx;

        try {
            tx = await (isAmbient
                ? isTokenAPrimary
                    ? pool.mintAmbientQuote(tokenAInputQty, [minPrice, maxPrice], {
                          surplus: [isWithdrawTokenAFromDexChecked, isWithdrawTokenBFromDexChecked],
                      })
                    : pool.mintAmbientBase(tokenBInputQty, [minPrice, maxPrice], {
                          surplus: [isWithdrawTokenAFromDexChecked, isWithdrawTokenBFromDexChecked],
                      })
                : isTokenAPrimary
                ? pool.mintRangeQuote(
                      tokenAInputQty,
                      [rangeLowTick, rangeHighTick],
                      [minPrice, maxPrice],
                      {
                          surplus: [isWithdrawTokenAFromDexChecked, isWithdrawTokenBFromDexChecked],
                      },
                  )
                : pool.mintRangeBase(
                      tokenBInputQty,
                      [rangeLowTick, rangeHighTick],
                      [minPrice, maxPrice],
                      {
                          surplus: [isWithdrawTokenAFromDexChecked, isWithdrawTokenBFromDexChecked],
                      },
                  ));
            setNewRangeTransactionHash(tx?.hash);
            if (tx?.hash) pendingTransactions.unshift(tx?.hash);
        } catch (error) {
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
        }

        const newPositionCacheEndpoint = 'https://809821320828123.de:5000/new_liqchange?';
        if (tx?.hash) {
            if (isAmbient) {
                fetch(
                    newPositionCacheEndpoint +
                        new URLSearchParams({
                            chainId: chainId,
                            tx: tx.hash,
                            user: account ?? '',
                            base: baseTokenAddress,
                            quote: quoteTokenAddress,
                            poolIdx: lookupChain(chainId).poolIndex.toString(),
                            positionType: 'ambient',
                            // bidTick: '0',
                            // askTick: '0',
                            changeType: 'mint',
                            isBid: 'false', // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                            liq: '0', // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                        }),
                );
            } else {
                fetch(
                    newPositionCacheEndpoint +
                        new URLSearchParams({
                            chainId: chainId,
                            tx: tx.hash,
                            user: account ?? '',
                            base: baseTokenAddress,
                            quote: quoteTokenAddress,
                            poolIdx: lookupChain(chainId).poolIndex.toString(),
                            positionType: 'concentrated',
                            changeType: 'mint',
                            bidTick: rangeLowTick.toString(),
                            askTick: rangeHighTick.toString(),
                            isBid: 'false', // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                            liq: '0', // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                        }),
                );
            }
        }

        let receipt;
        try {
            if (tx) receipt = await tx.wait();
        } catch (e) {
            const error = e as TransactionError;

            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                console.log('repriced');
                const newTransactionHash = error.replacement.hash;
                setNewRangeTransactionHash(newTransactionHash);
                console.log({ newTransactionHash });
                receipt = error.receipt;

                if (tx?.hash) {
                    fetch(
                        newPositionCacheEndpoint +
                            new URLSearchParams({
                                chainId: chainId,
                                tx: newTransactionHash,
                                user: account ?? '',
                                base: baseTokenAddress,
                                quote: quoteTokenAddress,
                                poolIdx: lookupChain(chainId).poolIndex.toString(),
                                positionType: isAmbient ? 'ambient' : 'concentrated',
                                changeType: 'mint',
                                bidTick: rangeLowTick.toString(),
                                askTick: rangeHighTick.toString(),
                                isBid: 'false', // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                                liq: '0', // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                            }),
                    );
                }
            }
        }
        if (receipt) {
            dispatch(addReceipt(JSON.stringify(receipt)));
        }
    };

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum = gasPriceInGwei * 120269 * 1e-9 * ethMainnetUsdPrice;

            setRangeGasPriceinDollars(
                '~$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    // TODO:  @Emily refactor this fragment to use the same denomination switch
    // TODO:  ... component used in the Market and Limit modules
    const denominationSwitch = (
        <div className={styles.denomination_switch_container}>
            <AdvancedModeToggle advancedMode={tradeData.advancedMode} />
            <DenominationSwitch />
        </div>
    );

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
        tradeData.isTokenAPrimaryRange,
    );

    // props for <RangePriceInfo/> React element
    const rangePriceInfoProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: displayPriceString,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        apyPercentage: apyPercentage,
        isTokenABase: isTokenABase,
        didUserFlipDenom: tradeData.didUserFlipDenom,
        poolPriceCharacter: poolPriceCharacter,
    };

    const pinnedMinPriceDisplayTruncatedInBase = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                true,
                baseTokenDecimals,
                quoteTokenDecimals,
                rangeLowTick,
                rangeHighTick,
                lookupChain(chainId).gridSize,
            ).pinnedMinPriceDisplayTruncated,
        [baseTokenDecimals, quoteTokenDecimals, rangeLowTick, rangeHighTick],
    );

    const pinnedMinPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseTokenDecimals,
                quoteTokenDecimals,
                rangeLowTick,
                rangeHighTick,
                lookupChain(chainId).gridSize,
            ).pinnedMinPriceDisplayTruncated,
        [baseTokenDecimals, quoteTokenDecimals, rangeLowTick, rangeHighTick],
    );

    const pinnedMaxPriceDisplayTruncatedInBase = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                true,
                baseTokenDecimals,
                quoteTokenDecimals,
                rangeLowTick,
                rangeHighTick,
                lookupChain(chainId).gridSize,
            ).pinnedMaxPriceDisplayTruncated,
        [baseTokenDecimals, quoteTokenDecimals, rangeLowTick, rangeHighTick],
    );

    const pinnedMaxPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseTokenDecimals,
                quoteTokenDecimals,
                rangeLowTick,
                rangeHighTick,
                lookupChain(chainId).gridSize,
            ).pinnedMaxPriceDisplayTruncated,
        [baseTokenDecimals, quoteTokenDecimals, rangeLowTick, rangeHighTick],
    );

    const handleModalClose = () => {
        closeModal();
        setNewRangeTransactionHash('');
        // setTxErrorCode(0);
        // setTxErrorMessage('');
        resetConfirmation();
    };

    // const tokenABalance = isTokenABase ? baseTokenBalance : quoteTokenBalance;
    // const tokenBBalance = isTokenABase ? quoteTokenBalance : baseTokenBalance;

    // props for <ConfirmRangeModal/> React element
    const rangeModalProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: displayPriceString,
        poolPriceDisplayNum: poolPriceDisplayNum,
        denominationsInBase: denominationsInBase,
        isTokenABase: isTokenABase,
        isAmbient: isAmbient,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        sendTransaction: sendTransaction,
        closeModal: handleModalClose,
        newRangeTransactionHash: newRangeTransactionHash,
        setNewRangeTransactionHash: setNewRangeTransactionHash,
        resetConfirmation: resetConfirmation,
        showConfirmation: showConfirmation,
        setShowConfirmation: setShowConfirmation,
        txErrorCode: txErrorCode,
        txErrorMessage: txErrorMessage,
        isInRange: !isOutOfRange,
        pinnedMinPriceDisplayTruncatedInBase: pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote: pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase: pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote: pinnedMaxPriceDisplayTruncatedInQuote,

        pendingTransactions: pendingTransactions,
    };

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencyConverterProps = {
        isUserLoggedIn: isUserLoggedIn,
        poolPriceNonDisplay: poolPriceNonDisplay,
        chainId: chainId ?? '0x2a',
        tokensBank: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        tokenPair: tokenPair,
        isAmbient: isAmbient,
        isTokenABase: isTokenABase,
        depositSkew: depositSkew,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        isTokenAPrimaryLocal: isTokenAPrimaryLocal,
        setIsTokenAPrimaryLocal: setIsTokenAPrimaryLocal,
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
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    // props for <RangeWidth/> React element
    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
    };
    // props for <RangeExtraInfo/> React element
    const rangeExtraInfoProps = {
        tokenPair: tokenPair,
        rangeGasPriceinDollars: rangeGasPriceinDollars,
        poolPriceDisplay: displayPriceString,
        slippageTolerance: slippageTolerancePercentage,
        liquidityProviderFee: 0.3,
        quoteTokenIsBuy: true,
        isDenomBase: tradeData.isDenomBase,
        isTokenABase: isTokenABase,
        daysInRangeEstimation: daysInRangeEstimation,
    };

    const baseModeContent = (
        <div>
            <RangeCurrencyConverter {...rangeCurrencyConverterProps} isAdvancedMode={false} />
            <DividerDark addMarginTop />
            {denominationSwitch}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <RangeWidth {...rangeWidthProps} />
            </motion.div>
            <RangePriceInfo {...rangePriceInfoProps} />
            <RangeExtraInfo {...rangeExtraInfoProps} />
        </div>
    );
    const advancedModeContent = (
        <>
            <RangeCurrencyConverter {...rangeCurrencyConverterProps} isAdvancedMode />
            <DividerDark addMarginTop />

            {denominationSwitch}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <MinMaxPrice
                    minPricePercentage={minPriceDifferencePercentage}
                    maxPricePercentage={maxPriceDifferencePercentage}
                    minPriceInputString={minPriceInputString}
                    maxPriceInputString={maxPriceInputString}
                    setMinPriceInputString={setMinPriceInputString}
                    setMaxPriceInputString={setMaxPriceInputString}
                    isDenomBase={denominationsInBase}
                    highBoundOnBlur={highBoundOnBlur}
                    lowBoundOnBlur={lowBoundOnBlur}
                    rangeLowTick={rangeLowTick}
                    rangeHighTick={rangeHighTick}
                    setRangeLowTick={setRangeLowTick}
                    setRangeHighTick={setRangeHighTick}
                    disable={isInvalidRange}
                    chainId={chainId.toString()}
                    targets={targetData}
                    setTargets={props.setTargets}
                />
            </motion.div>
            <DividerDark addMarginTop />

            <AdvancedPriceInfo
                tokenPair={tokenPair}
                poolPriceDisplay={displayPriceString}
                isDenomBase={denominationsInBase}
                isTokenABase={isTokenABase}
                minimumSpan={minimumSpan}
                isOutOfRange={isOutOfRange}
            />
            <RangeExtraInfo {...rangeExtraInfoProps} />
        </>
    );

    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal
            onClose={handleModalClose}
            title={isAmbient ? 'Ambient Confirmation' : 'Range Confirmation'}
        >
            <ConfirmRangeModal {...rangeModalProps} />
        </Modal>
    ) : null;

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    const isTokenBAllowanceSufficient = parseFloat(tokenBAllowance) >= parseFloat(tokenBInputQty);

    const loginButton = <Button title='Login' action={openModalWallet} />;

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const approve = async (tokenAddress: string) => {
        if (!provider) return;
        setIsApprovalPending(true);
        try {
            const tx = await new CrocEnv(provider).token(tokenAddress).approve();
            if (tx) {
                await tx.wait();
            }
        } catch (error) {
            console.log({ error });
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
                    ? `Click to Approve ${tokenPair.dataTokenA.symbol}`
                    : `${tokenPair.dataTokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenPair.dataTokenA.address);
            }}
        />
    );

    const tokenBApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Click to Approve ${tokenPair.dataTokenB.symbol}`
                    : `${tokenPair.dataTokenB.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenPair.dataTokenB.address);
            }}
        />
    );

    return (
        <section data-testid={'range'}>
            <ContentContainer isOnTradeRoute>
                <RangeHeader
                    chainId={chainId}
                    tokenPair={tokenPair}
                    mintSlippage={mintSlippage}
                    isPairStable={isPairStable}
                    isDenomBase={tradeData.isDenomBase}
                    isTokenABase={isTokenABase}
                />
                <DividerDark addMarginTop />
                {navigationMenu}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <DividerDark />
                    {isAdvancedModeActive ? advancedModeContent : baseModeContent}
                </motion.div>

                {!isAuthenticated || !isWeb3Enabled ? (
                    loginButton
                ) : poolPriceNonDisplay !== 0 &&
                  parseFloat(tokenAInputQty) > 0 &&
                  !isTokenAAllowanceSufficient ? (
                    tokenAApprovalButton
                ) : poolPriceNonDisplay !== 0 &&
                  parseFloat(tokenBInputQty) > 0 &&
                  !isTokenBAllowanceSufficient ? (
                    tokenBApprovalButton
                ) : (
                    <RangeButton
                        onClickFn={openModal}
                        rangeAllowed={poolPriceNonDisplay !== 0 && rangeAllowed && !isInvalidRange}
                        rangeButtonErrorMessage={rangeButtonErrorMessage}
                    />
                )}
            </ContentContainer>

            {confirmSwapModalOrNull}
        </section>
    );
}
