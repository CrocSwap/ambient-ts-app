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
    globalPoints: number | undefined;
    user: string;
}
export default function UserLevelDisplay(props: Props) {
    const { userAddress, resolvedAddressFromContext } =
        useContext(UserDataContext);
    const { currentLevel, globalPoints, user } = props;

    const isglobalPointsLong =
        globalPoints && globalPoints.toString().length > 6;

    const globalPointsString =
        globalPoints !== undefined
            ? globalPoints.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
              })
            : '...';

    const linkToNavigateTo = user
        ? `/${user}/xp`
        : resolvedAddressFromContext
        ? `/${resolvedAddressFromContext}/xp`
        : `/${userAddress}/xp`;

    const progressPercentage = progressToNextLevel(globalPoints ?? 0);

    const formattedXpLevel = getFormattedNumber({
        value: currentLevel,
        abbrevThreshold: 1000,
        minFracDigits: 0,
        maxFracDigits: 0,
        isLevel: true,
        mantissa:
            (currentLevel || 1) >= 100000 && (currentLevel || 1) < 1000000
                ? 0
                : 1,
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
                    flexDirection={isglobalPointsLong ? 'column' : 'row'}
                    gap={8}
                    width='100%'
                    justifyContent='space-between'
                    alignItems={
                        isglobalPointsLong
                            ? ('start' as AlignItems)
                            : ('center' as AlignItems)
                    }
                >
                    <Text
                        fontSize={isglobalPointsLong ? 'header2' : 'header1'}
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
                        fontSize={isglobalPointsLong ? 'header2' : 'header1'}
                        color='text2'
                        style={{ textAlign: 'end', wordWrap: 'break-word' }}
                    >
                        {`XP: ${globalPointsString}`}
                    </Text>
                </FlexContainer>

                <LevelLine percentage={progressPercentage} width='250px' />
            </FlexContainer>
        </Link>
    );
}
