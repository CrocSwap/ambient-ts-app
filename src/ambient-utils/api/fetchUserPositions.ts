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
    LimitOrderIF,
    LimitOrderServerIF,
} from '../types';
// /
// /
// /
import { fetchBlockNumber } from '../api/fetchBlockNumber';
import { ethers } from 'ethers';
import { tokenListURIs } from '../constants/tokenListURIs';
import fetchTokenList from '../api/fetchTokenList';
import { GCGO_ETHEREUM_URL } from '../constants/gcgo';

const fetchUserPositions = async ({
    urlTarget,
    user,
    chainId,
    gcUrl,
    ensResolution = true,
    annotate = true,
    omitKnockout = true,
    addValue = true,
}: {
    urlTarget: string;
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
    if (urlTarget == 'limit_order_states') {
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
    urlTarget,
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
    urlTarget: string;
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
    if (urlTarget == 'limit_order_states') {
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
        // default to 'user_positions'
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
    urlTarget,
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
    urlTarget: string;
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
        urlTarget,
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
            urlTarget,
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

const readFile = async (filePath: string): Promise<string> => {
    if (
        typeof process !== 'undefined' &&
        process.versions &&
        process.versions.node
    ) {
        const fs = await import('fs/promises');
        return fs.readFile(filePath, 'utf8');
    }
    throw new Error('Local file access is not supported in this environment');
};

const fetchSimpleDecorated = async ({
    urlTarget,
    user,
    chainId,
    gcUrl,
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
    urlTarget: string;
    user: string;
    chainId: string;
    gcUrl?: string;
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
    // Compute and set defaults only if necessary
    if (!gcUrl) {
        gcUrl = GCGO_ETHEREUM_URL;
    }

    if (!tokenUniv) {
        const tokenURI = tokenListURIs['ambient'];
        const defaultTokenUniv = await readFile('./public/' + tokenURI)
            .then((fileContents) => JSON.parse(fileContents))
            .then((response) => ({
                ...response,
                uri: './public/' + tokenURI,
                dateRetrieved: new Date().toISOString(),
                isUserImported: false,
            }));
        tokenUniv = defaultTokenUniv.tokens;
    }
    let provider = undefined;
    if (!crocEnv) {
        const infuraUrl =
            'https://mainnet.infura.io/v3/' + process.env.REACT_APP_INFURA_KEY;
        const defaultSigner = undefined;
        provider = new ethers.providers.JsonRpcProvider(infuraUrl);
        crocEnv = new CrocEnv(provider, defaultSigner);
    }
    if (!lastBlockNumber) {
        if (!crocEnv) {
            provider = new ethers.providers.JsonRpcProvider(infuraUrl);
        }
        lastBlockNumber = await fetchBlockNumber(provider.connection.url);
    }

    cachedFetchTokenPrice = cachedFetchTokenPrice || fetchTokenPrice;
    cachedQuerySpotPrice = cachedQuerySpotPrice || querySpotPrice;
    cachedTokenDetails = cachedTokenDetails || fetchContractDetails;
    cachedEnsResolve = cachedEnsResolve || fetchEnsAddress;

    return await fetchDecorated({
        urlTarget,
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

export const UserPositions = {
    fetchSimpleDecorated: fetchSimpleDecorated,
    fetch: fetchUserPositions,
    decorate: decorateUserPositions,
    fetchDecorated: fetchDecorated,
};

export const fetchDecoratedUserPositions = fetchDecorated;
export const fetchSimpleDecoratedUserPositions = fetchSimpleDecorated;
