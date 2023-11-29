// import { useContext  } from 'react'; // useEffect createContext
import { GCGO_OVERRIDE_URL } from '../constants';
import { getPositionData } from '../App/functions/getPositionData';
import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../utils/interfaces/exports';
import { Provider } from '@ethersproject/providers';
import { PositionIF, PositionServerIF } from '../utils/interfaces/PositionIF';
// import { TokenContext } from './TokenContext';

import {
    TokenPriceFn,
    // memoizeTokenPrice,
} from '../App/functions/fetchTokenPrice';
import {
    SpotPriceFn,
    // memoizeQuerySpotPrice,
} from '../App/functions/querySpotPrice';
import {
    FetchContractDetailsFn,
    // memoizeFetchContractDetails,
} from '../App/functions/fetchContractDetails';
import {
    FetchAddrFn,
    // memoizeFetchEnsAddress,
} from '../App/functions/fetchAddress';

// const { tokens } = useContext(TokenContext);

const fetchUserPositions = async ({
    user,
    chainId,
    gcUrl,
    ensResolution = true,
    annotate = true,
    omitKnockout = true,
    addValue = true,
}: {
    user: string;
    chainId: string;
    gcUrl: string;
    ensResolution?: boolean;
    annotate?: boolean;
    omitKnockout?: boolean;
    addValue?: boolean;
}): Promise<Response> => {
    const userPositionsCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_positions?'
        : gcUrl + '/user_positions?';

    return await fetch(
        userPositionsCacheEndpoint +
            new URLSearchParams({
                user: user,
                chainId: chainId,
                ensResolution: ensResolution.toString(),
                annotate: annotate.toString(),
                omitKnockout: omitKnockout.toString(),
                addValue: addValue.toString(),
            }),
    );
};

const decorateUserPositions = async ({
    userPositions,
    tokenUniv,
    crocEnv,
    provider,
    chainId,
    lastBlockNumber,
    cachedFetchTokenPrice,
    cachedQuerySpotPrice,
    cachedTokenDetails,
    cachedEnsResolve,
}: {
    userPositions: PositionIF[];
    tokenUniv: TokenIF[];
    crocEnv: CrocEnv;
    provider: Provider;
    chainId: string;
    lastBlockNumber: number;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    cachedEnsResolve: FetchAddrFn;
}) => {
    const skipENSFetch = true;
    return await Promise.all(
        userPositions.map(async (position: PositionServerIF) => {
            return getPositionData(
                position,
                tokenUniv,
                crocEnv,
                provider,
                chainId,
                lastBlockNumber,
                cachedFetchTokenPrice,
                cachedQuerySpotPrice,
                cachedTokenDetails,
                cachedEnsResolve,
                skipENSFetch,
            );
        }),
    );
};

const fetchDecorated = async ({
    user,
    chainId,
    gcUrl, // TODO, Handle in Data Layer
    ensResolution = true, // TODO, Handle in Data Layer
    annotate = true,
    omitKnockout = true,
    addValue = true,
    tokenUniv, // TODO, Handle in Data Layer
    crocEnv, // TODO, Handle in Data Layer
    provider, // TODO, Handle in Data Layer
    lastBlockNumber,
    cachedFetchTokenPrice, // TODO, Handle in Data Layer
    cachedQuerySpotPrice, // TODO, Handle in Data Layer
    cachedTokenDetails, // TODO, Handle in Data Layer
    cachedEnsResolve, // TODO, Handle in Data Layer
}: {
    user: string;
    chainId: string;
    gcUrl: string;
    ensResolution?: boolean;
    annotate?: boolean;
    omitKnockout?: boolean;
    addValue?: boolean;
    tokenUniv: TokenIF[];
    crocEnv: CrocEnv;
    provider: Provider;
    lastBlockNumber: number;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    cachedEnsResolve: FetchAddrFn;
}): Promise<PositionIF[]> => {
    const response = await fetchUserPositions({
        user,
        chainId,
        gcUrl,
        ensResolution,
        annotate,
        omitKnockout,
        addValue,
    });
    const json = await response?.json();
    const userPositions = json?.data;
    if (userPositions && crocEnv) {
        const updatedPositions = await decorateUserPositions({
            userPositions,
            tokenUniv,
            crocEnv,
            provider,
            chainId,
            lastBlockNumber,
            cachedFetchTokenPrice,
            cachedQuerySpotPrice,
            cachedTokenDetails,
            cachedEnsResolve,
        });
        return updatedPositions;
    }
    return [];
};

export const UserPositions = {
    fetch: fetchUserPositions,
    decorate: decorateUserPositions,
    fetchDecorated: fetchDecorated,
};
