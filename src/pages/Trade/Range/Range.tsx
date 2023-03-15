/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import {
    useState,
    useEffect,
    useMemo,
    Dispatch,
    SetStateAction,
    ReactNode,
} from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
    concDepositSkew,
    capitalConcFactor,
    CrocEnv,
} from '@crocswap-libs/sdk';
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
import { PositionIF, TokenIF } from '../../../utils/interfaces/exports';
import { useTradeData } from '../Trade';
import { useModal } from '../../../components/Global/Modal/useModal';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setIsLinesSwitched,
} from '../../../utils/state/tradeDataSlice';
import {
    addPendingTx,
    addReceipt,
    removePendingTx,
} from '../../../utils/state/receiptDataSlice';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import RangeShareControl from '../../../components/Trade/Range/RangeShareControl/RangeShareControl';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';
import { graphData } from '../../../utils/state/graphDataSlice';
import BypassConfirmRangeButton from '../../../components/Trade/Range/RangeButton/BypassConfirmRangeButton';
import TutorialOverlay from '../../../components/Global/TutorialOverlay/TutorialOverlay';
import {
    rangeTutorialSteps,
    rangeTutorialStepsAdvanced,
} from '../../../utils/tutorial/Range';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { allDexBalanceMethodsIF } from '../../../App/hooks/useExchangePrefs';

interface propsIF {
    account: string | undefined;
    crocEnv: CrocEnv | undefined;
    isUserLoggedIn: boolean | undefined;
    importedTokens: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    mintSlippage: SlippageMethodsIF;
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
    dailyVol: number | undefined;
    openGlobalModal: (content: ReactNode, title?: string) => void;
    poolExists: boolean | undefined;
    graphData: graphData;
    isRangeCopied: boolean;
    tokenAQtyLocal: number;
    tokenBQtyLocal: number;
    setTokenAQtyLocal: Dispatch<SetStateAction<number>>;
    setTokenBQtyLocal: Dispatch<SetStateAction<number>>;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (
        searchName: string,
        chn: string,
        exact: boolean,
    ) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (
        options?: getRecentTokensParamsIF | undefined,
    ) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    acknowledgeToken: (tkn: TokenIF) => void;
    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    isTutorialMode: boolean;
    setIsTutorialMode: Dispatch<SetStateAction<boolean>>;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    simpleRangeWidth: number;
    dexBalancePrefs: allDexBalanceMethodsIF;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    minPrice: number;
    maxPrice: number;
    rescaleRangeBoundariesWithSlider: boolean;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    setChartTriggeredBy: Dispatch<SetStateAction<string>>;
    chartTriggeredBy: string;
}

