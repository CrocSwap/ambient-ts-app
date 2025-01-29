import { Link } from 'react-router-dom';
import { FlexContainer, Text } from '../../../../styled/Common';
// import{ ViewMoreButton } from '../../../../styled/Components/TransactionTable';
import React from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import styles from './PointsHistoryDisplay.module.css';

interface PropsIF {
    pointsData: {
        date: string;
        addedPoints: string;
        retroPoints: string;
    }[];
    hideLevelCardScroll: boolean;
    full?: boolean;
    isViewMoreActive?: boolean;
    connectedAccountActive: boolean;
}
export default function PointsHistoryDisplay(props: PropsIF) {
    const desktopScreen = useMediaQuery('(min-width: 500px)');

    const {
        pointsData,
        hideLevelCardScroll,
        isViewMoreActive,
        connectedAccountActive,
    } = props;

    const { pathname } = window.location;

    const pointsHistoryDisplay = (
        <div className={`${styles.point_history_container} `}>
            <header className={styles.points_history_header}>
                <Text
                    fontSize={'body'}
                    color='text2'
                    style={{ textAlign: 'center' }}
                >
                    Time
                </Text>
                <Text
                    fontSize={'body'}
                    color='text2'
                    style={{ textAlign: 'center' }}
                >
                    New pts
                </Text>
                <Text
                    fontSize={'body'}
                    color='text2'
                    style={{ textAlign: 'center' }}
                >
                    Retroactive pts
                </Text>
            </header>
            <div
                className={`${styles.points_history_content} ${
                    hideLevelCardScroll && styles.hide_scroll
                } custom_scroll_ambient`}
                style={{ height: !isViewMoreActive ? '101px' : '400px' }}
            >
                {(isViewMoreActive ? pointsData : pointsData.slice(0, 10)).map(
                    (data) => (
                        <React.Fragment key={data?.date + data?.addedPoints}>
                            <Text
                                fontSize={!desktopScreen ? 'body' : 'header2'}
                                color='text1'
                                style={{ textAlign: 'end' }}
                            >
                                {data?.date}
                            </Text>
                            <Text
                                fontSize={!desktopScreen ? 'body' : 'header2'}
                                color='text1'
                                style={{ textAlign: 'end' }}
                            >
                                {data?.addedPoints}
                            </Text>
                            <Text
                                fontSize={!desktopScreen ? 'body' : 'header2'}
                                color='text1'
                                style={{ textAlign: 'end' }}
                            >
                                {data?.retroPoints}
                            </Text>
                        </React.Fragment>
                    ),
                )}
            </div>
            {pointsData.length > 5 && (
                <Link
                    to={
                        connectedAccountActive
                            ? isViewMoreActive
                                ? '/account/xp'
                                : '/account/xp/history'
                            : isViewMoreActive
                              ? pathname.replace('/history', '')
                              : pathname + '/history'
                    }
                    className={styles.view_more_link}
                >
                    {!isViewMoreActive ? 'View More' : 'View Less'}
                </Link>
            )}
        </div>
    );

    return (
        <FlexContainer flexDirection='column' gap={4}>
            <Text
                fontSize={desktopScreen ? 'header2' : 'body'}
                color='text1'
                style={{ textAlign: 'center' }}
            >
                Ambient Points History
            </Text>
            {pointsHistoryDisplay}
        </FlexContainer>
    );
}
