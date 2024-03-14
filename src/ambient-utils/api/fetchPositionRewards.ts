// import { USE_MOCK_POSITION_REWARDS_DATA } from '../constants';
// import { getFormattedNumber } from '../dataLayer';
import { IS_LOCAL_ENV } from '../constants';

import {
    PositionIF,
    PositionRewardsDataIF,
    PositionRewardsServerIF,
} from '../types';

interface argsIF {
    position: PositionIF;
}

function mapPositionRewardsResponseToPositionRewards(
    positionRewards: PositionRewardsServerIF,
): PositionRewardsDataIF {
    const res = {
        'BLAST points': Math.floor(positionRewards.points).toLocaleString(),
        'BLAST gold': '...',
    };
    return res as PositionRewardsDataIF;
}

export const fetchPositionRewardsData = async (args: argsIF) => {
    const { position } = args;
    IS_LOCAL_ENV &&
        console.log(
            `Fetching Xp for positionId ${position.serverPositionId} for user ${position.user}...`,
        );

    const positionRewardsEndpointBase =
        position.positionType === 'ambient'
            ? 'https://ambindexer.net/blastPoints/v1/byLP/bridge/ambient/'
            : 'https://ambindexer.net/blastPoints/v1/byLP/bridge/concentrated/';

    const positionRewardsEndpoint =
        positionRewardsEndpointBase +
        position.user +
        '/' +
        position.base +
        '/' +
        position.quote +
        '/' +
        position.poolIdx +
        '?';

    const positionRewardsFetchData = fetch(
        positionRewardsEndpoint +
            new URLSearchParams({
                bidTick: `${position.bidTick}`,
                askTick: `${position.askTick}`,
            }),
    )
        .then((response) => response?.json())
        .then((parsedResponse) => {
            return mapPositionRewardsResponseToPositionRewards(parsedResponse);
        });
    // .catch(console.error);
    return positionRewardsFetchData;
};
