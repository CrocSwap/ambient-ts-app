import Moralis from 'moralis';
import { ethers } from 'ethers';
import {
    contractAddresses,
    // getTokenBalanceDisplay,
    // sortBaseQuoteTokens,
    POOL_PRIMARY,
    // getSpotPrice,
    // getSpotPriceDisplay,
    // getTokenAllowance,
    QUERY_ABI,
    decodeCrocPrice,
    // toDisplayPrice,
} from '@crocswap-libs/sdk';

export const querySpotPrice = async (
    baseTokenAddress: string,
    quoteTokenAddress: string,
    chainId: string,
    lastBlockNumber: number,
) => {
    console.log({ chainId });
    const options = {
        chain: '0x2a' as '0x2a' | '0x5',
        address: contractAddresses.QUERY_ADDR,
        // eslint-disable-next-line camelcase
        function_name: 'queryPrice',
        abi: QUERY_ABI,
        block: lastBlockNumber,
        params: {
            base: baseTokenAddress,
            quote: quoteTokenAddress,
            poolIdx: POOL_PRIMARY,
        },
    };
    const crocPrice = await Moralis.Web3API.native.runContractFunction(options);
    const spotPrice = decodeCrocPrice(ethers.BigNumber.from(crocPrice));
    console.log({ spotPrice });
    return spotPrice;
};
