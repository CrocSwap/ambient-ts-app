import { UserXpIF } from '../types';

interface argsIF {
    user: string;
}

export const fetchUserXpData = async (args: argsIF) => {
    const { user } = args;
    console.log(`Fetching Xp for ${user}`);

    // const userXpEndpoint = 'https://ambindexer.net/xp?'

    // const userXp = fetch(
    //     userXpEndpoint +
    //         new URLSearchParams({
    //             user: user,
    //         }),
    // )
    //     .then((response) => response?.json())

    //     .catch(console.error);

    const userXp: UserXpIF = {
        userAddress: user,
        leaderboardRank: 1,
        currentLevel: 4,
        recentPoints: 1800,
        totalPoints: 3000,
        pointsRemainingToNextLevel: 1000,
        pointsHistory: [
            {
                addedPoints: 1800,
                cumulativePoints: 3000,
                level: 4,
                snapshotUnixTime: 1702512000,
            },
            {
                addedPoints: 1000,
                cumulativePoints: 1200,
                level: 2,
                snapshotUnixTime: 1701907200,
            },
            {
                addedPoints: 200,
                cumulativePoints: 200,
                level: 1,
                snapshotUnixTime: 1701302400,
            },
        ],
    };
    return userXp;
};
