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
import { GcgoFetcher } from '../../utils/gcgoFetcher';
// TODOJG move to types
interface RecordRequestIF {
    recordType: RecordType;
    user: string;
    chainId: string;
    gcgo: GcgoFetcher;
    tokenUniv?: TokenIF[];
    crocEnv?: CrocEnv;
    provider?: Provider;
    isTestnet: boolean;
    activePoolList?: PoolIF[] | undefined;
    cachedFetchTokenPrice?: TokenPriceFn;
    cachedQuerySpotPrice?: SpotPriceFn;
    cachedTokenDetails?: FetchContractDetailsFn;
}

const fetchUserPositions = async ({
    recordType,
    user,
    chainId,
    gcgo,
}: {
    recordType: RecordType;
    user: string;
    chainId: string;
    gcgo: GcgoFetcher;
}): Promise<any> => {
    let selectedEndpoint;
    if (recordType == RecordType.LimitOrder) {
        selectedEndpoint = '/user_limit_orders?';
    } else {
        // default to 'user_positions'
        selectedEndpoint = '/user_positions?';
    }
    const res = await gcgo.fetch(
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
    isTestnet,
    activePoolList,
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
    isTestnet: boolean;
    activePoolList?: PoolIF[] | undefined;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
}) => {
    const forceOnchainLiqUpdate = userPositions.length < 30 && !isTestnet; // temporary solution to fix batch RPC call failure when user has a lot of positions
    if (recordType == RecordType.LimitOrder) {
        const results = await Promise.allSettled(
            (userPositions as LimitOrderServerIF[]).map(
                (position: LimitOrderServerIF) => {
                    return getLimitOrderData(
                        position,
                        tokenUniv,
                        crocEnv,
                        provider,
                        chainId,
                        activePoolList,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                    );
                },
            ),
        );
        // Filter out failed results and return only successful ones
        const fulfilledResults = results
            .filter(
                (result): result is PromiseFulfilledResult<LimitOrderIF> =>
                    result.status === 'fulfilled',
            )
            .map((result) => result.value);

        return results.length > 0 ? filterLimitArray(fulfilledResults) : [];
    } else {
        const results = await Promise.allSettled(
            (userPositions as PositionServerIF[]).map(
                async (position: PositionServerIF) => {
                    return getPositionData(
                        position,
                        tokenUniv,
                        crocEnv,
                        provider,
                        chainId,
                        activePoolList,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        forceOnchainLiqUpdate,
                    );
                },
            ),
        );

        // Filter out failed results and return only successful ones
        return results
            .filter(
                (result): result is PromiseFulfilledResult<PositionIF> =>
                    result.status === 'fulfilled',
            )
            .map((result) => result.value);
    }
};

const fetchDecorated = async ({
    recordType,
    user,
    chainId,
    gcgo,
    tokenUniv,
    crocEnv,
    provider,
    activePoolList,
    isTestnet,
    cachedFetchTokenPrice,
    cachedQuerySpotPrice,
    cachedTokenDetails,
}: RecordRequestIF): Promise<PositionIF[] | LimitOrderIF[]> => {
    const userPositions = await fetchUserPositions({
        recordType,
        user,
        chainId,
        gcgo,
    });
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

    if (userPositions && crocEnv) {
        const updatedPositions = await decorateUserPositions({
            recordType: recordType,
            userPositions: userPositions,
            tokenUniv: tokenUniv!,
            crocEnv: crocEnv!,
            provider: provider!,
            chainId: chainId,
            activePoolList,
            isTestnet,
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
    gcgo,
    provider,
    tokenUniv,
    crocEnv,
    activePoolList,
    isTestnet,
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
        gcgo: gcgo,
        provider: provider,
        tokenUniv: tokenUniv,
        crocEnv: crocEnv,
        activePoolList,
        isTestnet,
        // Data Sources
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
    });
};

export const fetchRecords = fetchSimpleDecorated;
