import { useContext, useRef, useState } from 'react';
import { LuCopy, LuExternalLink } from 'react-icons/lu';
import { RiScreenshot2Fill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { printDomToImage, trimString } from '../../../ambient-utils/dataLayer';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { FlexContainer, Text } from '../../../styled/Common';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { useMediaQuery } from '../../../utils/hooks/useMediaQuery';
import LevelLine from '../LevelLine/LevelLine';
import styles from './LevelsCard.module.css';
import PointsHistoryDisplay from './PointsHistoryDisplay/PointsHistoryDisplay';

interface LevelsCardPropsIF {
    resolvedAddress?: string;

    currentLevel: number | undefined;
    globalPoints: number | undefined;
    globalPointsCurrentWeek: number | undefined;
    progressPercentage: number;
    pointsData: {
        date: string;
        addedPoints: string;
        retroPoints: string;
    }[];
    jazziconsToDisplay: JSX.Element | null;
    truncatedAccountAddressOrEnsName: string;
    pointsRemainingToNextLevel: number | undefined;
    isViewMoreActive?: boolean;
    connectedAccountActive: boolean;
}

export default function LevelsCard(props: LevelsCardPropsIF) {
    // const [isViewMoreActive, setIsViewMoreActive] = useState(false);
    const {
        currentLevel,
        globalPoints,
        globalPointsCurrentWeek,
        progressPercentage,
        pointsData,
        jazziconsToDisplay,
        truncatedAccountAddressOrEnsName,
        pointsRemainingToNextLevel,
        resolvedAddress,
        isViewMoreActive,
        connectedAccountActive,
    } = props;
    const { userAddress } = useContext(UserDataContext);
    const [_, copy] = useCopyToClipboard();
    const {
        activeNetwork: { blockExplorer },
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    function handleOpenExplorer(address: string) {
        if (address && blockExplorer) {
            const explorerUrl = `${blockExplorer}address/${address}`;
            window.open(explorerUrl);
        }
    }
    function handleCopyAddress() {
        copy(resolvedAddress ? resolvedAddress : (userAddress ?? ''));
        const copiedData = resolvedAddress ? resolvedAddress : userAddress;

        openSnackbar(`${copiedData} copied`, 'info');
    }
    const desktopScreen = useMediaQuery('(min-width: 500px)');

    const levelsCanvasRef = useRef(null);
    const [hideLevelCardScroll, setHideLevelCardScroll] = useState(false);
    const copyCardToClipboard = async () => {
        if (levelsCanvasRef.current) {
            setHideLevelCardScroll(true);
            const blob = await printDomToImage(
                levelsCanvasRef.current,
                '#171d27',
                undefined,
                560,
            );
            if (blob) {
                copy(blob);
                openSnackbar('Card image copied to clipboard', 'info');
            }
        }

        setHideLevelCardScroll(false);
    };

    const userLink = `/${resolvedAddress || (userAddress ?? '')}`;

    const header = (
        <FlexContainer
            flexDirection='row'
            gap={16}
            alignItems='center'
            justifyContent='center'
        >
            <Link to={userLink} className={styles.user_image}>
                {jazziconsToDisplay}
            </Link>
            <FlexContainer flexDirection='column'>
                <FlexContainer flexDirection='row' gap={16}>
                    <Link to={userLink}>
                        <Text fontSize='header2' color='text1'>
                            {truncatedAccountAddressOrEnsName}
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
                        {trimString(
                            resolvedAddress || (userAddress ?? ''),
                            6,
                            4,
                            '…',
                        )}
                    </Text>
                </FlexContainer>
            </FlexContainer>
            <RiScreenshot2Fill size={24} onClick={copyCardToClipboard} />
        </FlexContainer>
    );

    const pointsHistoryOnly = (
        <div className={styles.main_container_full} ref={levelsCanvasRef}>
            {header}
            <PointsHistoryDisplay
                pointsData={pointsData}
                hideLevelCardScroll={hideLevelCardScroll}
                isViewMoreActive={isViewMoreActive}
                connectedAccountActive={connectedAccountActive}
                // setIsViewMoreActive={setIsViewMoreActive}
            />
            <Link to='/xp-leaderboard' className={styles.link}>
                View Leaderboard
            </Link>
        </div>
    );
    if (isViewMoreActive) return pointsHistoryOnly;

    return (
        <div className={styles.main_container} ref={levelsCanvasRef}>
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
                    Ambient Points This Week
                </Text>
                <Text
                    fontSize={desktopScreen ? 'header1' : 'header2'}
                    color='text1'
                >
                    {globalPointsCurrentWeek !== undefined
                        ? globalPointsCurrentWeek.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          })
                        : '...'}
                </Text>
            </div>

            <div className={styles.point_display_container}>
                <Text fontSize='body' color='text2'>
                    Total Ambient Points
                </Text>
                <Text
                    fontSize={desktopScreen ? 'header1' : 'header2'}
                    color='text1'
                >
                    {globalPoints !== undefined
                        ? globalPoints.toLocaleString('en-US', {
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

            <PointsHistoryDisplay
                pointsData={pointsData}
                hideLevelCardScroll={hideLevelCardScroll}
                isViewMoreActive={isViewMoreActive}
                connectedAccountActive={connectedAccountActive}
                // setIsViewMoreActive={setIsViewMoreActive}
            />

            <Link to='/xp-leaderboard' className={styles.link}>
                View Leaderboard
            </Link>

            <Link to='/faq' className={styles.link}>
                View FAQ
            </Link>
        </div>
    );
}
