import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';
import { useEffect, useState } from 'react';
import {
    contractAddresses,
    getSpotPrice,
    getSpotPriceDisplay,
    POOL_PRIMARY,
    sendSwap,
    parseSwapEthersTxReceipt,
    toFixedNumber,
    EthersNativeReceipt,
    ParsedSwapReceipt,
} from '@crocswap-libs/sdk';

import { JsonRpcProvider } from '@ethersproject/providers';

import { useMoralis } from 'react-moralis';
// import { logger } from 'ethers';

import {
    // isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';

interface ISwapProps {
    provider: JsonRpcProvider;
}

export default function Swap(props: ISwapProps) {
    const { provider } = props;

    const { Moralis } = useMoralis();

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

    const getContractEthDiff = async (txHash: string) => {
        const params = { txHash: txHash };
        const contractEthDiff = await Moralis.Cloud.run('getContractEthDiff', params);
        return contractEthDiff;
    };

    async function handleParsedReceipt(txHash: string, parsedReceipt: ParsedSwapReceipt) {
        const ethDiff = await getContractEthDiff(txHash);
        console.log({ ethDiff });

        if (parsedReceipt.buyQtyUnscaled === 0 && typeof ethDiff === 'string') {
            parsedReceipt.buyQtyUnscaled = parseFloat(ethDiff?.substring(1));
        }
        if (parsedReceipt.sellQtyUnscaled === 0 || parsedReceipt.sellSymbol === 'ETH') {
            parsedReceipt.sellQtyUnscaled = parseFloat(ethDiff);
        }
        const conversionRate = parsedReceipt.sellQtyUnscaled / parsedReceipt.buyQtyUnscaled;
        parsedReceipt.readableConversionRate =
            1 / conversionRate < 2
                ? toFixedNumber(1 / conversionRate, 6)
                : toFixedNumber(1 / conversionRate, 2);
        parsedReceipt.conversionRateString = `Swapped ${parsedReceipt.sellQtyUnscaled} ${parsedReceipt.sellSymbol} for ${parsedReceipt.buyQtyUnscaled} ${parsedReceipt.buySymbol} at a rate of ${parsedReceipt.readableConversionRate} ${parsedReceipt.buySymbol} per ${parsedReceipt.sellSymbol}`;
        // dispatch(addSwapReceipt(val));
        console.log({ parsedReceipt });
    }

    async function initiateSwap() {
        const sellTokenAddress = contractAddresses.ZERO_ADDR;
        const buyTokenAddress = daiKovanAddress;
        const poolId = POOL_PRIMARY;
        const slippageTolerancePercentage = 5;
        const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
        const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;
        const qty = isSellTokenPrimary ? sellTokenQty : buyTokenQty;

        let ethValue = '0'; // Overwritten by a non-zero value when the user is selling ETH for another token

        // if the user is selling ETH and requesting an exact output quantity
        // then pad the amount of ETH sent to the contract by 2% (the remainder will be automatically returned)
        if (sellTokenAddress === contractAddresses.ZERO_ADDR) {
            const roundedUpEthValue = truncateDecimals(
                parseFloat(sellTokenQty) * 1.02,
                18,
            ).toString();
            isSellTokenPrimary ? (ethValue = sellTokenQty) : (ethValue = roundedUpEthValue);
        }

        if (signer) {
            const tx = await sendSwap(
                sellTokenAddress,
                buyTokenAddress,
                isSellTokenPrimary,
                qty,
                ethValue,
                slippageTolerancePercentage,
                poolId,
                signer,
            );

            let newTransactionHash = tx.hash;
            let parsedReceipt;

            console.log({ newTransactionHash });

            try {
                const receipt = await tx.wait();

                parsedReceipt = await parseSwapEthersTxReceipt(receipt as EthersNativeReceipt);
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

                    parsedReceipt = await parseSwapEthersTxReceipt(
                        error.receipt as EthersNativeReceipt,
                    );
                }
            }
            if (parsedReceipt) handleParsedReceipt(newTransactionHash, parsedReceipt);
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
