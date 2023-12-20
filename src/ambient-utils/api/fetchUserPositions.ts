/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createNetworkSession } from '../constants/networks/createNetworkSession';
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
    RecordType,
} from '../types';
// TODOJG move to types
interface RecordRequestIF {
    recordType: RecordType;
    user: string;
    chainId: string;
    gcUrl?: string;
    ensResolution?: boolean;
    annotate?: boolean;
    omitKnockout?: boolean;
    addValue?: boolean;
    tokenUniv?: TokenIF[];
    crocEnv?: CrocEnv;
    provider?: Provider;
    lastBlockNumber?: number;
    cachedFetchTokenPrice?: TokenPriceFn;
    cachedQuerySpotPrice?: SpotPriceFn;
    cachedTokenDetails?: FetchContractDetailsFn;
    cachedEnsResolve?: FetchAddrFn;
}

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
    recordType: RecordType;
    user: string;
    chainId: string;
    gcUrl?: string;
    ensResolution?: boolean;
    annotate?: boolean;
    omitKnockout?: boolean;
    addValue?: boolean;
}): Promise<Response> => {
    let selectedEndpoint;
    if (recordType == RecordType.LimitOrder) {
        selectedEndpoint = gcUrl + '/user_limit_orders?';
    } else {
        // default to 'user_positions'
        selectedEndpoint = gcUrl + '/user_positions?';
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
    recordType: RecordType;
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
    if (recordType == RecordType.LimitOrder) {
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
    gcUrl,
    ensResolution = true,
    annotate = true,
    omitKnockout = true,
    addValue = true,
    tokenUniv,
    crocEnv,
    provider,
    lastBlockNumber,
    cachedFetchTokenPrice,
    cachedQuerySpotPrice,
    cachedTokenDetails,
    cachedEnsResolve,
}: RecordRequestIF): Promise<PositionIF[] | LimitOrderIF[]> => {
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
    // Compromise between reusing RecordRequestIF and ensuring that these variables are safely assigned.
    const fieldsToCheck = {
        tokenUniv,
        crocEnv,
        provider,
        lastBlockNumber,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    };
    for (const [key, value] of Object.entries(fieldsToCheck)) {
        if (value === undefined || value === null) {
            throw new Error(`The value for '${key}' is undefined or null.`);
        }
    }

    const userPositions = json?.data;
    if (userPositions && crocEnv) {
        const updatedPositions = await decorateUserPositions({
            recordType: recordType,
            userPositions: userPositions,
            tokenUniv: tokenUniv!,
            crocEnv: crocEnv!,
            provider: provider!,
            chainId: chainId,
            lastBlockNumber: lastBlockNumber!,
            cachedFetchTokenPrice: cachedFetchTokenPrice!,
            cachedQuerySpotPrice: cachedQuerySpotPrice!,
            cachedTokenDetails: cachedTokenDetails!,
            cachedEnsResolve: cachedEnsResolve!,
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
}: RecordRequestIF) => {
    const sess = await createNetworkSession({
        chainId: chainId,
        tokenUniv: tokenUniv,
        gcUrl: gcUrl,
        provider: provider,
        crocEnv: crocEnv,
        lastBlockNumber: lastBlockNumber,
    });

    cachedFetchTokenPrice =
        cachedFetchTokenPrice || (fetchTokenPrice as TokenPriceFn);
    cachedQuerySpotPrice =
        cachedQuerySpotPrice || (querySpotPrice as SpotPriceFn);
    cachedTokenDetails =
        cachedTokenDetails || (fetchContractDetails as FetchContractDetailsFn);
    cachedEnsResolve = cachedEnsResolve || (fetchEnsAddress as FetchAddrFn);

    return await fetchDecorated({
        // Query:
        recordType,
        user,

        // Session Information:
        chainId: sess.chainId,
        gcUrl: sess.gcUrl,
        provider: sess.provider,
        lastBlockNumber: sess.lastBlockNumber,
        tokenUniv: sess.tokenUniv,
        crocEnv: sess.crocEnv,

        // Control flags:
        ensResolution,
        annotate,
        omitKnockout,
        addValue,

        // Data Sources
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    });
};

export const fetchRecords = fetchSimpleDecorated;
