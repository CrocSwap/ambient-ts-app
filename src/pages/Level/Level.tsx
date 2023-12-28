import moment from 'moment';
import LevelsCard from '../../components/Global/LevelsCard/LevelsCard';
import styles from './Level.module.css';
import { TempNonUserXp, UserDataContext } from '../../contexts/UserDataContext';
import { useContext } from 'react';
import LevelDisplay from '../../components/Global/LevelsCard/UserLevelDisplay';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import { jsNumberForAddress } from 'react-jazzicon';

interface LevelPropsIF {
    ensName: string;
    resolvedAddress: string;
    connectedAccountActive: boolean;
    ensNameAvailable: boolean;
    truncatedAccountAddress: string;
    isLevelOnly?: boolean;
}
export default function Level(props: LevelPropsIF) {
    const {
        ensName,
        resolvedAddress,
        connectedAccountActive,
        ensNameAvailable,
        truncatedAccountAddress,
        isLevelOnly,
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
    console.log({ jazziconsToDisplay, connectedAccountActive });

    const xpData =
        isUserPage ||
        connectedAccountActive ||
        location.pathname === '/account/xp'
            ? connectedUserXp
            : TempNonUserXp;

    const pointsData =
        xpData?.data?.pointsHistory?.map((entry) => ({
            date: moment.unix(entry.snapshotUnixTime).format('DD/MM/YY'),
            points: entry.addedPoints,
        })) || [];

    const currentLevel = xpData?.data?.currentLevel;
    const totalPoints = xpData?.data?.totalPoints;

    // ------TOTAL POINTS THIS WEEEK-----
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const totalPointsCurrentWeek =
        xpData?.data?.pointsHistory
            ?.filter(
                (entry) =>
                    entry.snapshotUnixTime >= startOfWeek.getTime() / 1000 &&
                    entry.snapshotUnixTime < endOfWeek.getTime() / 1000,
            )
            ?.reduce((acc, entry) => acc + entry.addedPoints, 0) || 0;

    // ---------------------------------
    const progressPercentage =
        (((xpData?.data?.totalPoints ?? 0) -
            (xpData?.data?.pointsRemainingToNextLevel ?? 0)) /
            (xpData?.data?.totalPoints ?? 1)) *
        100;

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
    };
    if (isLevelOnly)
        return (
            <LevelDisplay
                currentLevel={currentLevel}
                totalPoints={totalPoints}
            />
        );

    return (
        <div className={styles.level_page_container}>
            <LevelsCard {...levelsCardProps} />
        </div>
    );
}
