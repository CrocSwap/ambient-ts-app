import { GCGO_OVERRIDE_URL } from '../constants';
import {
    SpotPriceFn,
    getLimitOrderData,
    getPositionData,
    querySpotPrice,
} from '../dataLayer';
import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from '@ethersproject/providers';
import {
    TokenPriceFn,
    FetchContractDetailsFn,
    FetchAddrFn,
    fetchTokenPrice,
    fetchContractDetails,
    fetchEnsAddress,
} from '../api';
import {
    TokenIF,
    PositionIF,
    PositionServerIF,
    //    LimitOrderIF,
    LimitOrderServerIF,
} from '../types';
import { LimitOrderIF } from '../types/limitOrder/LimitOrderIF';

import { fetchBlockNumber } from '../api/fetchBlockNumber';
import { ethers } from 'ethers';
import { tokenListURIs } from '../constants/tokenListURIs';
import fetchTokenList from '../api/fetchTokenList';
import { GCGO_ETHEREUM_URL } from '../constants/gcgo';

const fetchUserPositions = async ({
    recordType,
    user,
    chainId,
    gcUrl,
    ensResolution = true,
    annotate = true,
    omitKnockout = true,
    addValue = true,
}: {
    recordType: PositionIF | LimitOrderIF;
    user: string;
    chainId: string;
    gcUrl?: string;
    ensResolution?: boolean;
    annotate?: boolean;
    omitKnockout?: boolean;
    addValue?: boolean;
}): Promise<Response> => {
    const userPositionsCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_positions?'
        : gcUrl + '/user_positions?';

    const userLimitOrderStatesCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_limit_orders?'
        : gcUrl + '/user_limit_orders?';

    let selectedEndpoint;
    if (recordType == LimitOrderIF) {
        selectedEndpoint = userLimitOrderStatesCacheEndpoint;
    } else {
        // default to 'user_positions'
        selectedEndpoint = userPositionsCacheEndpoint;
    }
    const res = await fetch(
        selectedEndpoint +
            new URLSearchParams({
                user: user,
                chainId: chainId,
                ensResolution: ensResolution.toString(),
                annotate: annotate.toString(),
                omitKnockout: omitKnockout.toString(),
                addValue: addValue.toString(),
            }),
    );
    return res;
};

const decorateUserPositions = async ({
    recordType,
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
    recordType: PositionIF | LimitOrderIF;
    userPositions: PositionIF[] | LimitOrderIF[];
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
    if (recordType == LimitOrderIF) {
        return await Promise.all(
            (userPositions as LimitOrderServerIF[]).map(
                (position: LimitOrderServerIF) => {
                    return getLimitOrderData(
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
                },
            ),
        );
    } else {
        // default to 'PositionIF'
        return await Promise.all(
            (userPositions as PositionServerIF[]).map(
                async (position: PositionServerIF) => {
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
                },
            ),
        );
    }
};

const fetchDecorated = async ({
    recordType,
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
    recordType: PositionIF | LimitOrderIF;
    user: string;
    chainId: string;
    gcUrl?: string;
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
}): Promise<PositionIF[] | LimitOrderIF[]> => {
    const response = await fetchUserPositions({
        recordType,
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
            recordType,
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

const fetchSimpleDecorated = async ({
    recordType,
    user,
    chainId,
    gcUrl,
    provider,
    ensResolution = true,
    annotate = true,
    omitKnockout = true,
    addValue = true,
    tokenUniv,
    crocEnv,
    lastBlockNumber,
    cachedFetchTokenPrice,
    cachedQuerySpotPrice,
    cachedTokenDetails,
    cachedEnsResolve,
}: {
    recordType: PositionIF | LimitOrderIF;
    user: string;
    chainId: string;
    gcUrl?: string;
    provider: Provider;
    ensResolution?: boolean;
    annotate?: boolean;
    omitKnockout?: boolean;
    addValue?: boolean;
    tokenUniv?: TokenIF[];
    crocEnv?: CrocEnv;
    lastBlockNumber?: number;
    cachedFetchTokenPrice?: TokenPriceFn;
    cachedQuerySpotPrice?: SpotPriceFn;
    cachedTokenDetails?: FetchContractDetailsFn;
    cachedEnsResolve?: FetchAddrFn;
}) => {
    if (!gcUrl) {
        gcUrl = GCGO_ETHEREUM_URL;
    }

    if (!tokenUniv) {
        // It is unclear the token universe should come from.
        // However, this problem should likely be addressed after V0 of the data layer
        throw new Error('UNIMPLEMENTED: NEED A METHOD TO GET TOKEN UNIVERSE');
    }
    if (!crocEnv) {
        const infuraUrl =
            'https://mainnet.infura.io/v3/' + process.env.REACT_APP_INFURA_KEY;
        const defaultSigner = undefined;
        if (!provider) {
            provider = new ethers.providers.JsonRpcProvider(infuraUrl);
        }
        crocEnv = new CrocEnv(provider, defaultSigner);
    }
    if (!lastBlockNumber) {
        if (!provider) {
            provider = new ethers.providers.JsonRpcProvider(infuraUrl);
        }
        lastBlockNumber = await fetchBlockNumber(provider.connection.url);
    }

    cachedFetchTokenPrice = cachedFetchTokenPrice || fetchTokenPrice;
    cachedQuerySpotPrice = cachedQuerySpotPrice || querySpotPrice;
    cachedTokenDetails = cachedTokenDetails || fetchContractDetails;
    cachedEnsResolve = cachedEnsResolve || fetchEnsAddress;

    return await fetchDecorated({
        recordType,
        user,
        chainId,
        gcUrl,
        provider,
        lastBlockNumber,
        tokenUniv,
        crocEnv,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    });
};

// TODO remove UserPositions section
export const UserPositions = {
    fetchSimpleDecorated: fetchSimpleDecorated,
    fetch: fetchUserPositions,
    decorate: decorateUserPositions,
    fetchDecorated: fetchDecorated,
};

// TODO remove UserPositions section
export const fetchDecoratedUserPositions = fetchDecorated;
export const fetchRecords = fetchSimpleDecorated;
