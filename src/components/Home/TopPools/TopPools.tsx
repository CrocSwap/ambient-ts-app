import PoolCard from '../../Global/PoolCard/PoolCard';
import { useContext, useEffect, useState } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import {
    HomeContent,
    HomeTitle,
    TopPoolContainer,
} from '../../../styled/Components/Home';
import { PoolIF } from '../../../ambient-utils/types';

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}

// eslint-disable-next-line
export default function TopPools(props: TopPoolsPropsIF) {
    const { topPools } = useContext(CrocEnvContext);
    const show1Pool = useMediaQuery('(max-height: 800px)');
    const showMobileVersion = useMediaQuery('(max-width: 1180px)');

    const cardWidth = 340; // 270 + 70, width of each card
    const cardMargin = 16; // assuming 16px margin on each side

    const [containerWidth, setContainerWidth] = useState<number>(
        window.innerWidth,
    );
    const [poolDataBasedOnScreen, setPoolDataBasedOnScreen] = useState<
        PoolIF[]
    >([]);

    const calculateNumberOfCards = (
        containerWidth: number,
        cardWidth: number,
        cardMargin: number,
    ): number => {
        return Math.floor(containerWidth / (cardWidth + cardMargin * 2));
    };

    useEffect(() => {
        const handleResize = () => setContainerWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let numberOfCards = calculateNumberOfCards(
            containerWidth,
            cardWidth,
            cardMargin,
        );
        numberOfCards = Math.min(numberOfCards, topPools.length); // Ensure we don't exceed the number of items in topPools

        if (showMobileVersion) {
            numberOfCards = 2;
        }

        setPoolDataBasedOnScreen(topPools.slice(0, numberOfCards));
    }, [containerWidth, topPools, show1Pool, showMobileVersion]);

    return (
        <TopPoolContainer flexDirection='column' gap={16}>
            <HomeTitle
                tabIndex={0}
                aria-label='Top Pools'
                style={{ zIndex: '1' }}
            >
                Top Pools
            </HomeTitle>
            <HomeContent>
                {poolDataBasedOnScreen.map((pool, idx) => (
                    <PoolCard key={idx} pool={pool} />
                ))}
            </HomeContent>
            {/* <HomeContent
                justifyContent='center'
                alignItems='center'
                gap={16}
                as={TopPoolViewMore}
            >
                <Link to='/explore'>View More</Link>
            </HomeContent> */}
        </TopPoolContainer>
    );
}
