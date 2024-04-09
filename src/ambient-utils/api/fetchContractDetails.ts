import { ERC20_ABI } from '@crocswap-libs/sdk';
import { getContract, PublicClient, Address, hexToString } from 'viem';
import { memoizeProviderFn } from '../dataLayer/functions/memoizePromiseFn';
import { TokenIF, otherTokenSources } from '../types/token/TokenIF';
import { ZERO_ADDRESS } from '../constants';

export interface ContractDetails {
    address: string;
    chain: string;
    decimals: number | undefined;
    symbol: string | undefined;
    name: string | undefined;
}

// !important:  the `provenance` argument should be used to label what part of the app
// !important:  ... as the point of entry for a token fetched from on-chain data

export const fetchContractDetails = async (
    publicClient: PublicClient,
    address: Address,
    _chainId: string,
    provenance: otherTokenSources,
): Promise<TokenIF> => {
    // TODO:    update this logic to work on chains where the native token is not ETH
    if (address === ZERO_ADDRESS) {
        return {
            address: address,
            chainId: parseInt(_chainId),
            decimals: 18,
            symbol: 'ETH',
            name: 'Native Ether',
            fromList: 'ambient',
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        };
    }

    const contract = getContract({
        address,
        abi: ERC20_ABI,
        client: publicClient,
    });

    let decimals,
        symbol,
        name = undefined;

    try {
        decimals = (await contract.read.decimals()) as number;
    } catch (error) {
        console.warn({ error });
    }

    try {
        symbol = await contract.read.symbol();
        /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
        // attempt to parse data as bytes32 in case of a non-compliant token
        try {
            symbol = hexToString(error.data);
        } catch (error) {
            console.warn({ error });
        }
    }

    try {
        name = await contract.read.name();
        /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
        try {
            name = hexToString(error.data);
        } catch (error) {
            console.warn({ error });
        }
    }

    return {
        address: address,
        chainId: parseInt(_chainId),
        decimals: decimals as number,
        symbol: symbol as string,
        name: name as string,
        fromList: provenance,
        logoURI: '',
    };
};

export type FetchContractDetailsFn = (
    publicClient: PublicClient,
    address: string,
    chainId: string,
) => Promise<TokenIF | undefined>;

export function memoizeFetchContractDetails(): FetchContractDetailsFn {
    return memoizeProviderFn(fetchContractDetails) as FetchContractDetailsFn;
}
