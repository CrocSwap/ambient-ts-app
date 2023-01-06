/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { concDepositSkew, CrocEnv } from '@crocswap-libs/sdk';
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
import { FiCopy } from 'react-icons/fi';
// START: Import Local Files
import styles from './Range.module.css';
import {
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
} from './rangeFunctions';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';
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
    setTargetData,
    setRangeModuleTriggered,
    setRangeLowLineTriggered,
    setRangeHighLineTriggered,
    setIsLinesSwitched,
    targetData,
} from '../../../utils/state/tradeDataSlice';
import { addPendingTx, addReceipt, removePendingTx } from '../../../utils/state/receiptDataSlice';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import RangeShareControl from '../../../components/Trade/Range/RangeShareControl/RangeShareControl';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';

interface RangePropsIF {
    account: string | undefined;
    crocEnv: CrocEnv | undefined;
    isUserLoggedIn: boolean | undefined;
    importedTokens: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
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
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    poolExists: boolean | undefined;

    isRangeCopied: boolean;
    tokenAQtyLocal: number;
    tokenBQtyLocal: number;
    setTokenAQtyLocal: Dispatch<SetStateAction<number>>;
    setTokenBQtyLocal: Dispatch<SetStateAction<number>>;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (options?: getRecentTokensParamsIF | undefined) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
}

