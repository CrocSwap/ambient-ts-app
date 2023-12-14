import { FaExternalLinkAlt } from 'react-icons/fa';
import { FlexContainer, Text } from '../../../styled/Common';
import styles from './LevelsCard.module.css';
import { FiCopy } from 'react-icons/fi';
import { LuCopy, LuExternalLink, LuShare2 } from 'react-icons/lu';
import LevelLine from '../LevelLine/LevelLine';
import DividerDark from '../DividerDark/DividerDark';
import Divider from '../Divider/Divider';
const pointsData = [
    { date: '18/09/23', points: 1600 },
    { date: '11/09/23', points: 800 },
    { date: '04/09/23', points: 1200 },
];

export default function LevelsCard() {
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
                        miyuki.eth
                    </Text>
                    <LuExternalLink size={18} />
                    <LuCopy size={18} />
                </FlexContainer>
                <FlexContainer flexDirection='row' gap={16}>
                    <Text fontSize='body' color='text2'>
                        Metamask
                    </Text>
                    <Text fontSize='body' color='text2'>
                        0xAbCd...5587
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

    const yes = true;
    if (yes) return levelDisplay;

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
