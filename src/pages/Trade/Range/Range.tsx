// START: Import React and Dongles
import { useEffect, useState } from 'react';
import { useMoralis, useNewMoralisObject } from 'react-moralis';
import { motion } from 'framer-motion';
import { BigNumber } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
    sendAmbientMint,
    liquidityForBaseQty,
    fromDisplayQty,
    getSpotPrice,
    POOL_PRIMARY,
    sendConcMint,
    parseMintEthersReceipt,
    EthersNativeReceipt,
    getSpotPriceDisplay,
    ambientPosSlot,
    tickToPrice,
    toDisplayPrice,
    concDepositSkew,
    GRID_SIZE_DFLT,
    MIN_TICK,
    MAX_TICK,
    concPosSlot,
    sortBaseQuoteTokens,
} from '@crocswap-libs/sdk';

// START: Import JSX Elements
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import RangeButton from '../../../components/Trade/Range/RangeButton/RangeButton';
import RangeCurrencyConverter from '../../../components/Trade/Range/RangeCurrencyConverter/RangeCurrencyConverter';
import RangePriceInfo from '../../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeWidth from '../../../components/Trade/Range/RangeWidth/RangeWidth';
import RangeHeader from '../../../components/Trade/Range/RangeHeader/RangeHeader';
import RangeDenominationSwitch from '../../../components/Trade/Range/RangeDenominationSwitch/RangeDenominationSwitch';
import AdvancedModeToggle from '../../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import AdvancedPriceInfo from '../../../components/Trade/Range/AdvancedModeComponents/AdvancedPriceInfo/AdvancedPriceInfo';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import Modal from '../../../components/Global/Modal/Modal';
import { useModal } from '../../../components/Global/Modal/useModal';

// START: Import Local Files
import styles from './Range.module.css';
import { isTransactionReplacedError, TransactionError } from '../../../utils/TransactionError';
import { handleParsedReceipt } from '../../../utils/HandleParsedReceipt';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import { findTokenByAddress } from '../../../utils/functions/processTokens';
import { kovanETH, kovanUSDC } from '../../../utils/data/defaultTokens';
import ConfirmRangeModal from '../../../components/Trade/Range/ConfirmRangeModal/ConfirmRangeModal';
import { TokenIF } from '../../../utils/interfaces/exports';
import { useTradeData } from '../Trade';

interface IRangeProps {
    importedTokens: Array<TokenIF>;
    provider: JsonRpcProvider;
    lastBlockNumber: number;
}

