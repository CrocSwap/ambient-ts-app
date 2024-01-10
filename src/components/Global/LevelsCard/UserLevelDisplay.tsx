import { Link } from 'react-router-dom';
import { FlexContainer, Text } from '../../../styled/Common';
import LevelLine from '../LevelLine/LevelLine';
import styles from './LevelsCard.module.css';
import { AlignItems } from '../../../styled/Common/Types';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { useContext } from 'react';
import { progressToNextLevel } from '../../../ambient-utils/api';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';

interface Props {
    // xpData: UserXpDataIF
    currentLevel: number | undefined;
    totalPoints: number | undefined;
    user: string;
}
export default function UserLevelDisplay(props: Props) {
    const { userAddress, resolvedAddressFromContext } =
        useContext(UserDataContext);
    const { currentLevel, totalPoints, user } = props;

    const isTotalPointsLong = totalPoints && totalPoints.toString().length > 6;

    const totalPointsString = totalPoints
        ? totalPoints.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
          })
        : '...';

    const linkToNavigateTo = user
        ? `/account/${user}/xp`
        : resolvedAddressFromContext
        ? `/account/${resolvedAddressFromContext}/xp`
        : `/account/${userAddress}/xp`;

    const progressPercentage = progressToNextLevel(totalPoints ?? 0);

    const formattedXpLevel = getFormattedNumber({
        value: currentLevel,
    });

    return (
        <Link to={linkToNavigateTo} className={styles.level_only_container}>
            <div
                className={`${styles.level_border} ${
                    formattedXpLevel.length > 2 ? styles.auto_width : ''
                }`}
            >
                <div className={styles.level_border_content}>
                    {currentLevel !== undefined &&
                    currentLevel.toString().length > 2
                        ? formattedXpLevel
                        : currentLevel}
                </div>
            </div>

            <FlexContainer
                flexDirection='column'
                justifyContent='space-between'
                height='100%'
                gap={8}
            >
                <FlexContainer
                    flexDirection={isTotalPointsLong ? 'column' : 'row'}
                    gap={8}
                    width='100%'
                    justifyContent='space-between'
                    alignItems={
                        isTotalPointsLong
                            ? ('start' as AlignItems)
                            : ('center' as AlignItems)
                    }
                >
                    <Text
                        fontSize={isTotalPointsLong ? 'header2' : 'header1'}
                        color='text1'
                    >
                        {`Level ${
                            currentLevel !== undefined
                                ? currentLevel.toLocaleString('en-US', {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                  })
                                : '...'
                        }`}
                    </Text>
                    <Text
                        fontSize={isTotalPointsLong ? 'header2' : 'header1'}
                        color='text2'
                        style={{ textAlign: 'end', wordWrap: 'break-word' }}
                    >
                        {`XP: ${totalPointsString}`}
                    </Text>
                </FlexContainer>

                <LevelLine percentage={progressPercentage} width='250px' />
            </FlexContainer>
        </Link>
    );
}
