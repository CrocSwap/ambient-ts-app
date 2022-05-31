import { useEffect, useState } from 'react';
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import RangeButton from '../../../components/Trade/Range/RangeButton/RangeButton';
import RangeCurrencyConverter from '../../../components/Trade/Range/RangeCurrencyConverter/RangeCurrencyConverter';
import RangePriceInfo from '../../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeWidth from '../../../components/Trade/Range/RangeWidth/RangeWidth';
import styles from './Range.module.css';
import { motion } from 'framer-motion';

import {
    contractAddresses,
    sendAmbientMint,
    liquidityForBaseQty,
    fromDisplayQty,
    getSpotPrice,
    POOL_PRIMARY,
    sendConcMint,
    // toFixedNumber,
    parseMintEthersReceipt,
    EthersNativeReceipt,
    // toDisplayPrice,
    getSpotPriceDisplay,
    // ParsedSwapReceipt,
    // contractAddresses,
    ambientPosSlot,
    // concPosSlot,
    tickToPrice,
    toDisplayPrice,
    GRID_SIZE_DFLT,
    MIN_TICK,
    MAX_TICK,
} from '@crocswap-libs/sdk';

import { isTransactionReplacedError, TransactionError } from '../../../utils/TransactionError';

import { handleParsedReceipt } from '../../../utils/HandleParsedReceipt';

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import RangeHeader from '../../../components/Trade/Range/RangeHeader/RangeHeader';
import RangeDenominationSwitch from '../../../components/Trade/Range/RangeDenominationSwitch/RangeDenominationSwitch';
import AdvancedModeToggle from '../../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import AdvancedPriceInfo from '../../../components/Trade/Range/AdvancedModeComponents/AdvancedPriceInfo/AdvancedPriceInfo';

interface IRangeProps {
    provider: JsonRpcProvider;
    lastBlockNumber: number;
}

import { useMoralis, useNewMoralisObject } from 'react-moralis';

import truncateDecimals from '../../../utils/data/truncateDecimals';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';

export default function Range(props: IRangeProps) {
    const { save } = useNewMoralisObject('UserPosition');

    // const sellTokenAddress = contractAddresses.ZERO_ADDR;
    const daiKovanAddress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';
    // const buyTokenAddress = daiKovanAddress;

    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);
    const [poolPriceDisplay, setPoolPriceDisplay] = useState('');
    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(100);
    const [denominationsInBase, setDenominationsInBase] = useState(false);

    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] = useState(false);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] = useState(false);

    const { Moralis, user, account, chainId } = useMoralis();
    const [advancedMode, setAdvancedMode] = useState<boolean>(false);

    const isAmbient = rangeWidthPercentage === 100;

    const toggleAdvancedMode = () => setAdvancedMode(!advancedMode);

    useEffect(() => {
        (async () => {
            const spotPrice = await getSpotPrice(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                // usdcKovanAddress,
                POOL_PRIMARY,
                props.provider,
            );
            if (poolPriceNonDisplay !== spotPrice) {
                setPoolPriceNonDisplay(spotPrice);
            }
        })();
    }, [props.lastBlockNumber]);

    useEffect(() => {
        (async () => {
            const spotPriceDisplay = await getSpotPriceDisplay(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                // usdcKovanAddress,
                POOL_PRIMARY,
                props.provider,
            );
            const truncatedPriceWithDenonimationPreference = truncateDecimals(
                denominationsInBase ? spotPriceDisplay : 1 / spotPriceDisplay,
                2,
            ).toString();
            if (poolPriceDisplay !== truncatedPriceWithDenonimationPreference) {
                setPoolPriceDisplay(truncatedPriceWithDenonimationPreference);
            }
        })();
    }, [props.lastBlockNumber, denominationsInBase]);

    const maxSlippage = 5;

    const poolWeiPriceLowLimit = poolPriceNonDisplay * (1 - maxSlippage / 100);
    const poolWeiPriceHighLimit = poolPriceNonDisplay * (1 + maxSlippage / 100);

    const signer = props.provider?.getSigner();

    const baseTokenAddress = contractAddresses.ZERO_ADDR;
    const quoteTokenAddress = daiKovanAddress;

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
                        -70912, // tickLower,
                        -63936, // tickHigher,
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
                    console.log({ newTransactionHash });
                    let parsedReceipt;

                    try {
                        const receipt = await tx.wait();
                        console.log({ receipt });
                        parsedReceipt = await parseMintEthersReceipt(
                            props.provider,
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
                            // dispatch(setCurrentTxHash(replacementTxHash));
                            // dispatch(addPendingTx(replacementTxHash));

                            parsedReceipt = await parseMintEthersReceipt(
                                props.provider,
                                error.receipt as EthersNativeReceipt,
                            );
                        }
                    } finally {
                        if (parsedReceipt)
                            handleParsedReceipt(Moralis, 'mint', newTransactionHash, parsedReceipt);

                        const posHash = ambientPosSlot(
                            account as string,
                            baseTokenAddress,
                            quoteTokenAddress,
                        );
                        const txHash = newTransactionHash;

                        save({ txHash, posHash, user, account, chainId });
                    }
                }
            }
        }
    };

    const denominationSwitch = (
        <div className={styles.denomination_switch_container}>
            <AdvancedModeToggle
                toggleAdvancedMode={toggleAdvancedMode}
                advancedMode={advancedMode}
            />
            <RangeDenominationSwitch
                denominationsInBase={denominationsInBase}
                setDenominationsInBase={setDenominationsInBase}
            />
        </div>
    );

    const advancedModeContent = (
        <>
            <MinMaxPrice />
            <AdvancedPriceInfo />
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

    let maxPriceDisplay: string;

    if (isAmbient) {
        maxPriceDisplay = 'Infinity';
    } else {
        maxPriceDisplay = denominationsInBase
            ? truncateDecimals(rangeHighBoundDisplayPrice, 2).toString()
            : truncateDecimals(1 / rangeLowBoundDisplayPrice, 2).toString();
    }

    let minPriceDisplay: string;

    if (rangeWidthPercentage === 100) {
        minPriceDisplay = '0';
    } else {
        minPriceDisplay = denominationsInBase
            ? truncateDecimals(rangeLowBoundDisplayPrice, 2).toString()
            : truncateDecimals(1 / rangeHighBoundDisplayPrice, 2).toString();
    }

    // props for <RangePriceInfo/> React element
    const rangePriceInfoProps = {
        spotPriceDisplay: poolPriceDisplay,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
    };

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencyConverterProps = {
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
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

    return (
        <motion.section
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.3 } }}
            data-testid={'range'}
        >
            <ContentContainer isOnTradeRoute>
                <RangeHeader />
                {denominationSwitch}
                <DividerDark />
                <RangeCurrencyConverter {...rangeCurrencyConverterProps} />
                {advancedMode ? advancedModeContent : baseModeContent}
                <RangeButton onClickFn={sendTransaction} isAmountEntered={true} />
            </ContentContainer>
        </motion.section>
    );
}
