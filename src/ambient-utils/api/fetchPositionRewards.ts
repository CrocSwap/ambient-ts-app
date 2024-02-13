import { USE_MOCK_POSITION_REWARDS_DATA } from '../constants';
import { getFormattedNumber } from '../dataLayer';
import { PositionRewardsDataIF, PositionRewardsServerIF } from '../types';

interface argsIF {
    positionId: string;
}

const USE_MOCK_DATA =
    USE_MOCK_POSITION_REWARDS_DATA !== undefined
        ? USE_MOCK_POSITION_REWARDS_DATA
        : true;

function mapPositionRewardsResponseToPositionRewards(
    positionRewards: PositionRewardsServerIF,
): PositionRewardsDataIF {
    const res: { [key: string]: string } = {};
    res.AMBI = positionRewards.ambiPoints;
    if (positionRewards.blastPoints) {
        res.BLAST = positionRewards.blastPoints;
    }
    if (positionRewards.tokenPoints) {
        res.TOKEN = positionRewards.tokenPoints;
    }
    if (positionRewards.basePoints) {
        res.__BASE__ = positionRewards.basePoints;
    }
    if (positionRewards.quotePoints) {
        res.__QUOTE__ = positionRewards.quotePoints;
    }
    return res as PositionRewardsDataIF;
}

export const fetchPositionRewardsData = async (args: argsIF) => {
    const { positionId } = args;
    console.log(`Fetching Xp for positionId ${positionId}...`);

    if (USE_MOCK_DATA) {
        return getMockPositionRewards(positionId);
    }

    const positionRewardsEndpoint = 'https://ambindexer.bus.bz/xp/position?';

    const positionRewardsFetchData = fetch(
        positionRewardsEndpoint +
            new URLSearchParams({ pos: `pos_${positionId}` }),
    )
        .then((response) => response?.json())
        .then((parsedResponse) =>
            mapPositionRewardsResponseToPositionRewards(parsedResponse.data),
        )
        .catch(console.error);

    return positionRewardsFetchData;
};

const getMockPositionRewards = (positionId: string): PositionRewardsDataIF => {
    // deterministically generate multipliers within 0.00420 - 0.0069 based on positionId kek
    const ambiMultiplier =
        (parseInt(positionId.slice(4, 8), 16) / 0xffff) * 0.0027 + 0.0042;
    const blastMultiplier =
        (parseInt(positionId.slice(8, 12), 16) / 0xffff) * 0.0027 + 0.0042;
    const tokenMultiplier =
        (parseInt(positionId.slice(12, 16), 16) / 0xffff) * 0.0027 + 0.0042;
    const baseMultiplier =
        (parseInt(positionId.slice(16, 20), 16) / 0xffff) * 0.0027 + 0.0042;
    const quoteMultiplier =
        (parseInt(positionId.slice(20, 24), 16) / 0xffff) * 0.0027 + 0.0042;

    // increase points by seconds since start of day (assuming doug doesn't record demo through midnight)
    const now = new Date();
    const startOfDay = new Date(now.toISOString().split('T')[0]);
    const secondsSinceStartOfDay = Math.floor(
        (now.valueOf() - startOfDay.valueOf()) / 1000,
    );

    const ambiPoints = secondsSinceStartOfDay * ambiMultiplier;
    const blastPoints = secondsSinceStartOfDay * blastMultiplier;
    const tokenPoints = secondsSinceStartOfDay * tokenMultiplier;
    const basePoints = secondsSinceStartOfDay * baseMultiplier;
    const quotePoints = secondsSinceStartOfDay * quoteMultiplier;

    return {
        AMBI: getFormattedNumber({
            value: ambiPoints,
            zeroDisplay: '0',
            abbrevThreshold: 1000000000,
        }),
        BLAST: getFormattedNumber({
            value: blastPoints,
            zeroDisplay: '0',
            abbrevThreshold: 1000000000,
        }),
        TOKEN: getFormattedNumber({
            value: tokenPoints,
            zeroDisplay: '0',
            abbrevThreshold: 1000000000,
        }),
        __BASE__: getFormattedNumber({
            value: basePoints,
            zeroDisplay: '0',
            abbrevThreshold: 1000000000,
        }),
        __QUOTE__: getFormattedNumber({
            value: quotePoints,
            zeroDisplay: '0',
            abbrevThreshold: 1000000000,
        }),
    };
};
