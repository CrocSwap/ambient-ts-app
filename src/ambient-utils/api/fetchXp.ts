import { UserXpIF, UserXpServerIF, XpSnapshotServerIF } from '../types';

interface argsIF {
    user: string;
}

// function to convert level to xp
export const levelToXp = (level: number) => {
    const xp = 250 * (level - 1) ** (3 / 2);
    return xp;
};

// function to convert xp to levels
export const xpToLevel = (xp: number) => {
    const level = Math.floor((xp / 250) ** (2 / 3)) + 1;
    return level;
};

// function to calculate points to next level
export const pointsToNextLevel = (xp: number) => {
    const nextLevel = xpToLevel(xp) + 1;
    const pointsToNextLevel = levelToXp(nextLevel) - xp;
    return pointsToNextLevel;
};

// function to calculate progress percentage to next level
export const progressToNextLevel = (xp: number) => {
    const level = xpToLevel(xp);
    const progressToNextLevel =
        ((xp - levelToXp(level)) / (levelToXp(level + 1) - levelToXp(level))) *
        100;

    return progressToNextLevel;
};

function mapUserXpResponseToUserXp(userXp: UserXpServerIF): UserXpIF {
    const currentLevel = xpToLevel(userXp.globalPoints);
    const pointsRemainingToNextLevel = pointsToNextLevel(userXp.globalPoints);

    const updatedPointsHistory = userXp.pointsHistory?.map(
        (historyItem: XpSnapshotServerIF) => ({
            ...historyItem,
            level: historyItem.cumulativePoints
                ? xpToLevel(historyItem.cumulativePoints)
                : 0,
        }),
    );

    return {
        ...userXp,
        currentLevel,
        pointsRemainingToNextLevel,
        pointsHistory: updatedPointsHistory || undefined,
    };
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
    //     .then((parsedResponse) => mapUserXpResponseToUserXp(parsedResponse))
    //     .catch(console.error);

    // real user data
    const userXpServerMockData: UserXpServerIF = {
        userAddress: '0x7bfee91193d9df2ac0bfe90191d40f23c773c060',
        globalPoints: 60518,
        globalRank: 7,
        weeklyPoints: 2252,
        weeklyRank: 9,
        chainPoints: 58517,
        chainRank: 7,
        chainId: '0x1',
        pointsHistory: [
            {
                addedPoints: 2252,
                cumulativePoints: 60518,
                retroPoints: 350,
                snapshotUnixTime: 1706832000,
            },
            {
                addedPoints: 2227,
                cumulativePoints: 57916,
                retroPoints: 275,
                snapshotUnixTime: 1706227200,
            },
            {
                addedPoints: 2319,
                cumulativePoints: 55414,
                retroPoints: 481,
                snapshotUnixTime: 1705622400,
            },
            {
                addedPoints: 2343,
                cumulativePoints: 52614,
                retroPoints: 827,
                snapshotUnixTime: 1705017600,
            },
            {
                addedPoints: 2298,
                cumulativePoints: 49444,
                retroPoints: 1372,
                snapshotUnixTime: 1704412800,
            },
            {
                addedPoints: 2281,
                cumulativePoints: 45774,
                retroPoints: 2153,
                snapshotUnixTime: 1703808000,
            },
            {
                addedPoints: 2189,
                cumulativePoints: 41340,
                retroPoints: 3091,
                snapshotUnixTime: 1703203200,
            },
            {
                addedPoints: 2230,
                cumulativePoints: 36060,
                retroPoints: 3923,
                snapshotUnixTime: 1702598400,
            },
            {
                addedPoints: 2063,
                cumulativePoints: 29907,
                retroPoints: 4264,
                snapshotUnixTime: 1701993600,
            },
            {
                addedPoints: 1944,
                cumulativePoints: 23580,
                retroPoints: 3923,
                snapshotUnixTime: 1701388800,
            },
            {
                addedPoints: 2037,
                cumulativePoints: 17713,
                retroPoints: 3091,
                snapshotUnixTime: 1700784000,
            },
            {
                addedPoints: 1387,
                cumulativePoints: 12585,
                retroPoints: 2153,
                snapshotUnixTime: 1700179200,
            },
            {
                addedPoints: 1444,
                cumulativePoints: 9045,
                retroPoints: 1372,
                snapshotUnixTime: 1699574400,
            },
            {
                addedPoints: 74,
                cumulativePoints: 6229,
                retroPoints: 827,
                snapshotUnixTime: 1698969600,
            },
            {
                addedPoints: 1031,
                cumulativePoints: 5328,
                retroPoints: 481,
                snapshotUnixTime: 1698364800,
            },
            {
                addedPoints: 1653,
                cumulativePoints: 3816,
                retroPoints: 275,
                snapshotUnixTime: 1697760000,
            },
            {
                addedPoints: 1538,
                cumulativePoints: 1888,
                retroPoints: 350,
                snapshotUnixTime: 1697155200,
            },
        ],
    };

    // fake user data
    // const userXpServerMockData: UserXpServerIF = {
    //     userAddress: user,
    //     globalPoints: 2146969,
    //     globalRank: 1000,
    //     weeklyPoints: 42069,
    //     weeklyRank: 1,
    //     chainPoints: 40000,
    //     chainRank: 3,
    //     chainId: '0x1',
    //     pointsHistory: [
    //         {
    //             addedPoints: 42069,
    //             retroPoints: 420,
    //             snapshotUnixTime: 1707264000,
    //         },
    //         {
    //             addedPoints: 40296,
    //             retroPoints: 393,
    //             snapshotUnixTime: 1706659200,
    //         },
    //         {
    //             addedPoints: 39690,
    //             retroPoints: 401,
    //             snapshotUnixTime: 1706054400,
    //         },
    //         {
    //             addedPoints: 6969,
    //             retroPoints: 420,
    //             snapshotUnixTime: 1705449600,
    //         },
    //         {
    //             addedPoints: 40000,
    //             retroPoints: 2500,
    //             snapshotUnixTime: 1704931200,
    //         },
    //         {
    //             addedPoints: 40000,
    //             retroPoints: 2500,
    //             snapshotUnixTime: 1704326400,
    //         },
    //         {
    //             addedPoints: 1100,
    //             retroPoints: 500,
    //             snapshotUnixTime: 1703721600,
    //         },
    //         {
    //             addedPoints: 1500,
    //             retroPoints: 0,
    //             snapshotUnixTime: 1703116800,
    //         },
    //         {
    //             addedPoints: 1800,
    //             retroPoints: 0,
    //             snapshotUnixTime: 1702512000,
    //         },
    //         {
    //             addedPoints: 1000,
    //             retroPoints: 0,
    //             snapshotUnixTime: 1701907200,
    //         },
    //         {
    //             addedPoints: 200,
    //             retroPoints: 0,
    //             snapshotUnixTime: 1701302400,
    //         },
    //     ],
    // };
    const userXp = mapUserXpResponseToUserXp(userXpServerMockData);
    return userXp;
};