export default function Range(props: RangePropsIF) {
    const {
        account,
        crocEnv,
        isUserLoggedIn,
        importedTokens,
        setImportedTokens,
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
        openGlobalModal,
        poolExists,

        isRangeCopied,
        tokenAQtyLocal,
        tokenBQtyLocal,
        setTokenAQtyLocal,
        setTokenBQtyLocal,
        verifyToken,
        getTokensByName,
        getTokenByAddress,
        importedTokensPlus,
        getRecentTokens,
        addRecentToken,
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

    const { tradeData, navigationMenu } = useTradeData();

    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const denominationsInBase = tradeData.isDenomBase;
    const isTokenAPrimary = tradeData.isTokenAPrimaryRange;
    // const targetData = tradeData.targetData;

    const rangeLowLineTriggered = tradeData.rangeLowLineTriggered;
    const rangeHighLineTriggered = tradeData.rangeHighLineTriggered;
    const isLinesSwitched = tradeData.isLinesSwitched;

    const [rangeAllowed, setRangeAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

    const isTokenABase = tradeData.tokenA.address === baseTokenAddress;

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

    const { tokenA, tokenB } = tradeData;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const poolPriceCharacter = denominationsInBase
        ? isTokenABase
            ? getUnicodeCharacter(tokenB.symbol)
            : getUnicodeCharacter(tokenA.symbol)
        : !isTokenABase
        ? getUnicodeCharacter(tokenB.symbol)
        : getUnicodeCharacter(tokenA.symbol);

    const [rangeButtonErrorMessage, setRangeButtonErrorMessage] = useState<string>('');

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
            dispatch(setRangeModuleTriggered(true));
            dispatch(setSimpleRangeWidth(rangeWidthPercentage));
        }
    }, [rangeWidthPercentage]);

    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');

    const defaultMinPriceDifferencePercentage = -15;
    const defaultMaxPriceDifferencePercentage = 15;

    const defaultLowTick = useMemo(
        () =>
            tradeData.advancedLowTick === 0 ||
            tradeData.advancedHighTick > currentPoolPriceTick + 100000 ||
            tradeData.advancedLowTick < currentPoolPriceTick - 100000
                ? currentPoolPriceTick + defaultMinPriceDifferencePercentage * 100
                : tradeData.advancedLowTick,
        [tradeData.advancedLowTick, currentPoolPriceTick],
    );

    const defaultHighTick = useMemo(
        () =>
            tradeData.advancedHighTick === 0 ||
            tradeData.advancedHighTick > currentPoolPriceTick + 100000 ||
            tradeData.advancedLowTick < currentPoolPriceTick - 100000
                ? currentPoolPriceTick + defaultMaxPriceDifferencePercentage * 100
                : tradeData.advancedHighTick,
        [tradeData.advancedHighTick, currentPoolPriceTick],
    );

    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] = useState(
        defaultMinPriceDifferencePercentage,
    );
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] = useState(
        defaultMaxPriceDifferencePercentage,
    );

    const [isAmbient, setIsAmbient] = useState(false);

    // useEffect(() => {
    //     // const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    //     // const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;
    //     const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
    //         denominationsInBase,
    //         baseTokenDecimals,
    //         quoteTokenDecimals,
    //         defaultLowTick,
    //         defaultHighTick,
    //         lookupChain(chainId).gridSize,
    //     );
    //     dispatch(setPinnedMinPrice(parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated)));
    //     dispatch(setPinnedMaxPrice(parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated)));
    // }, []);

    useEffect(() => {
        if (rangeWidthPercentage === 100 && !tradeData.advancedMode) {
            setIsAmbient(true);
            setRangeLowBoundNonDisplayPrice(0);
            setRangeHighBoundNonDisplayPrice(Infinity);
        } else if (tradeData.advancedMode) {
            setIsAmbient(false);
        } else {
            setIsAmbient(false);
            if (Math.abs(currentPoolPriceTick) === Infinity || Math.abs(currentPoolPriceTick) === 0)
                return;
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

            console.log({ pinnedDisplayPrices });

            setRangeLowBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMinPriceNonDisplay);
            setRangeHighBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMaxPriceNonDisplay);

            setPinnedMinPriceDisplayTruncated(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);
            setPinnedMaxPriceDisplayTruncated(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated);

            // setRangeLowTick(pinnedDisplayPrices.pinnedLowTick);
            // setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);

            dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick));
            dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

            dispatch(
                setPinnedMinPrice(parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated)),
            );
            dispatch(
                setPinnedMaxPrice(parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated)),
            );

            dispatch(setRangeModuleTriggered(true));
        }
    }, [
        rangeWidthPercentage,
        tradeData.advancedMode,
        denominationsInBase,
        baseTokenDecimals,
        quoteTokenDecimals,
        currentPoolPriceTick,
    ]);

    const isQtyEntered = tokenAInputQty !== '' && tokenBInputQty !== '';

    const showExtraInfoDropdown = tokenAInputQty !== '' || tokenBInputQty !== '';
    // const showExtraInfoDropdown =
    //     (tokenAInputQty !== '' && tokenAInputQty !== '0') ||
    //     (tokenBInputQty !== '' && tokenBInputQty !== '0');

    const rangeSpanAboveCurrentPrice = defaultHighTick - currentPoolPriceTick;
    const rangeSpanBelowCurrentPrice = currentPoolPriceTick - defaultLowTick;

    const isOutOfRange = !tradeData.advancedMode
        ? false
        : rangeSpanAboveCurrentPrice < 0 || rangeSpanBelowCurrentPrice < 0;

    const isInvalidRange = !isAmbient && defaultHighTick <= defaultLowTick;

    useEffect(() => {
        if (poolExists === undefined || poolPriceNonDisplay === undefined) {
            setRangeButtonErrorMessage('…');
        } else if (!poolExists) {
            setRangeButtonErrorMessage('Pool Not Initialized');
        } else if (isInvalidRange) {
            setRangeButtonErrorMessage('Please Enter a Valid Range');
        } else if (!isQtyEntered) {
            setRangeButtonErrorMessage('Enter an Amount');
        }
    }, [isQtyEntered, poolExists, isInvalidRange, poolPriceNonDisplay]);

    const minimumSpan =
        rangeSpanAboveCurrentPrice < rangeSpanBelowCurrentPrice
            ? rangeSpanAboveCurrentPrice
            : rangeSpanBelowCurrentPrice;

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
        denominationsInBase,
    ]);

    const [rangeLowBoundNonDisplayPrice, setRangeLowBoundNonDisplayPrice] = useState(0);
    const [rangeHighBoundNonDisplayPrice, setRangeHighBoundNonDisplayPrice] = useState(0);

    const [pinnedMinPriceDisplayTruncated, setPinnedMinPriceDisplayTruncated] = useState('');
    const [pinnedMaxPriceDisplayTruncated, setPinnedMaxPriceDisplayTruncated] = useState('');

    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] = useState(false);

    const lowBoundOnBlur = () => {
        setRangeLowBoundFieldBlurred(true);
    };

    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] = useState(false);
    const highBoundOnBlur = () => {
        setRangeHighBoundFieldBlurred(true);
    };

    useEffect(() => {
        if (tradeData.advancedMode) {
            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                lookupChain(chainId).gridSize,
            );
            console.log({ pinnedDisplayPrices });
            setRangeLowBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMinPriceNonDisplay);
            setRangeHighBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMaxPriceNonDisplay);

            setPinnedMinPriceDisplayTruncated(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);
            setPinnedMaxPriceDisplayTruncated(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated);

            const newTargetData: targetData[] = [
                {
                    name: 'Max',
                    value: parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplay),
                },
                {
                    name: 'Min',
                    value: parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplay),
                },
            ];

            dispatch(setTargetData(newTargetData));

            dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick));
            dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

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

            dispatch(
                setPinnedMinPrice(parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated)),
            );
            dispatch(
                setPinnedMaxPrice(parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated)),
            );
            dispatch(setRangeModuleTriggered(true));
        }
    }, [
        currentPoolPriceTick,
        defaultLowTick,
        defaultHighTick,
        denominationsInBase,
        baseTokenDecimals,
        quoteTokenDecimals,
        tradeData.advancedMode,
    ]);

    useEffect(() => {
        if (rangeLowBoundFieldBlurred || rangeLowLineTriggered) {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;

            const targetMinValue = tradeData.targetData.filter(
                (target: any) => target.name === 'Min',
            )[0].value;

            const targetMaxValue = tradeData.targetData.filter(
                (target: any) => target.name === 'Max',
            )[0].value;

            const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                lookupChain(chainId).gridSize,
            );

            !denominationsInBase
                ? setRangeLowBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMinPriceNonDisplay)
                : setRangeHighBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMaxPriceNonDisplay);

            !denominationsInBase
                ? dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick))
                : dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

            !denominationsInBase
                ? dispatch(setPinnedMinPrice(pinnedDisplayPrices.pinnedLowTick))
                : dispatch(setPinnedMaxPrice(pinnedDisplayPrices.pinnedHighTick));

            if (isLinesSwitched) {
                denominationsInBase
                    ? dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick))
                    : dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));
            }

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

            setPinnedMinPriceDisplayTruncated(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);

            // console.log(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);

            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
            } else {
                console.log('low bound field not found');
            }

            setRangeLowBoundFieldBlurred(false);
            dispatch(setRangeLowLineTriggered(false));
            dispatch(setRangeModuleTriggered(true));
            dispatch(setIsLinesSwitched(false));
        }
    }, [rangeLowBoundFieldBlurred, JSON.stringify(rangeLowLineTriggered)]);

    useEffect(() => {
        if (rangeHighBoundFieldBlurred || rangeHighLineTriggered) {
            const rangeHighBoundDisplayField = document.getElementById(
                'max-price-input-quantity',
            ) as HTMLInputElement;

            const targetMaxValue = tradeData.targetData.filter(
                (target: any) => target.name === 'Max',
            )[0].value;

            const targetMinValue = tradeData.targetData.filter(
                (target: any) => target.name === 'Min',
            )[0].value;

            const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                lookupChain(chainId).gridSize,
            );

            denominationsInBase
                ? setRangeLowBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMinPriceNonDisplay)
                : setRangeHighBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMaxPriceNonDisplay);

            denominationsInBase
                ? dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick))
                : dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));
            if (isLinesSwitched) {
                !denominationsInBase
                    ? dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick))
                    : dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));
            }

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

            setPinnedMaxPriceDisplayTruncated(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated);

            if (rangeHighBoundDisplayField) {
                rangeHighBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
            } else {
                console.log('high bound field not found');
            }

            setRangeHighBoundFieldBlurred(false);
            dispatch(setRangeHighLineTriggered(false));
            dispatch(setRangeModuleTriggered(true));
            dispatch(setIsLinesSwitched(false));
        }
    }, [rangeHighBoundFieldBlurred, JSON.stringify(rangeHighLineTriggered)]);

    const depositSkew = useMemo(
        () =>
            concDepositSkew(
                poolPriceNonDisplay ?? 0,
                rangeLowBoundNonDisplayPrice,
                rangeHighBoundNonDisplayPrice,
            ),
        [poolPriceNonDisplay, rangeLowBoundNonDisplayPrice, rangeHighBoundNonDisplayPrice],
    );

    const maxPriceDisplay = isAmbient ? 'Infinity' : pinnedMaxPriceDisplayTruncated;

    const aprPercentage: number | undefined = ambientApy
        ? 100 - rangeWidthPercentage + ambientApy
        : undefined;

    const advancedDaysInRangeEstimation =
        minimumSpan < 0 ? 0 : parseFloat(truncateDecimals(minimumSpan / 100, 0));

    const daysInRangeEstimation: number = isAmbient
        ? 365
        : tradeData.advancedMode
        ? advancedDaysInRangeEstimation
        : rangeWidthPercentage;

    const minPriceDisplay = isAmbient ? '0' : pinnedMinPriceDisplayTruncated;

    const sendTransaction = async () => {
        // if (!provider || !(provider as ethers.providers.WebSocketProvider).getSigner()) {
        //     return;
        // }
        if (!crocEnv) return;

        resetConfirmation();

        const pool = crocEnv.pool(tokenA.address, tokenB.address);

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
                      [defaultLowTick, defaultHighTick],
                      [minPrice, maxPrice],
                      {
                          surplus: [isWithdrawTokenAFromDexChecked, isWithdrawTokenBFromDexChecked],
                      },
                  )
                : pool.mintRangeBase(
                      tokenBInputQty,
                      [defaultLowTick, defaultHighTick],
                      [minPrice, maxPrice],
                      {
                          surplus: [isWithdrawTokenAFromDexChecked, isWithdrawTokenBFromDexChecked],
                      },
                  ));
            setNewRangeTransactionHash(tx?.hash);
            dispatch(addPendingTx(tx?.hash));
        } catch (error) {
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
        }

        const newLiqChangeCacheEndpoint = 'https://809821320828123.de:5000/new_liqchange?';
        if (tx?.hash) {
            if (isAmbient) {
                fetch(
                    newLiqChangeCacheEndpoint +
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
                    newLiqChangeCacheEndpoint +
                        new URLSearchParams({
                            chainId: chainId,
                            tx: tx.hash,
                            user: account ?? '',
                            base: baseTokenAddress,
                            quote: quoteTokenAddress,
                            poolIdx: lookupChain(chainId).poolIndex.toString(),
                            positionType: 'concentrated',
                            changeType: 'mint',
                            bidTick: defaultLowTick.toString(),
                            askTick: defaultHighTick.toString(),
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
            console.log({ error });
            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                console.log('repriced');
                dispatch(removePendingTx(error.hash));
                const newTransactionHash = error.replacement.hash;
                dispatch(addPendingTx(newTransactionHash));
                setNewRangeTransactionHash(newTransactionHash);
                console.log({ newTransactionHash });
                receipt = error.receipt;

                if (tx?.hash) {
                    fetch(
                        newLiqChangeCacheEndpoint +
                            new URLSearchParams({
                                chainId: chainId,
                                tx: newTransactionHash,
                                user: account ?? '',
                                base: baseTokenAddress,
                                quote: quoteTokenAddress,
                                poolIdx: lookupChain(chainId).poolIndex.toString(),
                                positionType: isAmbient ? 'ambient' : 'concentrated',
                                changeType: 'mint',
                                bidTick: defaultLowTick.toString(),
                                askTick: defaultHighTick.toString(),
                                isBid: 'false', // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                                liq: '0', // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                            }),
                    );
                }
            } else if (isTransactionFailedError(error)) {
                // console.log({ error });
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
            const gasPriceInDollarsNum = gasPriceInGwei * 120269 * 1e-9 * ethMainnetUsdPrice;

            setRangeGasPriceinDollars(
                '$' +
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

    const isTokenAPrimaryLocal = tradeData.isTokenAPrimaryRange;
    // const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
    //     tradeData.isTokenAPrimaryRange,
    // );

    // useEffect(() => {
    //     console.log({ isTokenAPrimaryLocal });
    // }, [isTokenAPrimaryLocal]);

    // props for <RangePriceInfo/> React element
    const rangePriceInfoProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: displayPriceString,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        aprPercentage: aprPercentage,
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
                defaultLowTick,
                defaultHighTick,
                lookupChain(chainId).gridSize,
            ).pinnedMinPriceDisplayTruncated,
        [baseTokenDecimals, quoteTokenDecimals, defaultLowTick, defaultHighTick],
    );

    const pinnedMinPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                lookupChain(chainId).gridSize,
            ).pinnedMinPriceDisplayTruncated,
        [baseTokenDecimals, quoteTokenDecimals, defaultLowTick, defaultHighTick],
    );

    const pinnedMaxPriceDisplayTruncatedInBase = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                true,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                lookupChain(chainId).gridSize,
            ).pinnedMaxPriceDisplayTruncated,
        [baseTokenDecimals, quoteTokenDecimals, defaultLowTick, defaultHighTick],
    );

    const pinnedMaxPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseTokenDecimals,
                quoteTokenDecimals,
                defaultLowTick,
                defaultHighTick,
                lookupChain(chainId).gridSize,
            ).pinnedMaxPriceDisplayTruncated,
        [baseTokenDecimals, quoteTokenDecimals, defaultLowTick, defaultHighTick],
    );

    const handleModalClose = () => {
        closeModal();
        setNewRangeTransactionHash('');
        resetConfirmation();
    };

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
    };

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencyConverterProps = {
        provider: provider,
        isUserLoggedIn: isUserLoggedIn,
        poolPriceNonDisplay: poolPriceNonDisplay,
        chainId: chainId ?? '0x2a',
        tokensBank: importedTokens,
        setImportedTokens: setImportedTokens,
        tokenPair: tokenPair,
        isAmbient: isAmbient,
        isTokenABase: isTokenABase,
        depositSkew: depositSkew,
        gasPriceInGwei: gasPriceInGwei,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        isTokenAPrimaryLocal: isTokenAPrimaryLocal,
        // setIsTokenAPrimaryLocal: setIsTokenAPrimaryLocal,
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

        isRangeCopied: isRangeCopied,
        tokenAQtyLocal,
        tokenBQtyLocal,
        setTokenAQtyLocal,
        setTokenBQtyLocal,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: importedTokensPlus,
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
    };

    // props for <RangeWidth/> React element
    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
        isRangeCopied: isRangeCopied,
    };
    // props for <RangeExtraInfo/> React element

    const rangeExtraInfoProps = {
        isQtyEntered: isQtyEntered,
        tokenPair: tokenPair,
        rangeGasPriceinDollars: rangeGasPriceinDollars,
        poolPriceDisplay: displayPriceString,
        slippageTolerance: slippageTolerancePercentage,
        liquidityProviderFee: 0.3,
        quoteTokenIsBuy: true,
        isDenomBase: tradeData.isDenomBase,
        isTokenABase: isTokenABase,
        daysInRangeEstimation: daysInRangeEstimation,
        showExtraInfoDropdown: showExtraInfoDropdown,
        isBalancedMode: !tradeData.advancedMode,
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
                    rangeLowTick={defaultLowTick}
                    rangeHighTick={defaultHighTick}
                    // setRangeLowTick={setRangeLowTick}
                    // setRangeHighTick={setRangeHighTick}
                    disable={isInvalidRange || !poolExists}
                    chainId={chainId.toString()}
                    targetData={tradeData.targetData}
                    isRangeCopied={isRangeCopied}
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

    const loginButton = (
        <button onClick={openModalWallet} className={styles.authenticate_button}>
            Connect Wallet
        </button>
    );

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const approve = async (tokenAddress: string) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv.token(tokenAddress).approve();
            if (tx) dispatch(addPendingTx(tx?.hash));
            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.log({ error });
                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    console.log('repriced');
                    dispatch(removePendingTx(error.hash));

                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));

                    console.log({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    // console.log({ error });
                    receipt = error.receipt;
                }
            }
            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
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
            flat={true}
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
            flat={true}
        />
    );
    // -------------------------RANGE SHARE FUNCTIONALITY---------------------------
    const [shareOptions, setShareOptions] = useState([
        { slug: 'first', name: 'Include Range 1', checked: false },
        { slug: 'second', name: 'Include Range 2', checked: false },
        { slug: 'third', name: 'Include Range 3', checked: false },
        { slug: 'fourth', name: 'Include Range 4', checked: false },
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

    const shareOptionsDisplay = (
        <div className={styles.option_control_container}>
            <div className={styles.options_control_display_container}>
                <p className={styles.control_title}>Options</p>
                <ul>
                    {shareOptions.map((option, idx) => (
                        <RangeShareControl
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

    // -------------------------END OF RANGE SHARE FUNCTIONALITY---------------------------
    return (
        <section data-testid={'range'} className={styles.scrollable_container}>
            <ContentContainer isOnTradeRoute>
                <RangeHeader
                    chainId={chainId}
                    tokenPair={tokenPair}
                    mintSlippage={mintSlippage}
                    isPairStable={isPairStable}
                    isDenomBase={tradeData.isDenomBase}
                    isTokenABase={isTokenABase}
                    openGlobalModal={openGlobalModal}
                    shareOptionsDisplay={shareOptionsDisplay}
                />
                <DividerDark addMarginTop />
                {navigationMenu}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <DividerDark />
                    {tradeData.advancedMode ? advancedModeContent : baseModeContent}
                </motion.div>
                {isUserLoggedIn === undefined ? null : isUserLoggedIn === true ? (
                    poolPriceNonDisplay !== 0 &&
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
                            rangeAllowed={poolExists === true && rangeAllowed && !isInvalidRange}
                            rangeButtonErrorMessage={rangeButtonErrorMessage}
                        />
                    )
                ) : (
                    loginButton
                )}
            </ContentContainer>
            {confirmSwapModalOrNull}
        </section>
    );
}
