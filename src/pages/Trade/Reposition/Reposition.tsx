// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import {
    useLocation,
    // useNavigate,
    useParams,
    Navigate,
} from 'react-router-dom';
import {
    ChainSpec,
    CrocEnv,
    CrocPositionView,
    CrocReposition,
    toDisplayPrice,
} from '@crocswap-libs/sdk';

// START: Import JSX Components
// import RepositionDenominationSwitch from '../../../components/Trade/Reposition/RepositionDenominationSwitch/RepositionDenominationSwitch';
import RepositionHeader from '../../../components/Trade/Reposition/RepositionHeader/RepositionHeader';
import RepositionPriceInfo from '../../../components/Trade/Reposition/RepositionPriceInfo/RepositionPriceInfo';
import RepositionRangeWidth from '../../../components/Trade/Reposition/RepositionRangeWidth/RepositionRangeWidth';
import ConfirmRepositionModal from '../../../components/Trade/Reposition/ConfirmRepositionModal/ConfirmRepositionModal';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Global/Button/Button';
// START: Import Other Local Files
import styles from './Reposition.module.css';
import { useModal } from '../../../components/Global/Modal/useModal';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { PositionIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { getPinnedPriceValuesFromTicks } from '../Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
// import { BigNumber } from 'ethers';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
} from '../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';
import useDebounce from '../../../App/hooks/useDebounce';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { setAdvancedMode } from '../../../utils/state/tradeDataSlice';
import { allSkipConfirmMethodsIF } from '../../../App/hooks/useSkipConfirm';
import { IS_LOCAL_ENV } from '../../../constants';
import BypassConfirmRepositionButton from '../../../components/Trade/Reposition/BypassConfirmRepositionButton/BypassConfirmRepositionButton';
import { FiExternalLink } from 'react-icons/fi';
import { useUrlParams } from '../../../utils/hooks/useUrlParams';
import { ethers } from 'ethers';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    isDenomBase: boolean;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
    repoSlippage: SlippageMethodsIF;
    provider: ethers.providers.Provider;
    chainId: string;
    isPairStable: boolean;
    bypassConfirm: allSkipConfirmMethodsIF;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    tokenPair: TokenPairIF;
    poolPriceDisplay: number | undefined;
    lastBlockNumber: number;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    simpleRangeWidth: number;
    gasPriceInGwei: number | undefined;
    ethMainnetUsdPrice: number | undefined;
    chainData: ChainSpec;

    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
}