export default function Range(props: propsIF) {
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
        dailyVol,
        openGlobalModal,
        poolExists,
        graphData,
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
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        acknowledgeToken,
        openGlobalPopup,
        bypassConfirm,
        toggleBypassConfirm,
        dexBalancePrefs,
        setSimpleRangeWidth,
        simpleRangeWidth,
        setMaxPrice,
        setMinPrice,
        setRescaleRangeBoundariesWithSlider,
        minPrice,
        maxPrice,
        setChartTriggeredBy,
        chartTriggeredBy,
    } = props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const [isAmbient, setIsAmbient] = useState(false);

    const dispatch = useAppDispatch();

    // local state values whether tx will use dex balance preferentially over
    // ... wallet funds, this layer of logic matters because the DOM may need
    // ... to use wallet funds without switching the persisted preference
    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] =
        useState<boolean>(dexBalancePrefs.range.drawFromDexBal.isEnabled);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] =
        useState<boolean>(dexBalancePrefs.range.drawFromDexBal.isEnabled);

    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [txErrorCode, setTxErrorCode] = useState('');
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [rangeGasPriceinDollars, setRangeGasPriceinDollars] = useState<
        string | undefined
    >();

    const userPositions = graphData.positionsByUser.positions;
    const [isAdd, setIsAdd] = useState<boolean>(false);

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

    const { tradeData, receiptData } = useAppSelector((state) => state);

    const { navigationMenu } = useTradeData();

    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const denominationsInBase = tradeData.isDenomBase;
    const isTokenAPrimary = tradeData.isTokenAPrimaryRange;

    const isLinesSwitched = tradeData.isLinesSwitched;

    const [rangeAllowed, setRangeAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

    const isTokenABase = tradeData.tokenA.address === baseTokenAddress;

    const slippageTolerancePercentage = isPairStable
        ? mintSlippage.stable
        : mintSlippage.volatile;

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
    const { baseToken, quoteToken } = tradeData;

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
        (tradeData.advancedLowTick === 0 ||
            tradeData.advancedHighTick > currentPoolPriceTick + 100000 ||
            tradeData.advancedLowTick < currentPoolPriceTick - 100000);

    const shouldResetAdvancedHighTick =
        !ticksInParams &&
        (tradeData.advancedHighTick === 0 ||
            tradeData.advancedHighTick > currentPoolPriceTick + 100000 ||
            tradeData.advancedLowTick < currentPoolPriceTick - 100000);

    // default low tick to seed in the DOM (range lower value)
    const defaultLowTick = useMemo(() => {
        const value = shouldResetAdvancedLowTick
            ? roundDownTick(
                  currentPoolPriceTick +
                      defaultMinPriceDifferencePercentage * 100,
                  lookupChain(chainId).gridSize,
              )
            : tradeData.advancedLowTick;
        return value;
    }, [
        tradeData.advancedLowTick,
        currentPoolPriceTick,
        shouldResetAdvancedLowTick,
    ]);

    // default high tick to seed in the DOM (range upper value)
    const defaultHighTick = useMemo(() => {
        const value = shouldResetAdvancedHighTick
            ? roundUpTick(
                  currentPoolPriceTick +
                      defaultMaxPriceDifferencePercentage * 100,
                  lookupChain(chainId).gridSize,
              )
            : tradeData.advancedHighTick;
        return value;
    }, [
        tradeData.advancedHighTick,
        currentPoolPriceTick,
        shouldResetAdvancedHighTick,
    ]);

    useEffect(() => {
        const isAdd = userPositions.some(selectedRangeMatchesOpenPosition);
        if (isAdd) {
            setIsAdd(true);
        } else {
            setIsAdd(false);
        }
    }, [userPositions.length, isAmbient, defaultLowTick, defaultHighTick]);

    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] =
        useState(defaultMinPriceDifferencePercentage);
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] =
        useState(defaultMaxPriceDifferencePercentage);

    useEffect(() => {
        if (rangeWidthPercentage === 100 && !tradeData.advancedMode) {
            setIsAmbient(true);
            setRangeLowBoundNonDisplayPrice(0);
            setRangeHighBoundNonDisplayPrice(Infinity);
        } else if (tradeData.advancedMode) {
            setIsAmbient(false);
        } else {
            setIsAmbient(false);
            if (
                Math.abs(currentPoolPriceTick) === Infinity ||
                Math.abs(currentPoolPriceTick) === 0
            )
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

            // dispatch(
            //     setPinnedMinPrice(parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated)),
            // );
            // dispatch(
            //     setPinnedMaxPrice(parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated)),
            // );

            setMaxPrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinPrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );
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

    const showExtraInfoDropdown =
        tokenAInputQty !== '' || tokenBInputQty !== '';

    const rangeSpanAboveCurrentPrice = defaultHighTick - currentPoolPriceTick;
    const rangeSpanBelowCurrentPrice = currentPoolPriceTick - defaultLowTick;

    const isOutOfRange = !tradeData.advancedMode
        ? false
        : rangeSpanAboveCurrentPrice < 0 || rangeSpanBelowCurrentPrice < 0;

    const isInvalidRange = !isAmbient && defaultHighTick <= defaultLowTick;

    useEffect(() => {
        // console.log({ poolExists });
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

        setTxErrorMessage('');
    };

    const [showBypassConfirmButton, setShowBypassConfirmButton] =
        useState(false);

    const sessionReceipts = receiptData.sessionReceipts;

    const pendingTransactions = receiptData.pendingTransactions;

    const receiveReceiptHashes: Array<string> = [];
    // eslint-disable-next-line
    function handleParseReceipt(receipt: any) {
        const parseReceipt = JSON.parse(receipt);
        receiveReceiptHashes.push(parseReceipt?.transactionHash);
    }

    sessionReceipts.map((receipt) => handleParseReceipt(receipt));

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
        setNewRangeTransactionHash('');
        setShowBypassConfirmButton(false);
    }, [
        JSON.stringify({ base: baseToken.address, quote: quoteToken.address }),
    ]);

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
            denominationsInBase
                ? setMaxPriceDifferencePercentage(
                      -lowGeometricDifferencePercentage,
                  )
                : setMaxPriceDifferencePercentage(
                      highGeometricDifferencePercentage,
                  );

            denominationsInBase
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

            // dispatch(
            //     setPinnedMinPrice(parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated)),
            // );
            // dispatch(
            //     setPinnedMaxPrice(parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated)),
            // );
            setMaxPrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinPrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );

            // dispatch(setRangeModuleTriggered(true));
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
        if (rangeLowBoundFieldBlurred || chartTriggeredBy === 'low_line') {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;

            const targetMinValue = minPrice;
            const targetMaxValue = maxPrice;

            const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                lookupChain(chainId).gridSize,
            );

            !denominationsInBase
                ? setRangeLowBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMinPriceNonDisplay,
                  )
                : setRangeHighBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
                  );

            !denominationsInBase
                ? dispatch(
                      setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick),
                  )
                : dispatch(
                      setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick),
                  );

            // !denominationsInBase
            //     ? dispatch(setPinnedMinPrice(pinnedDisplayPrices.pinnedLowTick))
            //     : dispatch(setPinnedMaxPrice(pinnedDisplayPrices.pinnedHighTick));

            !denominationsInBase
                ? setMinPrice(pinnedDisplayPrices.pinnedLowTick)
                : setMaxPrice(pinnedDisplayPrices.pinnedHighTick);

            if (isLinesSwitched) {
                denominationsInBase
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
            denominationsInBase
                ? setMinPriceDifferencePercentage(
                      -highGeometricDifferencePercentage,
                  )
                : setMinPriceDifferencePercentage(
                      lowGeometricDifferencePercentage,
                  );

            setPinnedMinPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            );

            // console.log(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);

            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
            } else {
                console.log('low bound field not found');
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
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                lookupChain(chainId).gridSize,
            );

            denominationsInBase
                ? setRangeLowBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMinPriceNonDisplay,
                  )
                : setRangeHighBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
                  );

            denominationsInBase
                ? dispatch(
                      setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick),
                  )
                : dispatch(
                      setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick),
                  );
            if (isLinesSwitched) {
                !denominationsInBase
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
            denominationsInBase
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
                console.log('high bound field not found');
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
                ? isTokenAPrimary
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
                : isTokenAPrimary
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
            setIsWaitingForWallet(false);
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.log({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
            setIsWaitingForWallet(false);
        }

        const newLiqChangeCacheEndpoint =
            'https://809821320828123.de:5000/new_liqchange?';
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
                                poolIdx:
                                    lookupChain(chainId).poolIndex.toString(),
                                positionType: isAmbient
                                    ? 'ambient'
                                    : 'concentrated',
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
            const gasPriceInDollarsNum =
                gasPriceInGwei * 120269 * 1e-9 * ethMainnetUsdPrice;

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

    // props for <RangePriceInfo/> React element
    const rangePriceInfoProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: displayPriceString,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        aprPercentage: aprPercentage,
        daysInRange: daysInRange,
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
                lookupChain(chainId).gridSize,
            ).pinnedMinPriceDisplayTruncated,
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
                lookupChain(chainId).gridSize,
            ).pinnedMaxPriceDisplayTruncated,
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
                lookupChain(chainId).gridSize,
            ).pinnedMaxPriceDisplayTruncated,
        [
            baseTokenDecimals,
            quoteTokenDecimals,
            defaultLowTick,
            defaultHighTick,
        ],
    );

    const handleModalClose = () => {
        closeModal();
        setNewRangeTransactionHash('');
        resetConfirmation();
    };

    const handleRangeButtonClickWithBypass = () => {
        setShowBypassConfirmButton(true);
        sendTransaction();
    };

    // props for <ConfirmRangeModal/> React element
    const rangeModalProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: displayPriceString,
        poolPriceDisplayNum: poolPriceDisplayNum,
        denominationsInBase: denominationsInBase,
        isTokenABase: isTokenABase,
        isAmbient: isAmbient,
        isAdd: isAdd,
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
        pinnedMinPriceDisplayTruncatedInBase:
            pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote:
            pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase:
            pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote:
            pinnedMaxPriceDisplayTruncatedInQuote,
        bypassConfirm: bypassConfirm,
        toggleBypassConfirm: toggleBypassConfirm,
    };

    const bypassConfirmButtonProps = {
        newRangeTransactionHash: newRangeTransactionHash,
        txErrorCode: txErrorCode,
        tokenPair: tokenPair,
        resetConfirmation: resetConfirmation,
        sendTransaction: sendTransaction,
        setShowBypassConfirmButton: setShowBypassConfirmButton,
        showBypassConfirmButton: showBypassConfirmButton,
    };

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencyConverterProps = {
        poolExists: poolExists,
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
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
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
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        acknowledgeToken: acknowledgeToken,
        openGlobalPopup: openGlobalPopup,
        dexBalancePrefs: dexBalancePrefs,
    };

    // props for <RangeWidth/> React element
    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
        isRangeCopied: isRangeCopied,
        openGlobalPopup: openGlobalPopup,
        setRescaleRangeBoundariesWithSlider:
            setRescaleRangeBoundariesWithSlider,
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
        showExtraInfoDropdown: showExtraInfoDropdown,
        isBalancedMode: !tradeData.advancedMode,
        aprPercentage: aprPercentage,
        daysInRange: daysInRange,
    };

    const baseModeContent = (
        <div>
            <RangeCurrencyConverter
                {...rangeCurrencyConverterProps}
                isAdvancedMode={false}
            />
            {/* <DividerDark addMarginTop /> */}
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
            <RangeCurrencyConverter
                {...rangeCurrencyConverterProps}
                isAdvancedMode
            />
            {/* <DividerDark addMarginTop /> */}

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
                    maxPrice={maxPrice}
                    minPrice={minPrice}
                    setMaxPrice={setMaxPrice}
                    setMinPrice={setMinPrice}
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
                aprPercentage={aprPercentage}
                daysInRange={daysInRange}
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

    const isTokenAAllowanceSufficient =
        parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    const isTokenBAllowanceSufficient =
        parseFloat(tokenBAllowance) >= parseFloat(tokenBInputQty);

    const loginButton = (
        <button
            onClick={openModalWallet}
            className={styles.authenticate_button}
        >
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
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
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
    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    return (
        <section data-testid={'range'} className={styles.scrollable_container}>
            {props.isTutorialMode && (
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
                <RangeHeader
                    chainId={chainId}
                    tokenPair={tokenPair}
                    mintSlippage={mintSlippage}
                    isPairStable={isPairStable}
                    isDenomBase={tradeData.isDenomBase}
                    isTokenABase={isTokenABase}
                    openGlobalModal={openGlobalModal}
                    shareOptionsDisplay={shareOptionsDisplay}
                    bypassConfirm={bypassConfirm}
                    toggleBypassConfirm={toggleBypassConfirm}
                />
                {navigationMenu}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {tradeData.advancedMode
                        ? advancedModeContent
                        : baseModeContent}
                </motion.div>
                {isUserLoggedIn === undefined ? null : isUserLoggedIn ===
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
                        <RangeButton
                            onClickFn={
                                bypassConfirm
                                    ? handleRangeButtonClickWithBypass
                                    : openModal
                            }
                            rangeAllowed={
                                poolExists === true &&
                                rangeAllowed &&
                                !isInvalidRange
                            }
                            rangeButtonErrorMessage={rangeButtonErrorMessage}
                            bypassConfirm={bypassConfirm}
                            isAmbient={isAmbient}
                            isAdd={isAdd}
                        />
                    )
                ) : (
                    loginButton
                )}
            </ContentContainer>
            {confirmSwapModalOrNull}
            <TutorialOverlay
                isTutorialEnabled={isTutorialEnabled}
                setIsTutorialEnabled={setIsTutorialEnabled}
                steps={
                    !tradeData.advancedMode
                        ? rangeTutorialStepsAdvanced
                        : rangeTutorialSteps
                }
            />
        </section>
    );
}
