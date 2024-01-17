import LevelsCard from '../../components/Global/LevelsCard/LevelsCard';
import styles from './Level.module.css';
import { UserDataContext, UserXpDataIF } from '../../contexts/UserDataContext';
import { useContext } from 'react';
import LevelDisplay from '../../components/Global/LevelsCard/UserLevelDisplay';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import { jsNumberForAddress } from 'react-jazzicon';
import RankTable from './RankTable/RankTable';
import { FlexContainer, Text } from '../../styled/Common';
import { progressToNextLevel } from '../../ambient-utils/api';

interface LevelPropsIF {
    ensName: string;
    resolvedAddress: string;
    connectedAccountActive: boolean;
    ensNameAvailable: boolean;
    truncatedAccountAddress: string;
    isLevelOnly?: boolean;
    isDisplayRank?: boolean;
    resolvedUserXp?: UserXpDataIF;
}
export default function Level(props: LevelPropsIF) {
    const {
        ensName,
        resolvedAddress,
        connectedAccountActive,
        ensNameAvailable,
        truncatedAccountAddress,
        isLevelOnly,
        isDisplayRank,
        resolvedUserXp,
    } = props;
    const { userAddress, connectedUserXp } = useContext(UserDataContext);

    const ensNameToDisplay = ensNameAvailable
        ? ensName
        : truncatedAccountAddress;

    const addressToDisplay = resolvedAddress
        ? resolvedAddress
        : ensNameAvailable
        ? truncatedAccountAddress
        : userAddress;

    const jazziconsSeed = resolvedAddress
        ? resolvedAddress.toLowerCase()
        : userAddress?.toLowerCase() ?? '';

    const myJazzicon = (
        <Jazzicon diameter={50} seed={jsNumberForAddress(jazziconsSeed)} />
    );

    const isUserPage = userAddress === resolvedAddress;

    const jazziconsToDisplay =
        resolvedAddress || connectedAccountActive || (isUserPage && myJazzicon)
            ? myJazzicon
            : null;

    const xpData =
        isUserPage ||
        connectedAccountActive ||
        location.pathname === '/account/xp'
            ? connectedUserXp
            : resolvedUserXp;

    const pointsData =
        xpData?.data?.pointsHistory?.map((entry) => {
            const elapsedTimeInSecondsNum = entry.snapshotUnixTime
                ? Date.now() / 1000 - entry.snapshotUnixTime
                : undefined;
            const elapsedTimeString =
                elapsedTimeInSecondsNum !== undefined
                    ? elapsedTimeInSecondsNum < 60
                        ? '< 1 minute ago'
                        : elapsedTimeInSecondsNum < 120
                        ? '1 minute ago'
                        : elapsedTimeInSecondsNum < 3600
                        ? `${Math.floor(
                              elapsedTimeInSecondsNum / 60,
                          )} minutes ago `
                        : elapsedTimeInSecondsNum < 7200
                        ? '1 hour ago'
                        : elapsedTimeInSecondsNum < 86400
                        ? `${Math.floor(
                              elapsedTimeInSecondsNum / 3600,
                          )} hours ago `
                        : elapsedTimeInSecondsNum < 172800
                        ? '1 day ago'
                        : `${Math.floor(
                              elapsedTimeInSecondsNum / 86400,
                          )} days ago `
                    : 'Pending...';
            return {
                date: elapsedTimeString,
                addedPoints: entry.addedPoints.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }),
                retroPoints: entry.retroPoints.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }),
            };
        }) || [];

    const currentLevel = xpData?.data?.currentLevel;
    const totalPoints = xpData?.data?.totalPoints;

    // ------TOTAL POINTS THIS WEEEK-----
    // const now = new Date();
    // const endOfWeek = new Date(now);
    // const startOfWeek = new Date(endOfWeek);
    // // startOfWeek.setHours(0, 0, 0, 0);
    // // startOfWeek.setDate(now.getDate() - now.getDay());

    // startOfWeek.setDate(endOfWeek.getDate() - 7);

    // console.log({ startOfWeek, endOfWeek });

    // const totalPointsCurrentWeek =
    //     xpData?.data?.pointsHistory
    //         ?.filter(
    //             (entry) =>
    //                 entry.snapshotUnixTime >= startOfWeek.getTime() / 1000 &&
    //                 entry.snapshotUnixTime < endOfWeek.getTime() / 1000,
    //         )
    //         ?.reduce((acc, entry) => acc + entry.addedPoints, 0) || 0;

    const totalPointsCurrentWeek = xpData?.data?.recentPoints ?? undefined;

    // ---------------------------------

    const progressPercentage = progressToNextLevel(totalPoints ?? 0);

    const levelsCardProps = {
        currentLevel,
        totalPoints,
        totalPointsCurrentWeek,
        progressPercentage,
        pointsData,
        jazziconsToDisplay,
        ensNameToDisplay,
        addressToDisplay,
        resolvedAddress,
        pointsRemainingToNextLevel: xpData?.data?.pointsRemainingToNextLevel,
        ensName: ensName,
    };

    if (isLevelOnly)
        return (
            <LevelDisplay
                currentLevel={currentLevel}
                totalPoints={totalPoints}
                user={ensName ?? addressToDisplay}
            />
        );

    if (isDisplayRank) {
        return (
            <div className={styles.level_page_container}>
                <FlexContainer
                    flexDirection='column'
                    margin='2rem auto'
                    style={{ height: '100%', gap: '1rem' }}
                >
                    <Text fontSize='header1' color='white' align='start'>
                        Leaderboard
                    </Text>

                    <RankTable />
                </FlexContainer>
            </div>
        );
    }

    return (
        <div className={styles.level_page_container}>
            <LevelsCard {...levelsCardProps} />
        </div>
    );
}
