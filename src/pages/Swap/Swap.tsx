import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';
// import { Signer } from 'ethers';
import { useEffect, useState } from 'react';
import {
    contractAddresses,
    // getSpotPriceDisplay,
    getSpotPrice,
    getSpotPriceDisplay,
    fromDisplayQty,
    toDisplayQty,
    POOL_PRIMARY,
    sendSwap,
} from '@crocswap-libs/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
// import { BigNumber } from 'ethers';

interface ISwapProps {
    provider: JsonRpcProvider;
}

export default function Swap(props: ISwapProps) {
    const { provider } = props;

    // const sellTokenAddress = contractAddresses.ZERO_ADDR;
    const daiKovanAddress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';
    // const usdcKovanAddress = '0xb7a4F3E9097C08dA09517b5aB877F7a917224ede';
    // const buyTokenAddress = daiKovanAddress;

    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);

    useEffect(() => {
        (async () => {
            const spotPrice = await getSpotPrice(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                // usdcKovanAddress,
                POOL_PRIMARY,
                provider,
            );
            if (poolPriceNonDisplay !== spotPrice) {
                setPoolPriceNonDisplay(spotPrice);
            }
        })();
    }, []);

    useEffect(() => {
        console.log({ poolPriceNonDisplay });
    }, [poolPriceNonDisplay]);

    const [poolPriceDisplay, setPoolPriceDisplay] = useState(0);

    useEffect(() => {
        (async () => {
            const spotPriceDisplay = await getSpotPriceDisplay(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                // usdcKovanAddress,
                POOL_PRIMARY,
                provider,
            );
            if (poolPriceDisplay !== spotPriceDisplay) {
                setPoolPriceDisplay(spotPriceDisplay);
            }
        })();
    }, []);

    useEffect(() => {
        console.log({ poolPriceDisplay });
    }, [poolPriceDisplay]);

    const signer = provider?.getSigner();
    // useEffect(() => {
    //     console.log({ signer });
    // }, [signer]);

    async function initiateSwap() {
        const qty = fromDisplayQty('0.000001', 18);
        console.log({ qty });

        const displayQty = toDisplayQty(qty, 18);
        console.log({ displayQty });

        const ethValue = '0.000001';
        // const ethValue = fromDisplayQty('0.000001', 18);
        // console.log({ ethValue });

        // const ethValueDisplayQty = toDisplayQty(ethValue, 18);
        // console.log({ ethValueDisplayQty });

        // console.log(contractAddresses.ZERO_ADDR);
        // console.log({ daiKovanAddress });

        if (signer) {
            await sendSwap(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                true,
                qty,
                ethValue,
                5,
                POOL_PRIMARY,
                signer,
            );
        }
    }

    return (
        <main data-testid={'swap'}>
            <ContentContainer>
                <SwapHeader />
                <CurrencyConverter isLiq={false} />
                <ExtraInfo />
                <SwapButton onClickFn={initiateSwap} />
            </ContentContainer>
        </main>
    );
}
