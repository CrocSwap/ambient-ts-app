import { FlexContainer, Text } from '../../../../styled/Common';
// import { ViewMoreButton } from '../../../../styled/Components/TransactionTable';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import styles from './PointsHistoryDisplay.module.css';
import React from 'react';

interface PropsIF {
    pointsData: {
        date: string;
        addedPoints: string;
        retroPoints: string;
    }[];
    hideLevelCardScroll: boolean;
}
export default function PointsHistoryDisplay(props: PropsIF) {
    const desktopScreen = useMediaQuery('(min-width: 500px)');

    const { pointsData, hideLevelCardScroll } = props;
    const pointsHistoryDisplay = (
        <div className={`${styles.point_history_container} `}>
            <header className={styles.points_history_header}>
                <Text fontSize={'body'} color='text2'>
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
                    style={{ textAlign: 'end' }}
                >
                    Retroactive pts
                </Text>
            </header>
            <div
                className={`${styles.points_history_content} ${
                    hideLevelCardScroll && styles.hide_scroll
                }`}
            >
                {[...pointsData].map((data) => (
                    <React.Fragment key={data?.date + data?.addedPoints}>
                        <Text
                            fontSize={!desktopScreen ? 'body' : 'header2'}
                            color='text1'
                        >
                            {data?.date}
                        </Text>
                        <Text
                            fontSize={!desktopScreen ? 'body' : 'header2'}
                            color='text1'
                            style={{ textAlign: 'center' }}
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
                ))}
                {/* <ViewMoreButton onClick={() => console.log('view')}>
                    View More
                </ViewMoreButton> */}
            </div>
        </div>
    );

    return (
        <FlexContainer flexDirection='column' gap={4}>
            <Text
                fontSize={desktopScreen ? 'header2' : 'body'}
                color='text1'
                style={{ textAlign: 'center' }}
            >
                Points History
            </Text>
            {pointsHistoryDisplay}
        </FlexContainer>
    );
}
