import { ParsedMintReceipt, ParsedSwapReceipt } from '@crocswap-libs/sdk';
import getContractEthDiff from './EthDiff';
import Moralis from 'moralis/types';

import { unifiedReceipt } from '../utils/state/receiptDataSlice';

type parsedReceipt = ParsedSwapReceipt | ParsedMintReceipt;

export async function handleParsedReceipt(
    Moralis: Moralis,
    txType: string,
    txHash: string,
    parsedReceipt: parsedReceipt,
): Promise<unifiedReceipt> {
    let ethDiff = '';
    try {
        ethDiff = await getContractEthDiff(Moralis, txHash);
    } catch (error) {
        console.log({ error });
    }
    console.log({ ethDiff });
    console.log({ txType });

    let tokenAAddress = '';
    let tokenBAddress = '';
    let tokenASymbol = '';
    let tokenBSymbol = '';
    let lessExpensiveTokenSymbol = '';
    let moreExpensiveTokenSymbol = '';

    if (txType == 'swap') {
        const parsedSwapReceipt = parsedReceipt as ParsedSwapReceipt;
        console.log({ parsedSwapReceipt });

        if (parsedSwapReceipt.tokenBQtyUnscaled === 0 && typeof ethDiff === 'string') {
            parsedSwapReceipt.tokenBQtyUnscaled = parseFloat(ethDiff?.substring(1));
        }
        if (parsedSwapReceipt.tokenAQtyUnscaled === 0 || parsedSwapReceipt.tokenASymbol === 'ETH') {
            parsedSwapReceipt.tokenAQtyUnscaled = parseFloat(ethDiff);
        }
        // const conversionRate = parsedSwapReceipt.tokenAQtyUnscaled / parsedSwapReceipt.tokenBQtyUnscaled;
        // parsedSwapReceipt.readableConversionRate =
        //     1 / conversionRate < 2
        //         ? toFixedNumber(1 / conversionRate, 6)
        //         : toFixedNumber(1 / conversionRate, 2);
        // const conversionRateString = `Swapped ${parsedSwapReceipt.tokenAQtyUnscaled} ${parsedSwapReceipt.tokenASymbol} for ${parsedSwapReceipt.tokenBQtyUnscaled} ${parsedSwapReceipt.tokenBSymbol} at a rate of ${parsedSwapReceipt.readableConversionRate} ${parsedSwapReceipt.tokenBSymbol} per ${parsedSwapReceipt.tokenASymbol}`;
        // console.log({ conversionRateString });
        // dispatch(addSwapReceipt(val));
        console.log({ parsedSwapReceipt });
        tokenAAddress = parsedSwapReceipt.tokenAAddress;
        tokenBAddress = parsedSwapReceipt.tokenBAddress;
        tokenASymbol = parsedSwapReceipt.tokenASymbol;
        tokenBSymbol = parsedSwapReceipt.tokenBSymbol;

        lessExpensiveTokenSymbol = parsedSwapReceipt.lessExpensiveSymbol;
        moreExpensiveTokenSymbol = parsedSwapReceipt.moreExpensiveSymbol;
    } else if (txType === 'mint') {
        const parsedMintReceipt = parsedReceipt as ParsedMintReceipt;

        if (parsedMintReceipt.tokenAQtyUnscaled === 0 && typeof ethDiff === 'string') {
            parsedMintReceipt.tokenAQtyUnscaled = parseFloat(ethDiff?.substring(1));
        }
        tokenAAddress = parsedMintReceipt.baseTokenAddress;
        tokenBAddress = parsedMintReceipt.quoteTokenAddress;

        tokenASymbol = parsedMintReceipt.baseTokenSymbol;
        tokenBSymbol = parsedMintReceipt.quoteTokenSymbol;

        // if (
        //     parsedMintReceipt.tokenBQtyUnscaled === 0 ||
        //     parsedMintReceipt.baseTokenSymbol === 'ETH'
        // ) {
        //     parsedMintReceipt.tokenBQtyUnscaled = parseFloat(ethDiff);
        // }
        // dispatch(addSwapReceipt(val));
        console.log({ parsedMintReceipt });
    }
    return {
        receiptType: txType,
        txHash: txHash,
        isTxSuccess: parsedReceipt.status,
        blockNumber: parsedReceipt.blockNumber,
        unixTimestamp: parsedReceipt.timestamp,
        gasPriceInGwei: parsedReceipt.gasPriceInGwei,
        gasUsed: parsedReceipt.gasUsed,
        tokenAAddress: tokenAAddress,
        tokenBAddress: tokenBAddress,
        tokenAQtyUnscaled: parsedReceipt.tokenAQtyUnscaled,
        tokenAQtyScaled: 0,
        tokenBQtyUnscaled: parsedReceipt.tokenBQtyUnscaled,
        tokenBQtyScaled: 0,
        tokenASymbol: tokenASymbol,
        tokenBSymbol: tokenBSymbol,
        lessExpensiveTokenSymbol: lessExpensiveTokenSymbol,
        moreExpensiveTokenSymbol: moreExpensiveTokenSymbol,
        readableConversionRate: 0,
    };
}
