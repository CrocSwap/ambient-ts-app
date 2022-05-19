import { useEffect, useState } from 'react';
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import RangeButton from '../../../components/Trade/Range/RangeButton/RangeButton';
import RangeCurrencyConverter from '../../../components/Trade/Range/RangeCurrencyConverter/RangeCurrencyConverter';
import RangePriceInfo from '../../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeWidth from '../../../components/Trade/Range/RangeWidth/RangeWidth';
import styles from './Range.module.css';
import {
    contractAddresses,
    sendAmbientMint,
    liquidityForBaseQty,
    fromDisplayQty,
    getSpotPrice,
    POOL_PRIMARY,
    // sendConcMint,
    // parseSwapEthersTxReceipt,
    // contractAddresses,
    // ambientPosSlot,
    // concPosSlot,
} from '@crocswap-libs/sdk';

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import RangeHeader from '../../../components/Trade/Range/RangeHeader/RangeHeader';
import RangeDenominationSwitch from '../../../components/Trade/Range/RangeDenominationSwitch/RangeDenominationSwitch';
import AdvancedModeToggle from '../../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import { StylesContext } from '@material-ui/styles';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';

interface IRangeProps {
    provider: JsonRpcProvider;
}

export default function Range(props: IRangeProps) {
    // const sellTokenAddress = contractAddresses.ZERO_ADDR;
    const daiKovanAddress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';
    // const buyTokenAddress = daiKovanAddress;

    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);
    const [liquidityForBase, setLiquidityForBase] = useState(BigNumber.from(0));

    const [advancedMode, setAdvancedMode] = useState<boolean>(false);

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
    }, []);

    // useEffect(() => {
    //     console.log({ poolPriceNonDisplay });
    // }, [poolPriceNonDisplay]);

    const qtyNonDisplay = fromDisplayQty('.00001', 18);

    useEffect(() => {
        if (poolPriceNonDisplay) {
            const liquidity = liquidityForBaseQty(poolPriceNonDisplay, qtyNonDisplay);
            setLiquidityForBase(liquidity);
        }
    }, [poolPriceNonDisplay]);

    const maxSlippage = 5;

    const poolWeiPriceLowLimit = poolPriceNonDisplay * (1 - maxSlippage / 100);
    const poolWeiPriceHighLimit = poolPriceNonDisplay * (1 + maxSlippage / 100);

    const signer = props.provider?.getSigner();

    const sendTransaction = async () => {
        const tx = await sendAmbientMint(
            contractAddresses.ZERO_ADDR,
            daiKovanAddress,
            liquidityForBase,
            poolWeiPriceLowLimit,
            poolWeiPriceHighLimit,
            0.0001,
            signer,
        );
        const newTransactionHash = tx.hash;
        console.log({ newTransactionHash });
    };

    const denominationSwitch = (
        <div className={styles.denomination_switch_container}>
            <AdvancedModeToggle
                toggleAdvancedMode={toggleAdvancedMode}
                advancedMode={advancedMode}
            />
            <RangeDenominationSwitch />
        </div>
    );

    const advancedModeContent = <MinMaxPrice />;

    const basedModeContent = (
        <>
            <RangeWidth />
            <RangePriceInfo />
        </>
    );

    return (
        <section data-testid={'range'}>
            <ContentContainer isOnTradeRoute>
                <RangeHeader />
                {denominationSwitch}
                {/* <h1>{ advancedMode ? 'ADVANCED MODE' : 'NO ADVANCED MODE'}</h1> */}
                <RangeCurrencyConverter />
                <RangeWidth />
                <RangePriceInfo />
                <RangeButton onClickFn={sendTransaction} />
            </ContentContainer>
        </section>
    );
}
