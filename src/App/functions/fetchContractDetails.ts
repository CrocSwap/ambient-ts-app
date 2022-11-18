import { ERC20_ABI } from '@crocswap-libs/sdk';
import { Contract, ethers } from 'ethers';
import { memoizeProviderFn } from './memoizePromiseFn';

export interface ContractDetails {
    address: string;
    chain: string;
    decimals: number | undefined;
    symbol: string | undefined;
    name: string | undefined;
}

export const fetchContractDetails = async (
    provider: ethers.providers.Provider,
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
): Promise<ContractDetails> => {
    const contract = new Contract(address, ERC20_ABI, provider);

    let decimals,
        symbol,
        name = undefined;
    try {
        decimals = await contract.decimals();
        symbol = await contract.symbol();
        name = await contract.name();
    } catch (error) {
        console.log({ error });
    }

    return { address: address, chain: _chainId, decimals: decimals, symbol: symbol, name: name };
};

type FetchContractDetailsFn = (
    provider: ethers.providers.Provider,
    address: string,
    chainId: string,
) => Promise<number | undefined>;

export function memoizeFetchContractDetails(): FetchContractDetailsFn {
    return memoizeProviderFn(fetchContractDetails) as FetchContractDetailsFn;
}
