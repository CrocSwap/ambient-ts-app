import { FlexContainer, Text } from '../../../styled/Common';
import styles from './LevelsCard.module.css';
import { LuCopy, LuExternalLink, LuShare2 } from 'react-icons/lu';
import LevelLine from '../LevelLine/LevelLine';
import { useContext, useMemo } from 'react';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { trimString } from '../../../ambient-utils/dataLayer';
import { useParams } from 'react-router-dom';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

const pointsData = [
    { date: '18/09/23', points: 1600 },
    { date: '11/09/23', points: 800 },
    { date: '04/09/23', points: 1200 },
];

interface LevelsCardPropsIF {
    levelOnly?: boolean;
}

export default function LevelsCard(props: LevelsCardPropsIF) {
    const { levelOnly } = props;
    const { userAddress, ensName } = useContext(UserDataContext);
    const { address: addressFromParams } = useParams();
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

    const resolvedAddress = '';

    function handleCopyAddress() {
        copy(resolvedAddress ? resolvedAddress : userAddress ?? '');
        const copiedData = resolvedAddress ? resolvedAddress : userAddress;

        openSnackbar(`${copiedData} copied`, 'info');
    }

    const header = (
        <FlexContainer flexDirection='row' gap={16} alignItems='center'>
            <div className={styles.user_image}>
                <img
                    src='https://pxbar.com/wp-content/uploads/2023/09/instagram-profile-picture.jpg'
                    alt=''
                />
            </div>
            <FlexContainer flexDirection='column'>
                <FlexContainer flexDirection='row' gap={16}>
                    <Text fontSize='header2' color='text1'>
                        {ensName ? ensName : userAddress ? userAddress : ''}
                    </Text>
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
                        Metamask
                    </Text>
                    <Text fontSize='body' color='text2'>
                        {trimString(userAddress ?? '', 6, 4, '…')}
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
                    <Text fontSize='header2' color='text1'>
                        {data?.date}
                    </Text>
                    <Text
                        fontSize='header2'
                        color='text1'
                        style={{ textAlign: 'end' }}
                    >
                        {data?.points} pts
                    </Text>
                </FlexContainer>
            ))}
        </div>
    );

    const levelDisplay = (
        <div className={styles.level_only_container}>
            <div className={styles.level_border}>
                <div className={styles.level_border_content}>16</div>
            </div>

            <FlexContainer
                flexDirection='column'
                justifyContent='space-between'
                height='100%'
            >
                <FlexContainer
                    flexDirection='row'
                    width='100%'
                    justifyContent='space-between'
                >
                    <Text fontSize='header1' color='text1'>
                        Level 16{' '}
                    </Text>
                    <Text fontSize='header1' color='text2'>
                        XP: 16, 425{' '}
                    </Text>
                </FlexContainer>

                <LevelLine percentage={20} width='250px' />
            </FlexContainer>
        </div>
    );

    if (levelOnly) return levelDisplay;

    return (
        <div className={styles.main_container}>
            {header}
            <Text fontSize='header1' color='text1' padding='8px 32px'>
                Level 16
            </Text>
            <LevelLine percentage={20} width='250px' />

            <div className={styles.point_display_container}>
                <Text fontSize='body' color='text2'>
                    Points this Week
                </Text>
                <Text fontSize='header1' color='text1'>
                    1,600
                </Text>
            </div>

            <div className={styles.point_display_container}>
                <Text fontSize='body' color='text2'>
                    Points this Week
                </Text>
                <Text fontSize='header1' color='text1'>
                    1,600
                </Text>
            </div>
            <Text fontSize='header2' color='accent1'>
                1,098 points till next level!
            </Text>
            <span className={styles.divider} />

            <Text fontSize='header2' color='text1'>
                Points History
            </Text>

            {pointsHistoryDisplay}
        </div>
    );
}
