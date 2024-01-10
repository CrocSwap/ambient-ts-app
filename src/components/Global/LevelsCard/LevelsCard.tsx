import { FlexContainer, Text } from '../../../styled/Common';
import styles from './LevelsCard.module.css';
import { LuCopy, LuExternalLink, LuShare2 } from 'react-icons/lu';
import LevelLine from '../LevelLine/LevelLine';
import { useContext } from 'react';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { trimString } from '../../../ambient-utils/dataLayer';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { Link } from 'react-router-dom';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

interface LevelsCardPropsIF {
    resolvedAddress?: string;

    currentLevel: number | undefined;
    totalPoints: number | undefined;
    totalPointsCurrentWeek: number | undefined;
    progressPercentage: number;
    pointsData: {
        date: string;
        points: string;
    }[];
    jazziconsToDisplay: JSX.Element | null;
    ensNameToDisplay: string;
    addressToDisplay: string | undefined;
    pointsRemainingToNextLevel: number | undefined;
    ensName: string;
}

export default function LevelsCard(props: LevelsCardPropsIF) {
    const {
        currentLevel,
        totalPoints,
        totalPointsCurrentWeek,
        progressPercentage,
        pointsData,
        jazziconsToDisplay,
        ensNameToDisplay,
        addressToDisplay,
        pointsRemainingToNextLevel,
        resolvedAddress,
        ensName,
    } = props;
    const { userAddress } = useContext(UserDataContext);
    const [_, copy] = useCopyToClipboard();
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    function handleOpenExplorer(address: string) {
        if (address && blockExplorer) {
            const explorerUrl = `${blockExplorer}address/${address}`;
            window.open(explorerUrl);
        }
    }
    function handleCopyAddress() {
        copy(resolvedAddress ? resolvedAddress : userAddress ?? '');
        const copiedData = resolvedAddress ? resolvedAddress : userAddress;

        openSnackbar(`${copiedData} copied`, 'info');
    }
    const desktopScreen = useMediaQuery('(min-width: 500px)');

    const header = (
        <FlexContainer flexDirection='row' gap={16} alignItems='center'>
            <Link
                to={`/${ensName ? ensName : resolvedAddress}`}
                className={styles.user_image}
            >
                {jazziconsToDisplay}
            </Link>
            <FlexContainer flexDirection='column'>
                <FlexContainer flexDirection='row' gap={16}>
                    <Link to={`/${ensName ? ensName : resolvedAddress}`}>
                        <Text fontSize='header2' color='text1'>
                            {ensName ? ensName : ensNameToDisplay}
                        </Text>
                    </Link>

                    <LuExternalLink
                        size={18}
                        onClick={(e) => {
                            handleOpenExplorer(
                                resolvedAddress || (userAddress ?? ''),
                            );
                            e.stopPropagation();
                        }}
                    />
                    <LuCopy size={18} onClick={handleCopyAddress} />
                </FlexContainer>
                <FlexContainer flexDirection='row' gap={16}>
                    <Text fontSize='body' color='text2'>
                        Wallet Address:
                    </Text>
                    <Text fontSize='body' color='text2'>
                        {trimString(addressToDisplay ?? '', 6, 4, '…')}
                    </Text>
                </FlexContainer>
            </FlexContainer>
            <LuShare2 size={24} />
        </FlexContainer>
    );

    const pointsHistoryDisplay = (
        <div className={styles.point_history_container}>
            {pointsData.map((data) => (
                <FlexContainer
                    justifyContent='space-between'
                    key={data?.date + data?.points}
                    gap={32}
                >
                    <Text
                        fontSize={!desktopScreen ? 'body' : 'header2'}
                        color='text1'
                    >
                        {data?.date}
                    </Text>
                    <Text
                        fontSize={!desktopScreen ? 'body' : 'header2'}
                        color='text1'
                        style={{ textAlign: 'end' }}
                    >
                        {data?.points} pts
                    </Text>
                </FlexContainer>
            ))}
        </div>
    );

    return (
        <div className={styles.main_container}>
            {header}
            <Text fontSize='header1' color='text1' padding='8px 32px'>
                {`Level ${
                    currentLevel !== undefined
                        ? currentLevel.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          })
                        : '...'
                }`}
            </Text>
            <LevelLine percentage={progressPercentage} width='250px' />

            <div className={styles.point_display_container}>
                <Text fontSize='body' color='text2'>
                    Points this Week
                </Text>
                <Text
                    fontSize={desktopScreen ? 'header1' : 'header2'}
                    color='text1'
                >
                    {totalPointsCurrentWeek !== undefined
                        ? totalPointsCurrentWeek.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          })
                        : '...'}
                </Text>
            </div>

            <div className={styles.point_display_container}>
                <Text fontSize='body' color='text2'>
                    Total points
                </Text>
                <Text
                    fontSize={desktopScreen ? 'header1' : 'header2'}
                    color='text1'
                >
                    {totalPoints !== undefined
                        ? totalPoints.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          })
                        : '...'}
                </Text>
            </div>
            <Text fontSize={desktopScreen ? 'header2' : 'body'} color='accent1'>
                {`${
                    pointsRemainingToNextLevel !== undefined
                        ? pointsRemainingToNextLevel.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          })
                        : '...'
                } points till next level!`}
            </Text>
            <span className={styles.divider} />

            <Text fontSize={desktopScreen ? 'header2' : 'body'} color='text1'>
                Points History
            </Text>

            {pointsHistoryDisplay}

            <Link to='/xp-leaderboard' className={styles.link}>
                View Leaderboard
            </Link>
        </div>
    );
}
