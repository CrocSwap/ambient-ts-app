import { GCGO_OVERRIDE_URL, IS_LOCAL_ENV } from '../constants';
import { getPositionData } from '../App/functions/getPositionData';

const fetchUserPositions = async ({
    user,
    chainId,
    gcUrl,
    ensResolution = 'true',
    annotate = 'true',
    omitKnockout = 'true',
    addValue = 'true',
}) => {
    const userPositionsCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_positions?'
        : gcUrl + '/user_positions?';
    return await fetch(
        userPositionsCacheEndpoint +
            new URLSearchParams({
                user: user,
                chainId: chainId,
                ensResolution: 'true',
                annotate: 'true',
                omitKnockout: 'true',
                addValue: 'true',
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
}) => {
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
            );
        }),
    );
};

const fetchDecoratedUserPositions = async ({
    user,
    chainId,
    gcUrl, // TODO, Handle in Data Layer
    ensResolution = 'true', // TODO, Handle in Data Layer
    annotate = 'true',
    omitKnockout = 'true',
    addValue = 'true',
    tokenUniv, // TODO, Handle in Data Layer
    crocEnv, // TODO, Handle in Data Layer
    provider, // TODO, Handle in Data Layer
    lastBlockNumber,
    cachedFetchTokenPrice, // TODO, Handle in Data Layer
    cachedQuerySpotPrice, // TODO, Handle in Data Layer
    cachedTokenDetails, // TODO, Handle in Data Layer
    cachedEnsResolve, // TODO, Handle in Data Layer
}) => {
    const response = await fetchUserPositions({ user, chainId, gcUrl });
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
    }
    return false;
};

export const UserPositions = {
    fetch: fetchUserPositions,
    decorate: decorateUserPositions,
    fetchDecorated: fetchDecoratedUserPositions,
};
