// import { USE_MOCK_POSITION_REWARDS_DATA } from '../constants';
// import { getFormattedNumber } from '../dataLayer';
import // PositionRewardsDataIF,
// PositionRewardsServerIF
'../types';

interface argsIF {
    positionId: string;
}

// const USE_MOCK_DATA =
//     USE_MOCK_POSITION_REWARDS_DATA !== undefined
//         ? USE_MOCK_POSITION_REWARDS_DATA
//         : true;

// const initialSeconds = Math.floor(new Date().valueOf() / 1000);
// const randomNum = Math.random();

// function mapPositionRewardsResponseToPositionRewards(
//     positionRewards: PositionRewardsServerIF,
// ): PositionRewardsDataIF {
//     const res: { [key: string]: string } = {};
//     if (positionRewards.ambiPoints) {
//         res.AMBI = positionRewards.ambiPoints;
//     }
//     if (positionRewards.blastPoints) {
//         res.BLAST = positionRewards.blastPoints;
//     }
//     if (positionRewards.tokenPoints) {
//         res.TOKEN = positionRewards.tokenPoints;
//     }
//     if (positionRewards.basePoints) {
//         res.__BASE__ = positionRewards.basePoints;
//     }
//     if (positionRewards.quotePoints) {
//         res.__QUOTE__ = positionRewards.quotePoints;
//     }
//     return res as PositionRewardsDataIF;
// }

export const fetchPositionRewardsData = async (args: argsIF) => {
    const { positionId } = args;
    console.log(`Fetching Xp for positionId ${positionId}...`);

    // if (!USE_MOCK_DATA) {
    //     console.log(getMockPositionRewards());
    //     return getMockPositionRewards();
    // }
    return {
        'BLAST points': '...',
        'BLAST gold': '...',
    };

    // const positionRewardsEndpoint = 'https://ambindexer.net/xp/position?';

    // const positionRewardsFetchData = fetch(
    //     positionRewardsEndpoint + new URLSearchParams({ pos: `${positionId}` }),
    // )
    //     .then((response) => response?.json())
    //     .then((parsedResponse) =>
    //         mapPositionRewardsResponseToPositionRewards(parsedResponse.data),
    //     )
    //     .catch(console.error);

    // return positionRewardsFetchData;
};

// const getMockPositionRewards = (): PositionRewardsDataIF => {
//     // deterministically generate multipliers within 0.00420 - 0.0069 based on positionId kek
//     // (parseInt(positionId.slice(4, 8), 16) / 0xffff) * 0.0027 + 0.0042;
//     const blastPointsMultiplier = 1 / 1200;
//     const blastGoldMultiplier = 1 / 1500;
//     // const ambiMultiplier = 1 / 1000;
//     // const tokenMultiplier = 1 / 22;
//     // const baseMultiplier = 1 / 1400000;
//     // const quoteMultiplier = 1 / 2000;

//     // increase points by seconds since start of day (assuming doug doesn't record demo through midnight)
//     const now = new Date();
//     // const startOfDay = new Date(now.toISOString().split('T')[0]);
//     const secondsElapsed = Math.floor(now.valueOf() / 1000) - initialSeconds;
//     // const secondsSinceStartOfDay = Math.floor(
//     //     (now.valueOf() - startOfDay.valueOf()) / 1000,
//     // );

//     const blastPoints = secondsElapsed * randomNum * blastPointsMultiplier;
//     const blastGold = secondsElapsed * randomNum * blastGoldMultiplier;
//     // const ambiPoints = secondsElapsed * randomNum * ambiMultiplier;
//     // const tokenPoints = secondsElapsed * randomNum * tokenMultiplier;
//     // const basePoints = secondsElapsed * randomNum * baseMultiplier;
//     // const quotePoints = secondsElapsed * randomNum * quoteMultiplier;

//     return {
//         'BLAST points': getFormattedNumber({
//             value: blastPoints,
//             zeroDisplay: '0',
//             abbrevThreshold: 1000000000,
//         }),
//         'BLAST gold': getFormattedNumber({
//             value: blastGold,
//             zeroDisplay: '0',
//             abbrevThreshold: 1000000000,
//         }),
//         // 'AMBI points': getFormattedNumber({
//         //     value: ambiPoints,
//         //     zeroDisplay: '0',
//         //     abbrevThreshold: 1000000000,
//         // }),
//         // __BASE__: getFormattedNumber({
//         //     value: basePoints,
//         //     zeroDisplay: '0',
//         //     abbrevThreshold: 1000000000,
//         // }),
//         // __QUOTE__: getFormattedNumber({
//         //     value: quotePoints,
//         //     zeroDisplay: '0',
//         //     abbrevThreshold: 1000000000,
//         // }),
//         // 'TOKEN yield': getFormattedNumber({
//         //     value: tokenPoints,
//         //     zeroDisplay: '0',
//         //     abbrevThreshold: 1000000000,
//         // }),
//     };
// };
