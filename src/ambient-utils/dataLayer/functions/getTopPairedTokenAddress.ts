import { FetchTopPairedTokenFn } from '../../api';

export const getTopPairedTokenAddress = async (
    chainId: string,
    address: string,
    cachedFetchTopPairedToken: FetchTopPairedTokenFn,
): Promise<string | undefined> => {
    const response = await cachedFetchTopPairedToken(address, chainId);

    if (response) {
        return response;
    } else {
        return undefined;
    }
};
