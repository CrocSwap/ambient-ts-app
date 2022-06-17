// START: Import React and Dongles
import { useState, useEffect, useMemo } from 'react';
import { useMoralis, useNewMoralisObject } from 'react-moralis';
import { motion } from 'framer-motion';
import { BigNumber } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
    sendAmbientMint,
    liquidityForBaseQty,
    liquidityForQuoteQty,
    fromDisplayQty,
    sendConcMint,
    parseMintEthersReceipt,
    EthersNativeReceipt,
    ambientPosSlot,
    tickToPrice,
    toDisplayPrice,
    concDepositSkew,
    GRID_SIZE_DFLT,
    MIN_TICK,
    MAX_TICK,
    concPosSlot,
    approveToken,
    contractAddresses,
    // pinTickLower,
    fromDisplayPrice,
} from '@crocswap-libs/sdk';

import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';

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

// START: Import Local Files
import styles from './Range.module.css';
import { isTransactionReplacedError, TransactionError } from '../../../utils/TransactionError';
import { handleParsedReceipt } from '../../../utils/HandleParsedReceipt';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import ConfirmRangeModal from '../../../components/Trade/Range/ConfirmRangeModal/ConfirmRangeModal';
import { TokenIF } from '../../../utils/interfaces/exports';
import { useTradeData } from '../Trade';
import { useModal } from '../../../components/Global/Modal/useModal';
import RangeExtraInfo from '../../../components/Trade/Range/RangeExtraInfo/RangeExtraInfo';
import { setAdvancedHighTick, setAdvancedLowTick } from '../../../utils/state/tradeDataSlice';

