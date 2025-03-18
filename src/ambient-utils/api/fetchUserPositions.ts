/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import {
    FetchContractDetailsFn,
    TokenPriceFn,
    fetchContractDetails,
    fetchTokenPrice,
} from '../api';
import {
    SpotPriceFn,
    filterLimitArray,
    getLimitOrderData,
    getPositionData,
    querySpotPrice,
} from '../dataLayer';
import {
    LimitOrderIF,
    LimitOrderServerIF,
    PoolIF,
    PositionIF,
    PositionServerIF,
    RecordType,
    TokenIF,
} from '../types';
// TODOJG move to types
interface RecordRequestIF {
    recordType: RecordType;
    user: string;
    chainId: string;
    gcUrl?: string;
    tokenUniv?: TokenIF[];
    crocEnv?: CrocEnv;
    provider?: Provider;
    analyticsPoolList?: PoolIF[] | undefined;
    cachedFetchTokenPrice?: TokenPriceFn;
    cachedQuerySpotPrice?: SpotPriceFn;
    cachedTokenDetails?: FetchContractDetailsFn;
}

const fetchUserPositions = async ({
    recordType,
    user,
    chainId,
    gcUrl,
}: {
    recordType: RecordType;
    user: string;
    chainId: string;
    gcUrl?: string;
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
                user: user.toLowerCase(),
                chainId: chainId.toLowerCase(),
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
    analyticsPoolList,
    cachedFetchTokenPrice,
    cachedQuerySpotPrice,
    cachedTokenDetails,
}: {
    recordType: RecordType;
    userPositions: PositionIF[] | LimitOrderIF[];
    tokenUniv: TokenIF[];
    crocEnv: CrocEnv;
    provider: Provider;
    chainId: string;
    analyticsPoolList?: PoolIF[] | undefined;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
}) => {
    const forceOnchainLiqUpdate = userPositions.length < 30; // temporary solution to fix batch RPC call failure when user has a lot of positions
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
                        analyticsPoolList,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                    );
                },
            ),
        ).then((updatedLimitOrderStates) => {
            if (updatedLimitOrderStates.length > 0) {
                const filteredData = filterLimitArray(updatedLimitOrderStates);
                return filteredData;
            } else {
                return [];
            }
        });
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
                        analyticsPoolList,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        forceOnchainLiqUpdate,
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
    tokenUniv,
    crocEnv,
    provider,
    analyticsPoolList,
    cachedFetchTokenPrice,
    cachedQuerySpotPrice,
    cachedTokenDetails,
}: RecordRequestIF): Promise<PositionIF[] | LimitOrderIF[]> => {
    const response = await fetchUserPositions({
        recordType,
        user,
        chainId,
        gcUrl,
    });
    const json = await response?.json();
    // Compromise between reusing RecordRequestIF and ensuring that these variables are safely assigned.
    const fieldsToCheck = {
        tokenUniv,
        crocEnv,
        provider,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
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
            analyticsPoolList,
            cachedFetchTokenPrice: cachedFetchTokenPrice!,
            cachedQuerySpotPrice: cachedQuerySpotPrice!,
            cachedTokenDetails: cachedTokenDetails!,
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
    tokenUniv,
    crocEnv,
    analyticsPoolList,
    cachedFetchTokenPrice,
    cachedQuerySpotPrice,
    cachedTokenDetails,
}: RecordRequestIF) => {
    cachedFetchTokenPrice =
        cachedFetchTokenPrice || (fetchTokenPrice as TokenPriceFn);
    cachedQuerySpotPrice =
        cachedQuerySpotPrice || (querySpotPrice as SpotPriceFn);
    cachedTokenDetails =
        cachedTokenDetails || (fetchContractDetails as FetchContractDetailsFn);

    return await fetchDecorated({
        // Query:
        recordType,
        user,

        // Session Information:
        chainId: chainId,
        gcUrl: gcUrl,
        provider: provider,
        tokenUniv: tokenUniv,
        crocEnv: crocEnv,
        analyticsPoolList,
        // Data Sources
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
    });
};

export const fetchRecords = fetchSimpleDecorated;
