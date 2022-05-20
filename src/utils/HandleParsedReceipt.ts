import { ParsedMintReceipt, ParsedSwapReceipt, toFixedNumber } from '@crocswap-libs/sdk';
import getContractEthDiff from './EthDiff';
import Moralis from 'moralis/types';

type parsedReceipt = ParsedSwapReceipt | ParsedMintReceipt;

export async function handleParsedReceipt(
    Moralis: Moralis,
    txType: string,
    txHash: string,
    parsedReceipt: parsedReceipt,
) {
    const ethDiff = await getContractEthDiff(Moralis, txHash);
    console.log({ ethDiff });
    console.log({ txType });

    if (txType == 'swap') {
        const parsedSwapReceipt = parsedReceipt as ParsedSwapReceipt;

        if (parsedSwapReceipt.buyQtyUnscaled === 0 && typeof ethDiff === 'string') {
            parsedSwapReceipt.buyQtyUnscaled = parseFloat(ethDiff?.substring(1));
        }
        if (parsedSwapReceipt.sellQtyUnscaled === 0 || parsedSwapReceipt.sellSymbol === 'ETH') {
            parsedSwapReceipt.sellQtyUnscaled = parseFloat(ethDiff);
        }
        const conversionRate = parsedSwapReceipt.sellQtyUnscaled / parsedSwapReceipt.buyQtyUnscaled;
        parsedSwapReceipt.readableConversionRate =
            1 / conversionRate < 2
                ? toFixedNumber(1 / conversionRate, 6)
                : toFixedNumber(1 / conversionRate, 2);
        const conversionRateString = `Swapped ${parsedSwapReceipt.sellQtyUnscaled} ${parsedSwapReceipt.sellSymbol} for ${parsedSwapReceipt.buyQtyUnscaled} ${parsedSwapReceipt.buySymbol} at a rate of ${parsedSwapReceipt.readableConversionRate} ${parsedSwapReceipt.buySymbol} per ${parsedSwapReceipt.sellSymbol}`;
        console.log({ conversionRateString });
        // dispatch(addSwapReceipt(val));
        console.log({ parsedSwapReceipt });
    } else if (txType === 'mint') {
        const parsedMintReceipt = parsedReceipt as ParsedMintReceipt;

        if (parsedMintReceipt.baseQtyUnscaled === 0 && typeof ethDiff === 'string') {
            parsedMintReceipt.baseQtyUnscaled = parseFloat(ethDiff?.substring(1));
        }
        // if (
        //     parsedMintReceipt.quoteQtyUnscaled === 0 ||
        //     parsedMintReceipt.baseTokenSymbol === 'ETH'
        // ) {
        //     parsedMintReceipt.quoteQtyUnscaled = parseFloat(ethDiff);
        // }
        // dispatch(addSwapReceipt(val));
        console.log({ parsedMintReceipt });
    }
}
