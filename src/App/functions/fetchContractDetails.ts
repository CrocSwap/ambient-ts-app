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
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        };
    }

    const contract = new Contract(address, ERC20_ABI, provider);

    let decimals,
        symbol,
        name = undefined;

    try {
        decimals = await contract.decimals();
    } catch (error) {
        console.warn({ error });
    }

    try {
        symbol = await contract.symbol();
    } catch (error) {
        // attempt to parse data as bytes32 in case of a non-compliant token
        try {
            symbol = ethers.utils.parseBytes32String(error.data);
        } catch (error) {
            console.warn({ error });
        }
    }

    try {
        name = await contract.name();
    } catch (error) {
        try {
            name = ethers.utils.parseBytes32String(error.data);
        } catch (error) {
            console.warn({ error });
        }
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

export type FetchContractDetailsFn = (
    provider: ethers.providers.Provider,
    address: string,
    chainId: string,
) => Promise<TokenIF | undefined>;

export function memoizeFetchContractDetails(): FetchContractDetailsFn {
    return memoizeProviderFn(fetchContractDetails) as FetchContractDetailsFn;
}
