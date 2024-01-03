import { Link } from 'react-router-dom';
import { FlexContainer, Text } from '../../../styled/Common';
import LevelLine from '../LevelLine/LevelLine';
import styles from './LevelsCard.module.css';

interface Props {
    // xpData: UserXpDataIF
    currentLevel: number | string | undefined;
    totalPoints: number | string | undefined;
    user: string;
}
export default function UserLevelDisplay(props: Props) {
    const { currentLevel, totalPoints, user } = props;

    const totalPointsString = totalPoints
        ? totalPoints.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
          })
        : '...';

    const linkToNavigateTo = `/account/${user}/xp`;

    return (
        <Link to={linkToNavigateTo} className={styles.level_only_container}>
            <div className={styles.level_border}>
                <div className={styles.level_border_content}>
                    {currentLevel}
                </div>
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
                        {`Level ${
                            currentLevel !== undefined ? currentLevel : '...'
                        }`}
                    </Text>
                    <Text fontSize='header1' color='text2'>
                        {`XP: ${totalPointsString}`}
                    </Text>
                </FlexContainer>

                <LevelLine percentage={20} width='250px' />
            </FlexContainer>
        </Link>
    );
}
