import Moralis from 'moralis';
import { ethers } from 'ethers';
import {
    // contractAddresses,
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
    // console.log({ chainId });
    const options = {
        chain: chainId as '0x2a' | '0x5' | '0x1',
        address: '0x9ea4b2f9b1572ed3ac46b402d9ba9153821033c6',
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
    // console.log({ crocPrice });
    const spotPrice = decodeCrocPrice(ethers.BigNumber.from(crocPrice));
    // console.log({ spotPrice });
    return spotPrice;
};
