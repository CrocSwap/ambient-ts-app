import { FlexContainer, Text } from '../../../../styled/Common';
import { ViewMoreButton } from '../../../../styled/Components/TransactionTable';
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
    full?: boolean;
    isViewMoreActive: boolean;
    setIsViewMoreActive: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function PointsHistoryDisplay(props: PropsIF) {
    const desktopScreen = useMediaQuery('(min-width: 500px)');

    const {
        pointsData,
        hideLevelCardScroll,
        isViewMoreActive,
        setIsViewMoreActive,
    } = props;

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
                }`}
                style={{ height: !isViewMoreActive ? '101px' : '400px' }}
            >
                {(isViewMoreActive
                    ? [...pointsData, ...pointsData, ...pointsData]
                    : pointsData
                ).map((data) => (
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
                            {data?.addedPoints} pts
                        </Text>
                        <Text
                            fontSize={!desktopScreen ? 'body' : 'header2'}
                            color='text1'
                            style={{ textAlign: 'end' }}
                        >
                            {data?.retroPoints} pts
                        </Text>
                    </React.Fragment>
                ))}
            </div>
            <ViewMoreButton
                onClick={() => setIsViewMoreActive(!isViewMoreActive)}
            >
                {!isViewMoreActive ? 'View More' : 'View Less'}
            </ViewMoreButton>
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
