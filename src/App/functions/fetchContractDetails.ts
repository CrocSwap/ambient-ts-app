import { ERC20_ABI } from '@crocswap-libs/sdk';
import { Contract, ethers } from 'ethers';
import { memoizeProviderFn } from './memoizePromiseFn';
import { TokenIF } from '../../utils/interfaces/exports';
import { ZERO_ADDRESS } from '../../constants';

export interface ContractDetails {
    address: string;
    chain: string;
    decimals: number | undefined;
    symbol: string | undefined;
    name: string | undefined;
}
/**
 * Fetches contract details for a given address using an Ethereum provider.
 *
 * @param provider The Ethereum provider to use for querying the blockchain.
 * @param address The address of the contract to fetch details for.
 * @param _chainId The ID of the chain to use. This parameter is unused.
 * @returns A Promise that resolves to a TokenIF object representing the contract details.
 */
export const fetchContractDetails = async (
    provider: ethers.providers.Provider,
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
): Promise<TokenIF> => {
    // If the address is the zero address, return details for the native Ether token

    if (address === ZERO_ADDRESS) {
        return {
            address: address,
            chainId: parseInt(_chainId),
            decimals: 18,
            symbol: 'ETH',
            name: 'Native Ether',
            fromList: 'ambient',
            logoURI: '',
        };
    }
    // Create a contract object using the given address and the ERC20 ABI

    const contract = new Contract(address, ERC20_ABI, provider);

    let decimals,
        symbol,
        name = undefined;
    // Attempt to fetch the decimals, symbol, and name of the contract

    try {
        decimals = await contract.decimals();
        symbol = await contract.symbol();
        name = await contract.name();
    } catch (error) {
        // Log a warning if an error occurs during the fetch

        console.warn({ error });
    }
    // Return the contract details as a TokenIF object

    return {
        address: address,
        chainId: parseInt(_chainId),
        decimals: decimals,
        symbol: symbol,
        name: name,
        fromList: 'custom_token',
        logoURI: '',
    };
};

type FetchContractDetailsFn = (
    provider: ethers.providers.Provider,
    address: string,
    chainId: string,
) => Promise<TokenIF | undefined>;

export function memoizeFetchContractDetails(): FetchContractDetailsFn {
    return memoizeProviderFn(fetchContractDetails) as FetchContractDetailsFn;
}
