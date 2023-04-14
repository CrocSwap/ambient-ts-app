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

export const fetchContractDetails = async (
    provider: ethers.providers.Provider,
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
): Promise<TokenIF> => {
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

    const contract = new Contract(address, ERC20_ABI, provider);

    let decimals,
        symbol,
        name = undefined;

    try {
        decimals = await contract.decimals();
        symbol = await contract.symbol();
        name = await contract.name();
    } catch (error) {
        console.warn({ error });
    }

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