interface RangePropsIF {
    importedTokens: Array<TokenIF>;
    provider: JsonRpcProvider;
    gasPriceinGwei: string;
    lastBlockNumber: number;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    poolPriceDisplay: string;
    poolPriceNonDisplay: number;
    tokenABalance: string;
    tokenBBalance: string;
    tokenAAllowance: string;
    setRecheckTokenAApproval: React.Dispatch<React.SetStateAction<boolean>>;
    tokenBAllowance: string;
    setRecheckTokenBApproval: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Range(props: RangePropsIF) {
    const {
        importedTokens,
        provider,
        baseTokenAddress,
        quoteTokenAddress,
        poolPriceDisplay,
        poolPriceNonDisplay,
        tokenABalance,
        tokenBBalance,
        tokenAAllowance,
        setRecheckTokenAApproval,
        tokenBAllowance,
        setRecheckTokenBApproval,
        gasPriceinGwei,
    } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const { save } = useNewMoralisObject('UserPosition');

    const dispatch = useAppDispatch();

    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] = useState(false);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] = useState(false);
    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState('');
    const {
        Moralis,
        user,
        account,
        chainId,
        isAuthenticated,
        isWeb3Enabled,
        authenticate,
        enableWeb3,
    } = useMoralis();

    const { tradeData } = useTradeData();

    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };
    const isAdvancedModeActive = tradeData.advancedMode;

    const denominationsInBase = tradeData.isDenomBase;
    const isTokenAPrimary = tradeData.isTokenAPrimaryRange;

    const [rangeAllowed, setRangeAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

    const isTokenABase = tokenPair?.dataTokenA.address === baseTokenAddress;

    const maxSlippage = 5;

    const poolWeiPriceLowLimit = poolPriceNonDisplay * (1 - maxSlippage / 100);
    const poolWeiPriceHighLimit = poolPriceNonDisplay * (1 + maxSlippage / 100);

    const signer = provider?.getSigner();
    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const isTokenAEth = tokenA.address === contractAddresses.ZERO_ADDR;
    const isTokenBEth = tokenB.address === contractAddresses.ZERO_ADDR;

    const qtyIsBase = (isTokenAPrimary && isTokenABase) || (!isTokenAPrimary && !isTokenABase);

    const [rangeButtonErrorMessage, setRangeButtonErrorMessage] =
        useState<string>('Enter an Amount');

    const roundDownTick = (lowTick: number, nTicksGrid: number = GRID_SIZE_DFLT) => {
        const tickGrid = Math.floor(rangeLowTick / nTicksGrid) * nTicksGrid;
        const horizon = Math.floor(MIN_TICK / nTicksGrid) * nTicksGrid;
        return Math.max(tickGrid, horizon);
    };

    const roundUpTick = (highTick: number, nTicksGrid: number = GRID_SIZE_DFLT) => {
        const tickGrid = Math.ceil(highTick / nTicksGrid) * nTicksGrid;
        const horizon = Math.ceil(MAX_TICK / nTicksGrid) * nTicksGrid;
        return Math.min(tickGrid, horizon);
    };

    const currentPoolPriceTick = Math.log(poolPriceNonDisplay) / Math.log(1.0001);
    const [rangeWidthPercentage, setRangeWidthPercentage] = useState<number>(100);

    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');

    const defaultMinPriceDifferencePercentage = -15;
    const defaultMaxPriceDifferencePercentage = 15;

    const minPriceNonDisplay = useMemo(
        () =>
            denominationsInBase
                ? fromDisplayPrice(
                      1 / parseFloat(maxPriceInputString),
                      baseTokenDecimals,
                      quoteTokenDecimals,
                  )
                : fromDisplayPrice(
                      parseFloat(minPriceInputString),
                      baseTokenDecimals,
                      quoteTokenDecimals,
                  ),
        [
            denominationsInBase,
            maxPriceInputString,
            minPriceInputString,
            baseTokenDecimals,
            quoteTokenDecimals,
        ],
    );

    const maxPriceNonDisplay = useMemo(
        () =>
            denominationsInBase
                ? fromDisplayPrice(
                      1 / parseFloat(minPriceInputString),
                      baseTokenDecimals,
                      quoteTokenDecimals,
                  )
                : fromDisplayPrice(
                      parseFloat(maxPriceInputString),
                      baseTokenDecimals,
                      quoteTokenDecimals,
                  ),
        [
            denominationsInBase,
            maxPriceInputString,
            minPriceInputString,
            baseTokenDecimals,
            quoteTokenDecimals,
        ],
    );

    // useEffect(() => {
    //     console.log({ maxPriceNonDisplay });
    // }, [maxPriceNonDisplay]);

    // useEffect(() => {
    //     console.log({ minPriceNonDisplay });
    // }, [minPriceNonDisplay]);

    // useEffect(() => {
    //     console.log({ minPriceInputString });
    // }, [minPriceInputString]);

    // useEffect(() => {
    //     console.log({ maxPriceInputString });
    // }, [maxPriceInputString]);

    // useEffect(() => {
    //     console.log({ denominationsInBase });
    // }, [denominationsInBase]);

    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] = useState(
        defaultMinPriceDifferencePercentage,
    );
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] = useState(
        defaultMaxPriceDifferencePercentage,
    );

    // let rangeLowTick: number, rangeHighTick: number, isAmbient: boolean;

    const [isAmbient, setIsAmbient] = useState(false);

    const [rangeLowTick, setRangeLowTick] = useState(tradeData.advancedLowTick);
    const [rangeHighTick, setRangeHighTick] = useState(tradeData.advancedHighTick);

    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] = useState(false);
    const lowBoundOnBlur = () => setRangeLowBoundFieldBlurred(true);

    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] = useState(false);
    const highBoundOnBlur = () => setRangeHighBoundFieldBlurred(true);

    useEffect(() => {
        console.log({ currentPoolPriceTick });
    }, [currentPoolPriceTick]);

    // const handleLowRangeDisplayUpdate = () => {};

    // const handleHighRangeDisplayUpdate = () => {};

    useEffect(() => {
        if (!isAdvancedModeActive) {
            setIsAmbient(rangeWidthPercentage === 100);

            const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
            const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

            setRangeLowTick(lowTick);
            setRangeHighTick(highTick);
        } else {
            setIsAmbient(false);
            // const currentPoolPriceTick = Math.log(poolPriceNonDisplay) / Math.log(1.0001);
            if (isNaN(minPriceNonDisplay)) {
                const lowTick = currentPoolPriceTick + defaultMinPriceDifferencePercentage * 100;
                setRangeLowTick(lowTick);
                dispatch(setAdvancedLowTick(lowTick));
            } else {
                const lowTick = Math.log(minPriceNonDisplay) / Math.log(1.0001);
                setRangeLowTick(lowTick);
                dispatch(setAdvancedLowTick(lowTick));
                const geometricDifferencePercentage = truncateDecimals(
                    (lowTick - currentPoolPriceTick) / 100,
                    2,
                );

                denominationsInBase
                    ? setMaxPriceDifferencePercentage(-geometricDifferencePercentage)
                    : setMaxPriceDifferencePercentage(geometricDifferencePercentage);
                // maxPriceDifferencePercentage = geometricDifferencePercentage;
            }
            if (isNaN(maxPriceNonDisplay)) {
                const highTick = currentPoolPriceTick + defaultMaxPriceDifferencePercentage * 100;
                setRangeHighTick(highTick);
                dispatch(setAdvancedHighTick(highTick));
            } else {
                const highTick = Math.log(maxPriceNonDisplay) / Math.log(1.0001);
                setRangeHighTick(highTick);
                dispatch(setAdvancedHighTick(highTick));
                const geometricDifferencePercentage = truncateDecimals(
                    (highTick - currentPoolPriceTick) / 100,
                    2,
                );
                denominationsInBase
                    ? setMinPriceDifferencePercentage(-geometricDifferencePercentage)
                    : setMinPriceDifferencePercentage(geometricDifferencePercentage);
                // minPriceDifferencePercentage = geometricDifferencePercentage;
            }
        }
    }, [
        rangeWidthPercentage,
        currentPoolPriceTick,
        isAdvancedModeActive,
        // minPriceNonDisplay,
        // maxPriceNonDisplay,
        defaultMinPriceDifferencePercentage,
        defaultMaxPriceDifferencePercentage,
        rangeLowBoundFieldBlurred,
        rangeHighBoundFieldBlurred,
    ]);

    const roundedLowTick = roundDownTick(rangeLowTick);

    const roundedHighTick = roundUpTick(rangeHighTick);
    useEffect(() => {
        console.log({ roundedLowTick });
    }, [roundedLowTick]);

    useEffect(() => {
        console.log({ roundedHighTick });
    }, [roundedHighTick]);

    const rangeLowBoundNonDisplayPrice = tickToPrice(roundedLowTick);

    useEffect(() => {
        console.log({ rangeLowBoundNonDisplayPrice });
    }, [rangeLowBoundNonDisplayPrice]);

    const rangeHighBoundNonDisplayPrice = tickToPrice(roundedHighTick);

    useEffect(() => {
        console.log({ rangeHighBoundNonDisplayPrice });
    }, [rangeHighBoundNonDisplayPrice]);

    const rangeLowBoundDisplayPrice = useMemo(
        () =>
            denominationsInBase
                ? 1 /
                  toDisplayPrice(
                      rangeHighBoundNonDisplayPrice,
                      baseTokenDecimals,
                      quoteTokenDecimals,
                      false,
                  )
                : toDisplayPrice(
                      rangeLowBoundNonDisplayPrice,
                      baseTokenDecimals,
                      quoteTokenDecimals,
                      false,
                  ),
        [
            denominationsInBase,
            rangeHighBoundNonDisplayPrice,
            rangeLowBoundNonDisplayPrice,
            baseTokenDecimals,
            quoteTokenDecimals,
        ],
    );

    const rangeHighBoundDisplayPrice = useMemo(
        () =>
            denominationsInBase
                ? 1 /
                  toDisplayPrice(
                      rangeLowBoundNonDisplayPrice,
                      baseTokenDecimals,
                      quoteTokenDecimals,
                      false,
                  )
                : toDisplayPrice(
                      rangeHighBoundNonDisplayPrice,
                      baseTokenDecimals,
                      quoteTokenDecimals,
                      false,
                  ),
        [
            denominationsInBase,
            rangeHighBoundNonDisplayPrice,
            rangeLowBoundNonDisplayPrice,
            baseTokenDecimals,
            quoteTokenDecimals,
        ],
    );

    const [initializationComplete, setInitializationComplete] = useState(false);

    useEffect(() => {
        if (isAdvancedModeActive) {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeLowBoundDisplayField) {
                // console.log(rangeLowBoundDisplayField.value);
                setInitializationComplete(false);
            }
            const rangeHighBoundDisplayField = document.getElementById(
                'max-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeHighBoundDisplayField) {
                setInitializationComplete(false);
            }
        }
    }, [isAdvancedModeActive]);

    // initialize based on MinPriceDifferencePercentage & MaxPriceDifferencePercentage
    useEffect(() => {
        if (!initializationComplete) {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;

            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value = rangeLowBoundDisplayPrice.toString();
                const rangeHighBoundDisplayField = document.getElementById(
                    'max-price-input-quantity',
                ) as HTMLInputElement;

                if (rangeHighBoundDisplayField) {
                    rangeHighBoundDisplayField.value = rangeHighBoundDisplayPrice.toString();
                    setInitializationComplete(true);
                } else {
                    console.log('high bound field not found');
                }
            } else {
                console.log('low bound field not found');
            }
        }
    }, [rangeLowBoundDisplayPrice, rangeHighBoundDisplayPrice, initializationComplete]);

    useEffect(() => {
        const rangeLowBoundDisplayPrice = denominationsInBase
            ? 1 /
              toDisplayPrice(
                  rangeHighBoundNonDisplayPrice,
                  baseTokenDecimals,
                  quoteTokenDecimals,
                  false,
              )
            : toDisplayPrice(
                  rangeLowBoundNonDisplayPrice,
                  baseTokenDecimals,
                  quoteTokenDecimals,
                  false,
              );

        if (rangeLowBoundFieldBlurred) {
            console.log('low bound blurred');
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value = rangeLowBoundDisplayPrice.toString();
            } else {
                console.log('low bound field not found');
            }
            setRangeLowBoundFieldBlurred(false);
        }
    }, [rangeLowBoundFieldBlurred]);

    useEffect(() => {
        if (rangeHighBoundFieldBlurred) {
            console.log('high bound blurred');
            const rangeHighBoundDisplayField = document.getElementById(
                'max-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeHighBoundDisplayField) {
                rangeHighBoundDisplayField.value = rangeHighBoundDisplayPrice.toString();
            } else {
                console.log('high bound field not found');
            }
            setRangeHighBoundFieldBlurred(false);
        }
    }, [rangeHighBoundFieldBlurred]);

    const depositSkew = concDepositSkew(
        poolPriceNonDisplay,
        rangeLowBoundNonDisplayPrice,
        rangeHighBoundNonDisplayPrice,
    );

    let maxPriceDisplay: string;

    if (isAmbient) {
        maxPriceDisplay = 'Infinity';
    } else {
        maxPriceDisplay = truncateDecimals(rangeHighBoundDisplayPrice, 4).toString();

        // maxPriceDisplay = !denominationsInBase
        //     ? truncateDecimals(rangeHighBoundDisplayPrice, 4).toString()
        //     : truncateDecimals(1 / rangeLowBoundDisplayPrice, 4).toString();
    }

    let minPriceDisplay: string;
    const apyPercentage: number = 100 - rangeWidthPercentage + 10;

    const daysInRangeEstimation: number = isAmbient ? 365 : rangeWidthPercentage;

    if (rangeWidthPercentage === 100) {
        minPriceDisplay = '0';
    } else {
        minPriceDisplay = truncateDecimals(rangeLowBoundDisplayPrice, 4).toString();

        // minPriceDisplay = !denominationsInBase
        //     ? truncateDecimals(rangeLowBoundDisplayPrice, 4).toString()
        //     : truncateDecimals(1 / rangeHighBoundDisplayPrice, 4).toString();
    }

    const truncatedTokenABalance = truncateDecimals(parseFloat(tokenABalance), 4).toString();
    const truncatedTokenBBalance = truncateDecimals(parseFloat(tokenBBalance), 4).toString();

    const sendTransaction = async () => {
        console.log({ isTokenAPrimary });

        let liquidity: BigNumber;
        let tx;
        if (isTokenAPrimary) {
            // console.log({ tokenAInputQty });
            // console.log({ tokenADecimals });
            // console.log({ isTokenABase });
            // console.log({ baseTokenAddress });
            // console.log({ quoteTokenAddress });
            // console.log({ isTokenAEth });
            // console.log({ isTokenBEth });
            const tokenAQtyNonDisplay = fromDisplayQty(tokenAInputQty, tokenADecimals);
            if (isTokenABase) {
                liquidity = liquidityForBaseQty(poolPriceNonDisplay, tokenAQtyNonDisplay);
            } else {
                liquidity = liquidityForQuoteQty(poolPriceNonDisplay, tokenAQtyNonDisplay);
            }
            if (signer) {
                if (isAmbient) {
                    tx = await sendAmbientMint(
                        baseTokenAddress,
                        quoteTokenAddress,
                        liquidity,
                        poolWeiPriceLowLimit,
                        poolWeiPriceHighLimit,
                        isTokenAEth
                            ? parseFloat(tokenAInputQty)
                            : isTokenBEth
                            ? parseFloat(tokenBInputQty)
                            : 0,
                        signer,
                    );
                } else {
                    console.log({ tokenAInputQty });
                    console.log({ tokenADecimals });
                    tx = await sendConcMint(
                        baseTokenAddress,
                        quoteTokenAddress,
                        poolPriceNonDisplay,
                        roundedLowTick, // tickLower,
                        roundedHighTick, // tickHigher,
                        tokenAInputQty,
                        qtyIsBase,
                        poolWeiPriceLowLimit,
                        poolWeiPriceHighLimit,
                        isTokenAEth
                            ? parseFloat(tokenAInputQty)
                            : isTokenBEth
                            ? parseFloat(tokenBInputQty)
                            : 0,
                        signer,
                    );
                }
            }
        } else {
            // console.log({ tokenBInputQty });
            // console.log({ tokenBDecimals });
            // console.log({ isTokenABase });
            // console.log({ baseTokenAddress });
            // console.log({ quoteTokenAddress });
            // console.log({ isTokenAEth });
            // console.log({ isTokenBEth });
            const tokenBQtyNonDisplay = fromDisplayQty(tokenBInputQty, tokenBDecimals);
            if (!isTokenABase) {
                liquidity = liquidityForBaseQty(poolPriceNonDisplay, tokenBQtyNonDisplay);
            } else {
                liquidity = liquidityForQuoteQty(poolPriceNonDisplay, tokenBQtyNonDisplay);
            }
            if (signer) {
                if (isAmbient) {
                    tx = await sendAmbientMint(
                        baseTokenAddress,
                        quoteTokenAddress,
                        liquidity,
                        poolWeiPriceLowLimit,
                        poolWeiPriceHighLimit,
                        isTokenAEth
                            ? parseFloat(tokenAInputQty)
                            : isTokenBEth
                            ? parseFloat(tokenBInputQty)
                            : 0,
                        signer,
                    );
                } else {
                    console.log({ tokenBInputQty });
                    console.log({ tokenBDecimals });
                    tx = await sendConcMint(
                        baseTokenAddress,
                        quoteTokenAddress,
                        poolPriceNonDisplay,
                        roundedLowTick, // tickLower,
                        roundedHighTick, // tickHigher,
                        tokenBInputQty,
                        qtyIsBase,
                        poolWeiPriceLowLimit,
                        poolWeiPriceHighLimit,
                        isTokenAEth
                            ? parseFloat(tokenAInputQty)
                            : isTokenBEth
                            ? parseFloat(tokenBInputQty)
                            : 0,
                        signer,
                    );
                }
            }
        }
        if (tx) {
            let newTransactionHash = tx.hash;
            setNewRangeTransactionHash(newRangeTransactionHash);
            console.log({ newTransactionHash });
            let parsedReceipt;

            try {
                const receipt = await tx.wait();
                console.log({ receipt });
                parsedReceipt = await parseMintEthersReceipt(
                    provider,
                    receipt as EthersNativeReceipt,
                );
            } catch (e) {
                const error = e as TransactionError;
                if (isTransactionReplacedError(error)) {
                    // The user used "speed up" or something similar
                    // in their client, but we now have the updated info

                    // dispatch(removePendingTx(tx.hash));
                    console.log('repriced');
                    newTransactionHash = error.replacement.hash;
                    console.log({ newTransactionHash });

                    parsedReceipt = await parseMintEthersReceipt(
                        provider,
                        error.receipt as EthersNativeReceipt,
                    );
                }
            } finally {
                if (parsedReceipt)
                    handleParsedReceipt(Moralis, 'mint', newTransactionHash, parsedReceipt);
                let posHash;
                if (isAmbient) {
                    posHash = ambientPosSlot(
                        account as string,
                        baseTokenAddress,
                        quoteTokenAddress,
                    );
                } else {
                    posHash = concPosSlot(
                        account as string,
                        baseTokenAddress,
                        quoteTokenAddress,
                        roundedLowTick,
                        roundedHighTick,
                    );
                }
                const txHash = newTransactionHash;

                save({ txHash, posHash, user, account, chainId });
            }
        }
    };

    // TODO:  @Emily refactor this fragment to use the same denomination switch
    // TODO:  ... component used in the Market and Limit modules
    const denominationSwitch = (
        <div className={styles.denomination_switch_container}>
            <AdvancedModeToggle advancedMode={tradeData.advancedMode} />
            <DenominationSwitch
                tokenPair={tokenPair}
                displayForBase={tradeData.isDenomBase}
                poolPriceDisplay={parseFloat(poolPriceDisplay)}
                isTokenABase={isTokenABase}
                didUserFlipDenom={tradeData.didUserFlipDenom}
            />
        </div>
    );

    // props for <RangePriceInfo/> React element
    const rangePriceInfoProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: poolPriceDisplay,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        apyPercentage: apyPercentage,
        isTokenABase: isTokenABase,
        didUserFlipDenom: tradeData.didUserFlipDenom,
    };
    // props for <ConfirmRangeModal/> React element
    const rangeModalProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: poolPriceDisplay,
        denominationsInBase: denominationsInBase,
        isTokenABase: isTokenABase,
        isAmbient: isAmbient,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        sendTransaction: sendTransaction,
        closeModal: closeModal,
        newRangeTransactionHash: newRangeTransactionHash,
        setNewRangeTransactionHash: setNewRangeTransactionHash,
    };

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencyConverterProps = {
        poolPriceNonDisplay: poolPriceNonDisplay,
        chainId: chainId ?? '0x2a',
        tokensBank: importedTokens,
        tokenPair: tokenPair,
        isAmbient: isAmbient,
        isTokenABase: isTokenABase,
        depositSkew: depositSkew,
        // isTokenAPrimary: isTokenAPrimary,
        // setIsTokenAPrimary: setIsTokenAPrimary,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        truncatedTokenABalance: truncatedTokenABalance,
        truncatedTokenBBalance: truncatedTokenBBalance,
        setTokenAInputQty: setTokenAInputQty,
        setTokenBInputQty: setTokenBInputQty,
        setRangeButtonErrorMessage: setRangeButtonErrorMessage,
        setRangeAllowed: setRangeAllowed,
    };

    // props for <RangeWidth/> React element
    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
    };
    // props for <RangeExtraInfo/> React element
    const rangeExtraInfoProps = {
        tokenPair: tokenPair,
        gasPriceinGwei: gasPriceinGwei,
        poolPriceDisplay: Number(poolPriceDisplay),
        slippageTolerance: 0.05,
        liquidityProviderFee: 0.3,
        quoteTokenIsBuy: true,
        displayForBase: tradeData.isDenomBase,
        isTokenABase: isTokenABase,
        daysInRangeEstimation: daysInRangeEstimation,
    };

    const baseModeContent = (
        <>
            <RangeWidth {...rangeWidthProps} />
            <RangePriceInfo {...rangePriceInfoProps} />
            <RangeExtraInfo {...rangeExtraInfoProps} />
        </>
    );
    const advancedModeContent = (
        <>
            <MinMaxPrice
                minPricePercentage={minPriceDifferencePercentage}
                maxPricePercentage={maxPriceDifferencePercentage}
                minPriceInputString={minPriceInputString}
                maxPriceInputString={maxPriceInputString}
                setMinPriceInputString={setMinPriceInputString}
                setMaxPriceInputString={setMaxPriceInputString}
                isDenomBase={denominationsInBase}
                // highBoundOnFocus={highBoundOnFocus}
                highBoundOnBlur={highBoundOnBlur}
                lowBoundOnBlur={lowBoundOnBlur}
            />
            <AdvancedPriceInfo
                tokenPair={tokenPair}
                poolPriceDisplay={poolPriceDisplay}
                isDenomBase={denominationsInBase}
                isTokenABase={isTokenABase}
            />
            <RangeExtraInfo {...rangeExtraInfoProps} />
        </>
    );
    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Range Confirmation'>
            <ConfirmRangeModal {...rangeModalProps} />
        </Modal>
    ) : null;

    // login functionality
    const clickLogin = () => {
        console.log('user clicked Login');
        if (!isAuthenticated || !isWeb3Enabled) {
            authenticate({
                provider: 'metamask',
                signingMessage: 'Ambient API Authentication.',
                onSuccess: () => {
                    enableWeb3();
                },
                onError: () => {
                    authenticate({
                        provider: 'metamask',
                        signingMessage: 'Ambient API Authentication.',
                        onSuccess: () => {
                            enableWeb3;
                            // alert('🎉');
                        },
                    });
                },
            });
        }
    };

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    const isTokenBAllowanceSufficient = parseFloat(tokenBAllowance) >= parseFloat(tokenBInputQty);

    const loginButton = <Button title='Login' action={clickLogin} />;

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const approve = async (tokenAddress: string) => {
        // console.log(`allow button clicked for ${tokenAddress}`);
        setIsApprovalPending(true);
        let tx;
        try {
            tx = await approveToken(tokenAddress, signer);
        } catch (error) {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
            setRecheckTokenBApproval(true);
        }
        if (tx.hash) {
            console.log('approval transaction hash: ' + tx.hash);
            // setApprovalButtonText('Approval Pending...');
            // dispatch(setCurrentTxHash(tx.hash));
            // dispatch(addPendingTx(tx.hash));
        }

        try {
            const receipt = await tx.wait();
            // console.log({ receipt });
            if (receipt) {
                // console.log('approval receipt: ' + JSON.stringify(receipt));
                // setShouldRecheckApproval(true);
                // parseSwapEthersTxReceipt(receipt).then((val) => {
                //   val.conversionRateString = `${val.sellSymbol} Approval Successful`;
                //   dispatch(addApprovalReceipt(val));
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

    // const isAmountEntered = parseFloat(tokenAInputQty) > 0 && parseFloat(tokenBInputQty) > 0;

    return (
        <motion.section
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.3 } }}
            data-testid={'range'}
        >
            <ContentContainer isOnTradeRoute>
                <RangeHeader tokenPair={tokenPair} />
                {denominationSwitch}
                <DividerDark />
                <RangeCurrencyConverter {...rangeCurrencyConverterProps} />
                {isAdvancedModeActive ? advancedModeContent : baseModeContent}
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
                        rangeAllowed={rangeAllowed}
                        rangeButtonErrorMessage={rangeButtonErrorMessage}
                    />
                )}
            </ContentContainer>

            {confirmSwapModalOrNull}
        </motion.section>
    );
}
