import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';
import { useEffect, useState } from 'react';
import {
    contractAddresses,
    // getSpotPriceDisplay,
    getSpotPrice,
    getSpotPriceDisplay,
    // fromDisplayQty,
    // toDisplayQty,
    POOL_PRIMARY,
    sendSwap,
} from '@crocswap-libs/sdk';
// import { BigNumber } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

interface ISwapProps {
    provider: JsonRpcProvider;
}

export default function Swap(props: ISwapProps) {
    const { provider } = props;

    const [isSellTokenPrimary, setIsSellTokenPrimary] = useState<boolean>(true);

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

    const truncateDecimals = (number: number, decimalPlaces: number) => {
        const truncatedNumber = number % 1 ? number.toFixed(decimalPlaces) : number;
        return truncatedNumber;
    };
    async function initiateSwap() {
        const sellTokenAddress = contractAddresses.ZERO_ADDR;
        const buyTokenAddress = daiKovanAddress;
        const poolId = POOL_PRIMARY;
        const slippageTolerancePercentage = 5;
        const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
        const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;
        const qty = isSellTokenPrimary ? sellTokenQty : buyTokenQty;

        let ethValue = '0'; // A non-zero value is set below when the user is selling ETH for another token

        // if ETH is the token being sold by the user
        // and the user is requesting an exact output quantity
        // pad the amount of ETH sent to the contract by 1% (the remainder will be automatically returned)
        if (sellTokenAddress === contractAddresses.ZERO_ADDR) {
            const roundedUpEthValue = truncateDecimals(
                parseFloat(sellTokenQty) * 1.01,
                18,
            ).toString();
            isSellTokenPrimary ? (ethValue = sellTokenQty) : (ethValue = roundedUpEthValue);
        }

        console.log({ isSellTokenPrimary });
        console.log({ ethValue });
        console.log({ sellTokenQty });
        console.log({ buyTokenQty });
        console.log({ qty });

        if (signer) {
            await sendSwap(
                sellTokenAddress,
                buyTokenAddress,
                isSellTokenPrimary,
                qty,
                ethValue,
                slippageTolerancePercentage,
                poolId,
                signer,
            );
        }
    }

    return (
        <main data-testid={'swap'}>
            <ContentContainer>
                <SwapHeader />
                <CurrencyConverter
                    isLiq={false}
                    poolPrice={poolPriceNonDisplay}
                    setIsSellTokenPrimary={setIsSellTokenPrimary}
                />
                <ExtraInfo />
                <SwapButton onClickFn={initiateSwap} />
            </ContentContainer>
        </main>
    );
}
