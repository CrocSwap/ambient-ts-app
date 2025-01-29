// import{ USE_MOCK_POSITION_REWARDS_DATA } from '../constants';
// import{ getFormattedNumber } from '../dataLayer';

import {
    BlastPositionGoldServerIF,
    BlastPositionPointsServerIF,
    BlastRewardsDataIF,
    PositionIF,
} from '../types';

interface argsIF {
    position: PositionIF;
}

function mapPositionRewardsResponseToPositionRewards(
    positionPoints: BlastPositionPointsServerIF,
    positionGold: BlastPositionGoldServerIF,
): BlastRewardsDataIF {
    const res = {
        points: Math.floor(positionPoints.points || 0).toLocaleString(),
        gold: (positionGold.points || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }),
    };
    return res as BlastRewardsDataIF;
}

export const fetchPositionRewardsData = async (args: argsIF) => {
    const { position } = args;

    const positionPointsEndpointBase =
        position.positionType === 'ambient'
            ? 'https://ambindexer.net/blastPoints/v1/byLP/bridge/ambient/'
            : 'https://ambindexer.net/blastPoints/v1/byLP/bridge/concentrated/';

    const positionPointsEndpoint =
        positionPointsEndpointBase +
        position.user +
        '/' +
        position.base +
        '/' +
        position.quote +
        '/' +
        position.poolIdx +
        '?';

    const positionGoldEndpointBase =
        position.positionType === 'ambient'
            ? 'https://ambindexer.net/blastPoints/v1/byLP/gold/ambient/'
            : 'https://ambindexer.net/blastPoints/v1/byLP/gold/concentrated/';

    const positionGoldEndpoint =
        positionGoldEndpointBase +
        position.user +
        '/' +
        position.base +
        '/' +
        position.quote +
        '/' +
        position.poolIdx +
        '?';

    const positionPointsFetchData = fetch(
        positionPointsEndpoint +
            new URLSearchParams({
                bidTick: `${position.bidTick}`,
                askTick: `${position.askTick}`,
            }),
    ).then((response) => response?.json());

    const positionGoldFetchData = fetch(
        positionGoldEndpoint +
            new URLSearchParams({
                bidTick: `${position.bidTick}`,
                askTick: `${position.askTick}`,
            }),
    ).then((response) => response?.json());

    const blastPositionData = mapPositionRewardsResponseToPositionRewards(
        await positionPointsFetchData,
        await positionGoldFetchData,
    );
    // .catch(console.error);
    return blastPositionData;
};
