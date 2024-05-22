import { FetchTopPairedTokenFn } from '../../api';

export const getTopPairedTokenAddress = async (
    chainId: string,
    address: string,
    cachedFetchTopPairedToken: FetchTopPairedTokenFn,
): Promise<string | undefined> => {
    // Fire off network queries async simultaneous up-front
    const response = await cachedFetchTopPairedToken(address, chainId);

    if (!response) {
        return undefined;
    } else {
        const topPairedTokenAddress = response;
        return topPairedTokenAddress;
    }
};
