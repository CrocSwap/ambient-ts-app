import { ERC20_ABI } from '@crocswap-libs/sdk';
import { Contract, ethers } from 'ethers';
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
    provider: ethers.Provider,
    address: string,
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

    const contract = new Contract(address, ERC20_ABI, provider);
    let decimals = 18;
    let totalSupply: bigint | undefined;
    let symbol: string | undefined;
    let name: string | undefined;

    try {
        // Await all three promises concurrently
        const [decimalsResult, totalSupplyResult, symbolResult, nameResult] =
            await Promise.all([
                contract.decimals().catch((error) => {
                    console.warn('Failed to fetch decimals:', {
                        address,
                        error,
                    });
                    return 18; // Default to 18 if it fails
                }),
                contract.totalSupply().catch((error) => {
                    console.warn('Failed to fetch totalSupply:', {
                        address,
                        error,
                    });
                    return undefined; // Handle undefined later if needed
                }),
                contract.symbol().catch(async (error) => {
                    console.warn('Failed to fetch symbol:', { address, error });

                    // Attempt to decode the symbol as bytes32 if the token is non-compliant
                    try {
                        return ethers.decodeBytes32String(error.data);
                    } catch (innerError) {
                        console.warn('Failed to decode symbol as bytes32:', {
                            address,
                            innerError,
                        });
                        return undefined; // Handle undefined later if needed
                    }
                }),
                contract.name().catch(async (error) => {
                    console.warn('Failed to fetch name:', { address, error });

                    // Attempt to decode the symbol as bytes32 if the token is non-compliant
                    try {
                        return ethers.decodeBytes32String(error.data);
                    } catch (innerError) {
                        console.warn('Failed to decode name as bytes32:', {
                            address,
                            innerError,
                        });
                        return undefined; // Handle undefined later if needed
                    }
                }),
            ]);

        // Assign the results
        decimals = Number(decimalsResult);
        totalSupply = totalSupplyResult;
        symbol = symbolResult;
        name = nameResult;
    } catch (error) {
        console.error('Error while fetching contract data:', {
            address,
            error,
        });
    }

    return {
        address: address,
        chainId: parseInt(_chainId),
        decimals: decimals,
        totalSupply: totalSupply,
        symbol: symbol || '',
        name: name || '',
        fromList: provenance,
        logoURI: '',
    };
};

export type FetchContractDetailsFn = (
    provider: ethers.Provider,
    address: string,
    chainId: string,
) => Promise<TokenIF | undefined>;

export function memoizeFetchContractDetails(): FetchContractDetailsFn {
    return memoizeProviderFn(fetchContractDetails) as FetchContractDetailsFn;
}
