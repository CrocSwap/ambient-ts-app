import { ParsedSwapReceipt, toFixedNumber } from '@crocswap-libs/sdk';
import getContractEthDiff from './EthDiff';
import Moralis from 'moralis/types';

export async function handleParsedReceipt(
    Moralis: Moralis,
    txType: string,
    txHash: string,
    parsedReceipt: ParsedSwapReceipt,
) {
    const ethDiff = await getContractEthDiff(Moralis, txHash);
    console.log({ ethDiff });

    console.log({ txType });

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
    if (txType === 'swap') {
        const conversionRateString = `Swapped ${parsedReceipt.sellQtyUnscaled} ${parsedReceipt.sellSymbol} for ${parsedReceipt.buyQtyUnscaled} ${parsedReceipt.buySymbol} at a rate of ${parsedReceipt.readableConversionRate} ${parsedReceipt.buySymbol} per ${parsedReceipt.sellSymbol}`;
        console.log({ conversionRateString });
    }
    // dispatch(addSwapReceipt(val));
    console.log({ parsedReceipt });
}