export default function Range(props: IRangeProps) {
    const { importedTokens, provider, lastBlockNumber } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const { save } = useNewMoralisObject('UserPosition');

    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);
    const [poolPriceDisplay, setPoolPriceDisplay] = useState('');
    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(100);
    const [denominationsInBase, setDenominationsInBase] = useState(false);

    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] = useState(false);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] = useState(false);
    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState('');
    const { Moralis, user, account, chainId } = useMoralis();

    const { tradeData } = useTradeData();

    const tokenPair = {
        dataTokenA: findTokenByAddress(tradeData.addressTokenA, importedTokens) ?? kovanETH,
        dataTokenB: findTokenByAddress(tradeData.addressTokenB, importedTokens) ?? kovanUSDC,
    };

    // const isTokenABase =
    //     getBaseTokenAddress(tradeData.addressTokenA, tradeData.addressTokenB) ===
    //     tradeData.addressTokenA;

    const isAmbient = rangeWidthPercentage === 100;

    const [baseTokenAddress, setBaseTokenAddress] = useState<string>('');
    const [quoteTokenAddress, setQuoteTokenAddress] = useState<string>('');

    const [isTokenABase, setIsTokenABase] = useState<boolean>(true);

    // useEffect to set baseTokenAddress and quoteTokenAddress when pair changes
    useEffect(() => {
        if (tokenPair.dataTokenA.address && tokenPair.dataTokenB.address) {
            const sortedTokens = sortBaseQuoteTokens(
                tokenPair.dataTokenA.address,
                tokenPair.dataTokenB.address,
            );
            setBaseTokenAddress(sortedTokens[0]);
            setQuoteTokenAddress(sortedTokens[1]);
            if (tokenPair.dataTokenA.address === sortedTokens[0]) {
                setIsTokenABase(true);
            } else {
                setIsTokenABase(false);
            }
        }
    }, [JSON.stringify(tokenPair)]);

    useEffect(() => {
        if (baseTokenAddress && quoteTokenAddress) {
            (async () => {
                const spotPrice = await getSpotPrice(
                    baseTokenAddress,
                    quoteTokenAddress,
                    POOL_PRIMARY,
                    provider,
                );
                if (poolPriceNonDisplay !== spotPrice) {
                    setPoolPriceNonDisplay(spotPrice);
                }
            })();
        }
    }, [lastBlockNumber, baseTokenAddress, quoteTokenAddress]);

    useEffect(() => {
        if (baseTokenAddress && quoteTokenAddress) {
            (async () => {
                const spotPriceDisplay = await getSpotPriceDisplay(
                    baseTokenAddress,
                    quoteTokenAddress,
                    POOL_PRIMARY,
                    provider,
                );
                const truncatedPriceWithDenonimationPreference = truncateDecimals(
                    denominationsInBase ? spotPriceDisplay : 1 / spotPriceDisplay,
                    4,
                ).toString();
                if (poolPriceDisplay !== truncatedPriceWithDenonimationPreference) {
                    setPoolPriceDisplay(truncatedPriceWithDenonimationPreference);
                }
            })();
        }
    }, [lastBlockNumber, denominationsInBase, baseTokenAddress, quoteTokenAddress]);

    const maxSlippage = 5;

    const poolWeiPriceLowLimit = poolPriceNonDisplay * (1 - maxSlippage / 100);
    const poolWeiPriceHighLimit = poolPriceNonDisplay * (1 + maxSlippage / 100);

    const signer = provider?.getSigner();

    const [isReversalInProgress, setIsReversalInProgress] = useState<boolean>(false);
    const [isTokenAPrimary, setIsTokenAPrimary] = useState<boolean>(false);

    useEffect(() => {
        console.log({ isReversalInProgress });
    }, [isReversalInProgress]);

    const sendTransaction = async () => {
        const tokenAQty = (document.getElementById('A-range-quantity') as HTMLInputElement)?.value;
        let tokenAQtyNonDisplay: BigNumber;
        let liquidity: BigNumber;
        if (tokenAQty) {
            tokenAQtyNonDisplay = fromDisplayQty(tokenAQty, 18);
            liquidity = liquidityForBaseQty(poolPriceNonDisplay, tokenAQtyNonDisplay);
            if (signer) {
                let tx;
                if (isAmbient) {
                    console.log({ liquidity });
                    console.log({ poolWeiPriceLowLimit });
                    console.log({ poolWeiPriceHighLimit });
                    console.log({ tokenAQty });
                    tx = await sendAmbientMint(
                        baseTokenAddress,
                        quoteTokenAddress,
                        liquidity,
                        poolWeiPriceLowLimit,
                        poolWeiPriceHighLimit,
                        parseFloat(tokenAQty),
                        signer,
                    );
                } else {
                    const qtyIsBase = true;
                    tx = await sendConcMint(
                        baseTokenAddress,
                        quoteTokenAddress,
                        poolPriceNonDisplay,
                        roundedLowTick, // tickLower,
                        roundedHighTick, // tickHigher,
                        tokenAQty, //  primaryField === 'A' ? tokenAQtyString : tokenBQtyString,
                        qtyIsBase,
                        poolWeiPriceLowLimit,
                        poolWeiPriceHighLimit,
                        parseFloat(tokenAQty),
                        signer,
                    );
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
            }
        }
    };

    // TODO:  @Emily refactor this fragment to use the same denomination switch
    // TODO:  ... component used in the Market and Limit modules
    const denominationSwitch = (
        <div className={styles.denomination_switch_container}>
            <AdvancedModeToggle advancedMode={tradeData.advancedMode} />
            <RangeDenominationSwitch
                tokenPair={tokenPair}
                denominationsInBase={denominationsInBase}
                setDenominationsInBase={setDenominationsInBase}
            />
        </div>
    );

    const advancedModeContent = (
        <>
            <MinMaxPrice />
            <AdvancedPriceInfo tokenPair={tokenPair} />
        </>
    );

    const currentPoolPriceTick = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    const rangeLowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const rangeHighTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const roundDownTick = (lowTick: number, nTicksGrid: number = GRID_SIZE_DFLT) => {
        const tickGrid = Math.floor(rangeLowTick / nTicksGrid) * nTicksGrid;
        const horizon = Math.floor(MIN_TICK / nTicksGrid) * nTicksGrid;
        return Math.max(tickGrid, horizon);
    };

    const roundedLowTick = roundDownTick(rangeLowTick);

    const roundUpTick = (highTick: number, nTicksGrid: number = GRID_SIZE_DFLT) => {
        const tickGrid = Math.ceil(highTick / nTicksGrid) * nTicksGrid;
        const horizon = Math.ceil(MAX_TICK / nTicksGrid) * nTicksGrid;
        return Math.min(tickGrid, horizon);
    };

    const roundedHighTick = roundUpTick(rangeHighTick);

    const rangeLowBoundNonDisplayPrice = tickToPrice(roundedLowTick);

    const rangeHighBoundNonDisplayPrice = tickToPrice(roundedHighTick);

    const rangeLowBoundDisplayPrice = toDisplayPrice(rangeLowBoundNonDisplayPrice, 18, 18, false);
    const rangeHighBoundDisplayPrice = toDisplayPrice(rangeHighBoundNonDisplayPrice, 18, 18, false);

    const depositSkew = concDepositSkew(
        poolPriceNonDisplay,
        rangeLowBoundNonDisplayPrice,
        rangeHighBoundNonDisplayPrice,
    );

    let maxPriceDisplay: string;

    if (isAmbient) {
        maxPriceDisplay = 'Infinity';
    } else {
        maxPriceDisplay = denominationsInBase
            ? truncateDecimals(rangeHighBoundDisplayPrice, 4).toString()
            : truncateDecimals(1 / rangeLowBoundDisplayPrice, 4).toString();
    }

    let minPriceDisplay: string;

    if (rangeWidthPercentage === 100) {
        minPriceDisplay = '0';
    } else {
        minPriceDisplay = denominationsInBase
            ? truncateDecimals(rangeLowBoundDisplayPrice, 4).toString()
            : truncateDecimals(1 / rangeHighBoundDisplayPrice, 4).toString();
    }

    // props for <RangePriceInfo/> React element
    const rangePriceInfoProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: poolPriceDisplay,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
    };
    // props for <ConfirmRangeModal/> React element
    const rangeModalProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: poolPriceDisplay,
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
        isTokenAPrimary: isTokenAPrimary,
        setIsTokenAPrimary: setIsTokenAPrimary,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        setIsReversalInProgress: setIsReversalInProgress,
        isReversalInProgress: isReversalInProgress,
    };

    // props for <RangeWidth/> React element
    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
    };

    const baseModeContent = (
        <>
            <RangeWidth {...rangeWidthProps} />
            <RangePriceInfo {...rangePriceInfoProps} />
        </>
    );
    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Range Confirmation'>
            <ConfirmRangeModal {...rangeModalProps} />
        </Modal>
    ) : null;

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
                {tradeData.advancedMode ? advancedModeContent : baseModeContent}
                <RangeButton onClickFn={openModal} isAmountEntered={true} />
            </ContentContainer>

            {confirmSwapModalOrNull}
        </motion.section>
    );
}