export const fetchXpLeadersData = async (
    leaderboardType: 'global' | 'byWeek' | 'byChain',
    chainId?: string,
) => {
    console.log({ chainId });
    // const xpLeadersEndpoint = 'https://ambindexer.net/xp?';

    // const xpLeaders = fetch(
    //     xpLeadersEndpoint +
    //         new URLSearchParams({
    //             leaderboardType: leaderboardType,
    //             chainId: chainId || '',
    //         }),
    // )
    //     .then((response) => response?.json())

    //     .catch(console.error);

    // real data
    const xpGlobalLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0x634eeef5d8314e0f0056c11f4d1b1837c32ba10f',
            globalPoints: 178218,
            globalRank: 1,
        },
        {
            userAddress: '0xbc5429e1921232bfb2c960ce767ce383cd63296b',
            globalPoints: 122794,
            globalRank: 2,
        },
        {
            userAddress: '0xefad5ef6cee6f5dd6b5ea118b44d9fd41af8a4d0',
            globalPoints: 114102,
            globalRank: 3,
        },
        {
            userAddress: '0x4ce5f95e5df2de6f1474222d49c02cc4f1cf3c8d',
            globalPoints: 68883,
            globalRank: 4,
        },
        {
            userAddress: '0x18398ef8653fe5b8acd12cc10cf645ed67258d04',
            globalPoints: 65279,
            globalRank: 5,
        },
        {
            userAddress: '0xf61e266bf546f313483dc6629bdb90fc52cbd6ca',
            globalPoints: 62637,
            globalRank: 6,
        },
        {
            userAddress: '0x7bfee91193d9df2ac0bfe90191d40f23c773c060',
            globalPoints: 60518,
            globalRank: 7,
        },
        {
            userAddress: '0x7f065ce53c4a97165ab0c83c4d796f79a8f93fc9',
            globalPoints: 54984,
            globalRank: 8,
        },
        {
            userAddress: '0x55e1490a1878d0b61811726e2cb96560022e764c',
            globalPoints: 54172,
            globalRank: 9,
        },
        {
            userAddress: '0x8bc110db7029197c3621bea8092ab1996d5dd7be',
            globalPoints: 52299,
            globalRank: 10,
        },
        {
            userAddress: '0x38ff5b25c3cc65d07d09d025a514ab1af9ba2631',
            globalPoints: 23461,
            globalRank: 11,
        },
        {
            userAddress: '0x26c5ec0062e23d73974921eaf12effc78738d091',
            globalPoints: 19614,
            globalRank: 12,
        },
        {
            userAddress: '0x473d3a2005499301dc353afa9d0c9c5980b5188c',
            globalPoints: 17659,
            globalRank: 13,
        },
        {
            userAddress: '0x38b9e6e281d05f8ab409e602bb5a4a4ce7c08e24',
            globalPoints: 17141,
            globalRank: 14,
        },
        {
            userAddress: '0xef764bac8a438e7e498c2e5fccf0f174c3e3f8db',
            globalPoints: 16350,
            globalRank: 15,
        },
        {
            userAddress: '0x42087c28f296d3b2dab56e3f5d1aca1388f2be5b',
            globalPoints: 14969,
            globalRank: 16,
        },
        {
            userAddress: '0x2098868b1cc5374951eb63724342c7a875595127',
            globalPoints: 13930,
            globalRank: 17,
        },
        {
            userAddress: '0x3a567303b207c6d906a8fcc380a2c307ece7051d',
            globalPoints: 13889,
            globalRank: 18,
        },
        {
            userAddress: '0x6dbde1a1e0f199b0252e593a422b9340af03075a',
            globalPoints: 13744,
            globalRank: 19,
        },
        {
            userAddress: '0xffa388d3444ae5596deaa817c50cd09d79ae6889',
            globalPoints: 13383,
            globalRank: 20,
        },
        {
            userAddress: '0x5a78751a437f9b9a26024e1536b30e34249e89e4',
            globalPoints: 13178,
            globalRank: 21,
        },
        {
            userAddress: '0x02c4bc6b7dda908bf89bda10cf8dbb8649823284',
            globalPoints: 13076,
            globalRank: 22,
        },
        {
            userAddress: '0x821880a3e2bac432d67e5155e72bb655ef65fa5e',
            globalPoints: 12823,
            globalRank: 23,
        },
        {
            userAddress: '0xf49d2bcc52f0b46a98204721f98ce9d4e6730bed',
            globalPoints: 12460,
            globalRank: 24,
        },
        {
            userAddress: '0x593fff821a3470a6c8a19951be1534e6b4095a72',
            globalPoints: 12332,
            globalRank: 25,
        },
        {
            userAddress: '0x70e439584ef1ba300106b9c16543eaa1de676dc2',
            globalPoints: 11059,
            globalRank: 26,
        },
        {
            userAddress: '0xa38cdb63c943e9481c9b87db5c80f5ac333d16ed',
            globalPoints: 10452,
            globalRank: 27,
        },
        {
            userAddress: '0x11d67fa925877813b744abc0917900c2b1d6eb81',
            globalPoints: 9776,
            globalRank: 28,
        },
        {
            userAddress: '0x54207bdd0b6b1daa5bd98c0c8c2ebdef65f63a3b',
            globalPoints: 9642,
            globalRank: 29,
        },
        {
            userAddress: '0x1098503a90c3224f0e6be7c124a337888c0ba564',
            globalPoints: 8412,
            globalRank: 30,
        },
    ];

    // // fake data
    // const xpGlobalLeadersMockServerData: Array<UserXpServerIF> = [
    //     {
    //         userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
    //         globalPoints: 4000000005600,
    //         globalRank: 1,
    //     },
    //     {
    //         userAddress: '0xe09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
    //         globalPoints: 2000000005600,
    //         globalRank: 2,
    //     },
    //     {
    //         userAddress: '0x17bB53328943952A5dF419cC5F1771128F8f1828',
    //         globalPoints: 250000000,
    //         globalRank: 3,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 245000000,
    //         globalRank: 4,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226ac81757E090',
    //         globalPoints: 25500000,
    //         globalRank: 5,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 2300000,
    //         globalRank: 6,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 240000,
    //         globalRank: 7,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 160000,
    //         globalRank: 8,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 150000,
    //         globalRank: 9,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 140000,
    //         globalRank: 10,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 130000,
    //         globalRank: 11,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 120000,
    //         globalRank: 12,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 110000,
    //         globalRank: 13,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 100000,
    //         globalRank: 14,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 90000,
    //         globalRank: 15,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 80000,
    //         globalRank: 16,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 70000,
    //         globalRank: 17,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 65000,
    //         globalRank: 18,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 60000,
    //         globalRank: 19,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 55000,
    //         globalRank: 20,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 50000,
    //         globalRank: 21,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 40000,
    //         globalRank: 22,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 35000,
    //         globalRank: 23,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 33000,
    //         globalRank: 24,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 32000,
    //         globalRank: 25,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 31000,
    //         globalRank: 26,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 30000,
    //         globalRank: 27,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 21000,
    //         globalRank: 28,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 20000,
    //         globalRank: 29,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         globalPoints: 18000,
    //         globalRank: 30,
    //     },
    // ];

    // real data
    const xpWeeklyLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0xf61e266bf546f313483dc6629bdb90fc52cbd6ca',
            weeklyPoints: 21282,
            weeklyRank: 1,
            globalPoints: 62637,
        },
        {
            userAddress: '0x4ce5f95e5df2de6f1474222d49c02cc4f1cf3c8d',
            weeklyPoints: 17379,
            weeklyRank: 2,
            globalPoints: 68883,
        },
        {
            userAddress: '0x634eeef5d8314e0f0056c11f4d1b1837c32ba10f',
            weeklyPoints: 13967,
            weeklyRank: 3,
            globalPoints: 178218,
        },
        {
            userAddress: '0x3a567303b207c6d906a8fcc380a2c307ece7051d',
            weeklyPoints: 12729,
            weeklyRank: 4,
            globalPoints: 13889,
        },
        {
            userAddress: '0xbc5429e1921232bfb2c960ce767ce383cd63296b',
            weeklyPoints: 8517,
            weeklyRank: 5,
            globalPoints: 122794,
        },
        {
            userAddress: '0xefad5ef6cee6f5dd6b5ea118b44d9fd41af8a4d0',
            weeklyPoints: 7119,
            weeklyRank: 6,
            globalPoints: 114102,
        },
        {
            userAddress: '0x3de2616fd986168d4ef592acd95758727b25458b',
            weeklyPoints: 2584,
            weeklyRank: 7,
            globalPoints: 5348,
        },
        {
            userAddress: '0x473d3a2005499301dc353afa9d0c9c5980b5188c',
            weeklyPoints: 2256,
            weeklyRank: 8,
            globalPoints: 17659,
        },
        {
            userAddress: '0x7bfee91193d9df2ac0bfe90191d40f23c773c060',
            weeklyPoints: 2252,
            weeklyRank: 9,
            globalPoints: 60518,
        },
        {
            userAddress: '0x7f065ce53c4a97165ab0c83c4d796f79a8f93fc9',
            weeklyPoints: 2212,
            weeklyRank: 10,
            globalPoints: 54984,
        },
        {
            userAddress: '0x55e1490a1878d0b61811726e2cb96560022e764c',
            weeklyPoints: 1879,
            weeklyRank: 11,
            globalPoints: 54172,
        },
        {
            userAddress: '0x6dbde1a1e0f199b0252e593a422b9340af03075a',
            weeklyPoints: 1524,
            weeklyRank: 12,
            globalPoints: 13744,
        },
        {
            userAddress: '0xc44fd102415ff62769a4e37c70dea27033a5291f',
            weeklyPoints: 1454,
            weeklyRank: 13,
            globalPoints: 4838,
        },
        {
            userAddress: '0x2098868b1cc5374951eb63724342c7a875595127',
            weeklyPoints: 1437,
            weeklyRank: 14,
            globalPoints: 13930,
        },
        {
            userAddress: '0x739e068904ef9b06f47d842fff1f97a579c30fc7',
            weeklyPoints: 1193,
            weeklyRank: 15,
            globalPoints: 1193,
        },
        {
            userAddress: '0xe4df09aa3a40cc788debdbed57041efc489a72c6',
            weeklyPoints: 1089,
            weeklyRank: 16,
            globalPoints: 1525,
        },
        {
            userAddress: '0x38b9e6e281d05f8ab409e602bb5a4a4ce7c08e24',
            weeklyPoints: 1001,
            weeklyRank: 17,
            globalPoints: 17141,
        },
        {
            userAddress: '0xaa0e2529f9c33e3ad86346fe26fefc4bc635fc67',
            weeklyPoints: 910,
            weeklyRank: 18,
            globalPoints: 5807,
        },
        {
            userAddress: '0x9f198ff03b860d6cc7f6540b4c4e388e05cd931f',
            weeklyPoints: 831,
            weeklyRank: 19,
            globalPoints: 1048,
        },
        {
            userAddress: '0x5a78751a437f9b9a26024e1536b30e34249e89e4',
            weeklyPoints: 690,
            weeklyRank: 20,
            globalPoints: 13178,
        },
        {
            userAddress: '0xba55bdbf959df826da6c35487eb15fad2164662d',
            weeklyPoints: 689,
            weeklyRank: 21,
            globalPoints: 3106,
        },
        {
            userAddress: '0x33128fa08f5e0545f4714434b53bdb5e98f62474',
            weeklyPoints: 673,
            weeklyRank: 22,
            globalPoints: 7272,
        },
        {
            userAddress: '0x593fff821a3470a6c8a19951be1534e6b4095a72',
            weeklyPoints: 573,
            weeklyRank: 23,
            globalPoints: 12332,
        },
        {
            userAddress: '0xf49d2bcc52f0b46a98204721f98ce9d4e6730bed',
            weeklyPoints: 558,
            weeklyRank: 24,
            globalPoints: 12460,
        },
        {
            userAddress: '0x6968cd0784ddf0165fa161511f6f2599e4dede92',
            weeklyPoints: 544,
            weeklyRank: 25,
            globalPoints: 4371,
        },
        {
            userAddress: '0x02c4bc6b7dda908bf89bda10cf8dbb8649823284',
            weeklyPoints: 497,
            weeklyRank: 26,
            globalPoints: 13076,
        },
        {
            userAddress: '0x26c5ec0062e23d73974921eaf12effc78738d091',
            weeklyPoints: 492,
            weeklyRank: 27,
            globalPoints: 19614,
        },
        {
            userAddress: '0xbdfa4f4492dd7b7cf211209c4791af8d52bf5c50',
            weeklyPoints: 474,
            weeklyRank: 28,
            globalPoints: 7164,
        },
        {
            userAddress: '0x17554b593f89d5c8c7b447d21176d977a516ae45',
            weeklyPoints: 435,
            weeklyRank: 29,
            globalPoints: 7900,
        },
        {
            userAddress: '0x02306c8c39b3c579d3dcbfce5d191e2d6b7a3a60',
            weeklyPoints: 399,
            weeklyRank: 30,
            globalPoints: 798,
        },
    ];

    // // fake data
    // const xpWeeklyLeadersMockServerData: Array<UserXpServerIF> = [
    //     {
    //         userAddress: '0x17bB53328943952A5dF419cC5F1771128F8f1828',
    //         weeklyPoints: 10000,
    //         weeklyRank: 1,
    //         globalPoints: 4005600,
    //     },
    //     {
    //         userAddress: '0xe09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
    //         weeklyPoints: 5000,
    //         weeklyRank: 2,
    //         globalPoints: 40600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2000,
    //         weeklyRank: 3,
    //         globalPoints: 100005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 1900,
    //         weeklyRank: 4,
    //         globalPoints: 100600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226ac81757E090',
    //         weeklyPoints: 1500,
    //         weeklyRank: 5,
    //         globalPoints: 205600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 1000,
    //         weeklyRank: 6,
    //         globalPoints: 4505600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 730,
    //         weeklyRank: 7,
    //         globalPoints: 4005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 500,
    //         weeklyRank: 8,
    //         globalPoints: 4000005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 400,
    //         weeklyRank: 9,
    //         globalPoints: 402305600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 300,
    //         weeklyRank: 10,
    //         globalPoints: 305600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 240,
    //         weeklyRank: 11,
    //         globalPoints: 4350005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 24,
    //         weeklyRank: 12,
    //         globalPoints: 2005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 24,
    //         weeklyRank: 13,
    //         globalPoints: 40000,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 14,
    //         globalPoints: 40205600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 15,
    //         globalPoints: 4000305600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 16,
    //         globalPoints: 4030005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 17,
    //         globalPoints: 4600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 18,
    //         globalPoints: 4000,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 19,
    //         globalPoints: 4000000005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 20,
    //         globalPoints: 5600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 21,
    //         globalPoints: 40600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 22,
    //         globalPoints: 4000,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 23,
    //         globalPoints: 4000000005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 24,
    //         globalPoints: 5600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 25,
    //         globalPoints: 4600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 26,
    //         globalPoints: 4005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 27,
    //         globalPoints: 4000600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 28,
    //         globalPoints: 4000,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 29,
    //         globalPoints: 4000,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         weeklyPoints: 2,
    //         weeklyRank: 30,
    //         globalPoints: 4000,
    //     },
    // ];

    // real data
    const xpChainLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0x634eeef5d8314e0f0056c11f4d1b1837c32ba10f',
            chainPoints: 178218,
            chainRank: 1,
            chainId: '0x1',
            globalPoints: 178218,
        },
        {
            userAddress: '0xbc5429e1921232bfb2c960ce767ce383cd63296b',
            chainPoints: 122794,
            chainRank: 2,
            chainId: '0x1',
            globalPoints: 122794,
        },
        {
            userAddress: '0xefad5ef6cee6f5dd6b5ea118b44d9fd41af8a4d0',
            chainPoints: 114102,
            chainRank: 3,
            chainId: '0x1',
            globalPoints: 114102,
        },
        {
            userAddress: '0x4ce5f95e5df2de6f1474222d49c02cc4f1cf3c8d',
            chainPoints: 68883,
            chainRank: 4,
            chainId: '0x1',
            globalPoints: 68883,
        },
        {
            userAddress: '0x18398ef8653fe5b8acd12cc10cf645ed67258d04',
            chainPoints: 65279,
            chainRank: 5,
            chainId: '0x1',
            globalPoints: 65279,
        },
        {
            userAddress: '0xf61e266bf546f313483dc6629bdb90fc52cbd6ca',
            chainPoints: 62637,
            chainRank: 6,
            chainId: '0x1',
            globalPoints: 62637,
        },
        {
            userAddress: '0x7bfee91193d9df2ac0bfe90191d40f23c773c060',
            chainPoints: 58517,
            chainRank: 7,
            chainId: '0x1',
            globalPoints: 60518,
        },
        {
            userAddress: '0x7f065ce53c4a97165ab0c83c4d796f79a8f93fc9',
            chainPoints: 54984,
            chainRank: 8,
            chainId: '0x1',
            globalPoints: 54984,
        },
        {
            userAddress: '0x8bc110db7029197c3621bea8092ab1996d5dd7be',
            chainPoints: 52299,
            chainRank: 9,
            chainId: '0x1',
            globalPoints: 52299,
        },
        {
            userAddress: '0x55e1490a1878d0b61811726e2cb96560022e764c',
            chainPoints: 49387,
            chainRank: 10,
            chainId: '0x1',
            globalPoints: 54172,
        },
        {
            userAddress: '0x38ff5b25c3cc65d07d09d025a514ab1af9ba2631',
            chainPoints: 23461,
            chainRank: 11,
            chainId: '0x1',
            globalPoints: 23461,
        },
        {
            userAddress: '0x26c5ec0062e23d73974921eaf12effc78738d091',
            chainPoints: 19614,
            chainRank: 12,
            chainId: '0x1',
            globalPoints: 19614,
        },
        {
            userAddress: '0x38b9e6e281d05f8ab409e602bb5a4a4ce7c08e24',
            chainPoints: 17141,
            chainRank: 13,
            chainId: '0x1',
            globalPoints: 17141,
        },
        {
            userAddress: '0x42087c28f296d3b2dab56e3f5d1aca1388f2be5b',
            chainPoints: 14519,
            chainRank: 14,
            chainId: '0x1',
            globalPoints: 14969,
        },
        {
            userAddress: '0x3a567303b207c6d906a8fcc380a2c307ece7051d',
            chainPoints: 13889,
            chainRank: 15,
            chainId: '0x1',
            globalPoints: 13889,
        },
        {
            userAddress: '0x6dbde1a1e0f199b0252e593a422b9340af03075a',
            chainPoints: 13744,
            chainRank: 16,
            chainId: '0x1',
            globalPoints: 13744,
        },
        {
            userAddress: '0xffa388d3444ae5596deaa817c50cd09d79ae6889',
            chainPoints: 13383,
            chainRank: 17,
            chainId: '0x1',
            globalPoints: 13383,
        },
        {
            userAddress: '0x821880a3e2bac432d67e5155e72bb655ef65fa5e',
            chainPoints: 12558,
            chainRank: 18,
            chainId: '0x1',
            globalPoints: 12823,
        },
        {
            userAddress: '0x593fff821a3470a6c8a19951be1534e6b4095a72',
            chainPoints: 12332,
            chainRank: 19,
            chainId: '0x1',
            globalPoints: 12332,
        },
        {
            userAddress: '0x5a78751a437f9b9a26024e1536b30e34249e89e4',
            chainPoints: 11862,
            chainRank: 20,
            chainId: '0x1',
            globalPoints: 13178,
        },
        {
            userAddress: '0xf49d2bcc52f0b46a98204721f98ce9d4e6730bed',
            chainPoints: 11444,
            chainRank: 21,
            chainId: '0x1',
            globalPoints: 12460,
        },
        {
            userAddress: '0x70e439584ef1ba300106b9c16543eaa1de676dc2',
            chainPoints: 10871,
            chainRank: 22,
            chainId: '0x1',
            globalPoints: 11059,
        },
        {
            userAddress: '0xa38cdb63c943e9481c9b87db5c80f5ac333d16ed',
            chainPoints: 10452,
            chainRank: 23,
            chainId: '0x1',
            globalPoints: 10452,
        },
        {
            userAddress: '0x54207bdd0b6b1daa5bd98c0c8c2ebdef65f63a3b',
            chainPoints: 8713,
            chainRank: 24,
            chainId: '0x1',
            globalPoints: 9642,
        },
        {
            userAddress: '0x1098503a90c3224f0e6be7c124a337888c0ba564',
            chainPoints: 8412,
            chainRank: 25,
            chainId: '0x1',
            globalPoints: 8412,
        },
        {
            userAddress: '0xea1a31eaf8894afdfbda5c819efbb5c745f673bf',
            chainPoints: 7763,
            chainRank: 26,
            chainId: '0x1',
            globalPoints: 7763,
        },
        {
            userAddress: '0x11d67fa925877813b744abc0917900c2b1d6eb81',
            chainPoints: 7625,
            chainRank: 27,
            chainId: '0x1',
            globalPoints: 9776,
        },
        {
            userAddress: '0x297946c26171008ba8c0e5642814b5fe6b842ab7',
            chainPoints: 6867,
            chainRank: 28,
            chainId: '0x1',
            globalPoints: 6867,
        },
        {
            userAddress: '0x27c2b32bcb59e08641453106ac9eb5dd7d7206a2',
            chainPoints: 6338,
            chainRank: 29,
            chainId: '0x1',
            globalPoints: 6338,
        },
        {
            userAddress: '0x4b74d0296259f7994796e1b6e9c1c4f68066f5d6',
            chainPoints: 6277,
            chainRank: 30,
            chainId: '0x1',
            globalPoints: 6277,
        },
    ];

    // // fake data
    // const xpChainLeadersMockServerData: Array<UserXpServerIF> = [
    //     {
    //         userAddress: '0x8a8b00B332c5eD50466e31FCCdd4dc2170b4F78f',
    //         chainPoints: 50000,
    //         chainRank: 1,
    //         chainId: chainId,
    //         globalPoints: 5000000,
    //     },
    //     {
    //         userAddress: '0xe09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
    //         chainPoints: 20000,
    //         chainRank: 2,
    //         chainId: chainId,
    //         globalPoints: 2000000,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 15000,
    //         chainRank: 3,
    //         chainId: chainId,
    //         globalPoints: 1500000,
    //     },
    //     {
    //         userAddress: '0x17bB53328943952A5dF419cC5F1771128F8f1828',
    //         chainPoints: 14000,
    //         chainRank: 4,
    //         chainId: chainId,
    //         globalPoints: 2500000,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226ac81757E090',
    //         chainPoints: 13000,
    //         chainRank: 5,
    //         chainId: chainId,
    //         globalPoints: 3500000,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 240,
    //         chainRank: 6,
    //         chainId: chainId,
    //         globalPoints: 400005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 230,
    //         chainRank: 7,
    //         chainId: chainId,
    //         globalPoints: 20005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 220,
    //         chainRank: 8,
    //         chainId: chainId,
    //         globalPoints: 205600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 210,
    //         chainRank: 9,
    //         chainId: chainId,
    //         globalPoints: 4005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 200,
    //         chainRank: 10,
    //         chainId: chainId,
    //         globalPoints: 4030005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 190,
    //         chainRank: 11,
    //         chainId: chainId,
    //         globalPoints: 4600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 180,
    //         chainRank: 12,
    //         chainId: chainId,
    //         globalPoints: 460,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 170,
    //         chainRank: 13,
    //         chainId: chainId,
    //         globalPoints: 4000000005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 160,
    //         chainRank: 14,
    //         chainId: chainId,
    //         globalPoints: 40000,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 150,
    //         chainRank: 15,
    //         chainId: chainId,
    //         globalPoints: 400005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 140,
    //         chainRank: 16,
    //         chainId: chainId,
    //         globalPoints: 40005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 130,
    //         chainRank: 17,
    //         chainId: chainId,
    //         globalPoints: 4005600,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 120,
    //         chainRank: 18,
    //         chainId: chainId,
    //         globalPoints: 23433,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 110,
    //         chainRank: 19,
    //         chainId: chainId,
    //         globalPoints: 346346,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 100,
    //         chainRank: 20,
    //         chainId: chainId,
    //         globalPoints: 1234223,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 90,
    //         chainRank: 21,
    //         chainId: chainId,
    //         globalPoints: 232,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 80,
    //         chainRank: 22,
    //         chainId: chainId,
    //         globalPoints: 3323,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 70,
    //         chainRank: 23,
    //         chainId: chainId,
    //         globalPoints: 4433,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 60,
    //         chainRank: 24,
    //         chainId: chainId,
    //         globalPoints: 323,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 50,
    //         chainRank: 25,
    //         chainId: chainId,
    //         globalPoints: 2322,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 40,
    //         chainRank: 26,
    //         chainId: chainId,
    //         globalPoints: 644,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 30,
    //         chainRank: 27,
    //         chainId: chainId,
    //         globalPoints: 112,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 20,
    //         chainRank: 28,
    //         chainId: chainId,
    //         globalPoints: 235,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 10,
    //         chainRank: 29,
    //         chainId: chainId,
    //         globalPoints: 323,
    //     },
    //     {
    //         userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
    //         chainPoints: 1,
    //         chainRank: 30,
    //         chainId: chainId,
    //         globalPoints: 663,
    //     },
    // ];

    const xpLeaders =
        leaderboardType === 'byWeek'
            ? xpWeeklyLeadersMockServerData.map((userXp) =>
                  mapUserXpResponseToUserXp(userXp),
              )
            : leaderboardType === 'byChain'
            ? xpChainLeadersMockServerData.map((userXp) =>
                  mapUserXpResponseToUserXp(userXp),
              )
            : xpGlobalLeadersMockServerData.map((userXp) =>
                  mapUserXpResponseToUserXp(userXp),
              );

    return xpLeaders;
};