export default function Reposition(props: propsIF) {
    const {
        crocEnv,
        isDenomBase,
        ambientApy,
        dailyVol,
        repoSlippage,
        provider,
        chainId,
        isPairStable,
        bypassConfirm,
        setMinPrice,
        setMaxPrice,
        setRescaleRangeBoundariesWithSlider,
        tokenPair,
        poolPriceDisplay,
        lastBlockNumber,
        setSimpleRangeWidth,
        simpleRangeWidth,
        gasPriceInGwei,
        ethMainnetUsdPrice,
        chainData,
        openGlobalPopup,
    } = props;

    // current URL parameter string
    const { params } = useParams();

    const [newRepositionTransactionHash, setNewRepositionTransactionHash] =
        useState('');
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [txErrorCode, setTxErrorCode] = useState('');
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');
        setTxErrorMessage('');
    };

    const isRepositionSent = newRepositionTransactionHash !== '';

    // locationHook object (we need this mainly for position data)
    const locationHook = useLocation();

    // fn to conditionally navigate the user
    // const navigate = useNavigate();

    const dispatch = useAppDispatch();
    useUrlParams(chainId, provider);

    // redirect path to use in this module
    // will try to preserve current params, will use default path otherwise
    const redirectPath = '/trade/range/' + (params ?? '');

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
        return <Navigate to={redirectPath} replace />;
    }

    // position data from the locationHook object
    const { position } = locationHook.state as { position: PositionIF };

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

    const { tradeData, receiptData } = useAppSelector((state) => state);

    const isTokenABase = tradeData.isTokenABase;

    const currentPoolPriceNonDisplay = tradeData.poolPriceNonDisplay;

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

    const truncatedCurrentPoolDisplayPriceInBase = currentPoolDisplayPriceInBase
        ? currentPoolDisplayPriceInBase < 2
            ? currentPoolDisplayPriceInBase.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : currentPoolDisplayPriceInBase.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    const truncatedCurrentPoolDisplayPriceInQuote =
        currentPoolDisplayPriceInQuote
            ? currentPoolDisplayPriceInQuote < 2
                ? currentPoolDisplayPriceInQuote.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                  })
                : currentPoolDisplayPriceInQuote.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : '0.00';

    const currentPoolPriceDisplay =
        currentPoolPriceNonDisplay === 0
            ? '0'
            : isDenomBase
            ? truncatedCurrentPoolDisplayPriceInBase
            : truncatedCurrentPoolDisplayPriceInQuote;

    // const currentlocationHook = locationHook.pathname;
    const [isModalOpen, openModal, closeModal] = useModal();

    const handleModalClose = () => {
        closeModal();
        resetConfirmation();
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
    }, [
        rangeWidthPercentage,
        currentPoolPriceTick,
        currentPoolPriceDisplay,
        position?.base,
        position?.quote,
    ]);

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
        if (!crocEnv) {
            location.reload();
            return;
        }
        let tx;
        setTxErrorCode('');
        setTxErrorMessage('');

        // resetConfirmation();
        setIsWaitingForWallet(true);

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
                        txType: `Reposition ${position.baseSymbol}+${position.quoteSymbol}`,
                    }),
                );
            setIsWaitingForWallet(false);
            // We want the user to exit themselves
            // navigate(redirectPath, { replace: true });
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
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

    function truncateString(qty?: number): string {
        return qty
            ? qty < 2
                ? qty.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                  })
                : qty.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : '0.00';
    }

    const [currentBaseQtyDisplayTruncated, setCurrentBaseQtyDisplayTruncated] =
        useState<string>(position?.positionLiqBaseTruncated || '0.00');
    const [
        currentQuoteQtyDisplayTruncated,
        setCurrentQuoteQtyDisplayTruncated,
    ] = useState<string>(position?.positionLiqQuoteTruncated || '0.00');
    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const positionStatsCacheEndpoint =
        httpGraphCacheServerDomain + '/position_stats?';
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
            .then((json) => {
                const positionStats = json?.data;
                const liqBaseNum =
                    positionStats.positionLiqBaseDecimalCorrected;
                const liqQuoteNum =
                    positionStats.positionLiqQuoteDecimalCorrected;
                const liqBaseDisplay = liqBaseNum
                    ? liqBaseNum < 2
                        ? liqBaseNum.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                          })
                        : liqBaseNum.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })
                    : undefined;
                // console.log({ liqBaseDisplay });
                setCurrentBaseQtyDisplayTruncated(liqBaseDisplay || '0.00');

                const liqQuoteDisplay = liqQuoteNum
                    ? liqQuoteNum < 2
                        ? liqQuoteNum.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                          })
                        : liqQuoteNum.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })
                    : undefined;
                // console.log({ liqQuoteDisplay });
                setCurrentQuoteQtyDisplayTruncated(liqQuoteDisplay || '0.00');
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchCurrentCollateral();
    }, [lastBlockNumber, JSON.stringify(position)]);

    // const currentBaseQtyDisplay = position?.positionLiqBaseDecimalCorrected;
    // const currentQuoteQtyDisplay = position?.positionLiqQuoteDecimalCorrected;
    // const currentBaseQtyDisplayTruncated = truncateString(currentBaseQtyDisplay);
    // const currentQuoteQtyDisplayTruncated = truncateString(currentQuoteQtyDisplay);

    const [newBaseQtyDisplay, setNewBaseQtyDisplay] = useState<string>('0.00');
    const [newQuoteQtyDisplay, setNewQuoteQtyDisplay] =
        useState<string>('0.00');

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
            isPositionInRange ||
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
            setNewBaseQtyDisplay(truncateString(base));
            setNewQuoteQtyDisplay(truncateString(quote));
        });
    }, [
        isPositionInRange,
        crocEnv,
        debouncedLowTick, // Debounce because effect involves on-chain call
        debouncedHighTick,
        position.baseSymbol,
        position.quoteSymbol,
        currentPoolPriceTick,
        position.positionLiq,
        position.bidTick,
        position.askTick,
    ]);

    const [rangeGasPriceinDollars, setRangeGasPriceinDollars] = useState<
        string | undefined
    >();

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei * 260705 * 1e-9 * ethMainnetUsdPrice;

            setRangeGasPriceinDollars(
                '$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

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
    const [showExtraInfo, setShowExtraInfo] = useState(false);

    const confirmRepositionModalProps = {
        isPositionInRange: isPositionInRange,
        crocEnv: crocEnv,
        position: position as PositionIF,
        ambientApy: ambientApy,
        dailyVol: dailyVol,
        currentPoolPriceDisplay: currentPoolPriceDisplay,
        currentPoolPriceTick: currentPoolPriceTick,
        rangeWidthPercentage: rangeWidthPercentage,
        onClose: handleModalClose,
        onSend: sendRepositionTransaction,
        setMaxPrice: setMaxPrice,
        setMinPrice: setMinPrice,
        showConfirmation: showConfirmation,
        setShowConfirmation: setShowConfirmation,
        newRepositionTransactionHash: newRepositionTransactionHash,
        tokenPair: tokenPair,
        resetConfirmation: resetConfirmation,
        txErrorCode: txErrorCode,
        txErrorMessage: txErrorMessage,
        minPriceDisplay: minPriceDisplay,
        maxPriceDisplay: maxPriceDisplay,
        currentBaseQtyDisplayTruncated: currentBaseQtyDisplayTruncated,
        currentQuoteQtyDisplayTruncated: currentQuoteQtyDisplayTruncated,
        newBaseQtyDisplay: newBaseQtyDisplay,
        newQuoteQtyDisplay: newQuoteQtyDisplay,
        isAmbient: isAmbient,
        pinnedMinPriceDisplayTruncatedInBase:
            pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote:
            pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase:
            pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote:
            pinnedMaxPriceDisplayTruncatedInQuote,
        isDenomBase: isDenomBase,
        isTokenABase: isTokenABase,
        poolPriceDisplayNum: poolPriceDisplay || 0,
        bypassConfirm: bypassConfirm,
        // showBypassConfirm,
        // setShowBypassConfirm,

        showExtraInfo,
        setShowExtraInfo,
    };

    const bypassConfirmRepositionButtonProps = {
        newRepositionTransactionHash,
        txErrorCode,
        tokenPair,
        onSend: sendRepositionTransaction,
        resetConfirmation,
        showExtraInfo,
        setShowExtraInfo,

        showBypassConfirm: showBypassConfirmButton,
        setShowBypassConfirm: setShowBypassConfirmButton,
        setNewRepositionTransactionHash,
    };

    const handleRepoButtonClickWithBypass = () => {
        IS_LOCAL_ENV && console.debug('setting to true');
        setShowBypassConfirmButton(true);
        sendRepositionTransaction();
    };

    const txUrlOnBlockExplorer = `${chainData.blockExplorer}/tx/${newRepositionTransactionHash}`;

    const etherscanButton = (
        <a
            href={txUrlOnBlockExplorer}
            target='_blank'
            rel='noreferrer'
            className={styles.view_etherscan}
        >
            View on Etherscan
            <FiExternalLink size={12} color='var(--text-grey-white)' />
        </a>
    );

    return (
        <div className={styles.repositionContainer}>
            <RepositionHeader
                setRangeWidthPercentage={setRangeWidthPercentage}
                setSimpleRangeWidth={setSimpleRangeWidth}
                positionHash={position.positionStorageSlot}
                repoSlippage={repoSlippage}
                isPairStable={isPairStable}
                bypassConfirm={bypassConfirm}
                resetTxHash={() => setNewRepositionTransactionHash('')}
            />
            <div className={styles.reposition_content}>
                <RepositionRangeWidth
                    rangeWidthPercentage={rangeWidthPercentage}
                    setRangeWidthPercentage={setRangeWidthPercentage}
                    setRescaleRangeBoundariesWithSlider={
                        setRescaleRangeBoundariesWithSlider
                    }
                />
                <RepositionPriceInfo
                    crocEnv={crocEnv}
                    position={position}
                    ambientApy={ambientApy}
                    dailyVol={dailyVol}
                    currentPoolPriceDisplay={currentPoolPriceDisplay}
                    currentPoolPriceTick={currentPoolPriceTick}
                    rangeWidthPercentage={rangeWidthPercentage}
                    setMaxPrice={setMaxPrice}
                    setMinPrice={setMinPrice}
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
                    repoSlippage={repoSlippage}
                    isPairStable={isPairStable}
                    poolPriceDisplay={poolPriceDisplay}
                    isDenomBase={isDenomBase}
                    currentMinPrice={position?.lowRangeDisplayInBase}
                    currentMaxPrice={position?.highRangeDisplayInBase}
                    openGlobalPopup={openGlobalPopup}
                />
                <div className={styles.button_container}>
                    {!showBypassConfirmButton ? (
                        <Button
                            title={
                                isRepositionSent
                                    ? 'Reposition Sent'
                                    : isPositionInRange
                                    ? 'Position Currently In Range'
                                    : bypassConfirm.repo.isEnabled
                                    ? 'Reposition'
                                    : 'Open Confirmation'
                            }
                            action={
                                bypassConfirm.repo.isEnabled
                                    ? handleRepoButtonClickWithBypass
                                    : openModal
                            }
                            disabled={isRepositionSent || isPositionInRange}
                            flat
                        />
                    ) : (
                        <BypassConfirmRepositionButton
                            {...bypassConfirmRepositionButtonProps}
                        />
                    )}
                </div>
                {isRepositionSent ? etherscanButton : null}
            </div>
            {isModalOpen && (
                <Modal
                    onClose={handleModalClose}
                    title=' Confirm Reposition'
                    centeredTitle
                >
                    <ConfirmRepositionModal {...confirmRepositionModalProps} />
                </Modal>
            )}
        </div>
    );
}
