import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppStateContext, ExploreContext } from '../../../contexts';
import {
    HomeContent,
    HomeTitle,
    TopPoolContainer,
    TopPoolViewMore,
} from '../../../styled/Components/Home';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import PoolCard from '../../Global/PoolCard/PoolCard';
import TopPoolSkeleton from './TopPoolSkeleton/TopPoolSkeleton';

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}

// eslint-disable-next-line
export default function TopPoolsHome(props: TopPoolsPropsIF) {
    const {
        pools: {
            all: allPoolsOnChain,
            topPools,
            visibleTopPoolData,
            setVisibleTopPoolData,
        },
    } = useContext(ExploreContext);

    const {
        activeNetwork: { chainId, priorityPool },
    } = useContext(AppStateContext);

    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const show4TopPools = useMediaQuery('(max-width: 1500px)');
    const show3TopPools = useMediaQuery('(min-height: 700px)');

    // State for fade animation
    const [isFading, setIsFading] = useState(false);

    const topPoolsWithPriority = useMemo(() => {
        if (!topPools.length) return [];
        if (!priorityPool) return topPools;
        const updatedActivePoolList = [...topPools];

        const priorityPoolIndexinTopPools = topPools.findIndex(
            (pool) =>
                (pool.base.toLowerCase() ===
                    priorityPool?.[0].address.toLowerCase() &&
                    pool.quote.toLowerCase() ===
                        priorityPool?.[1].address.toLowerCase()) ||
                (pool.base.toLowerCase() ===
                    priorityPool?.[1].address.toLowerCase() &&
                    pool.quote.toLowerCase() ===
                        priorityPool?.[0].address.toLowerCase()),
        );
        const priorityPoolIndexInAllPools = allPoolsOnChain.findIndex(
            (pool) =>
                (pool.base.toLowerCase() ===
                    priorityPool?.[0].address.toLowerCase() &&
                    pool.quote.toLowerCase() ===
                        priorityPool?.[1].address.toLowerCase()) ||
                (pool.base.toLowerCase() ===
                    priorityPool?.[1].address.toLowerCase() &&
                    pool.quote.toLowerCase() ===
                        priorityPool?.[0].address.toLowerCase()),
        );

        if (priorityPoolIndexInAllPools !== -1) {
            if (priorityPoolIndexinTopPools !== -1) {
                const [priorityPool] = updatedActivePoolList.splice(
                    priorityPoolIndexinTopPools,
                    1,
                ); // Remove from current position
                updatedActivePoolList.splice(2, 0, priorityPool); // Insert at third position (index 2)
            } else {
                const priorityPool =
                    allPoolsOnChain[priorityPoolIndexInAllPools]; // Remove from current position
                updatedActivePoolList.splice(2, 0, priorityPool); // Insert at third position (index 2)
            }
        }

        return updatedActivePoolList;
    }, [JSON.stringify(allPoolsOnChain), priorityPool]);

    const lengthOfTopPoolsDisplay = useMemo(
        () =>
            showMobileVersion ? (show3TopPools ? 3 : 2) : show4TopPools ? 4 : 5,
        [showMobileVersion, show3TopPools, show4TopPools],
    );

    const slicedPoolData = useMemo(
        () => topPoolsWithPriority.slice(0, lengthOfTopPoolsDisplay),

        [topPoolsWithPriority, showMobileVersion, show3TopPools, show4TopPools],
    );

    useEffect(() => {
        if (!slicedPoolData.length || chainId !== slicedPoolData[0].chainId) {
            setVisibleTopPoolData([]);
            return;
        }
        if (
            slicedPoolData
                .map((pool) => pool?.name?.toLowerCase())
                .join('|') !==
            visibleTopPoolData
                .map((pool) => pool?.name?.toLowerCase())
                .join('|')
        ) {
            // Trigger fade-out effect
            setIsFading(true);
            // After fade-out duration (300ms), update pool data and fade back in
            setTimeout(() => {
                setVisibleTopPoolData(slicedPoolData);
                setIsFading(false);
            }, 300); // Match the fade-out duration
        } else {
            setVisibleTopPoolData(slicedPoolData);
        }
    }, [JSON.stringify(slicedPoolData), chainId]);

    const tempItems = Array.from(
        { length: lengthOfTopPoolsDisplay },
        (_, i) => i + 1,
    );
    const skeletonDisplay = tempItems.map((item, idx) => (
        <TopPoolSkeleton key={idx} />
    ));
    const isHeightSmall = useMediaQuery('(max-height: 800px)');

    return (
        <TopPoolContainer flexDirection='column' gap={isHeightSmall ? 8 : 16}>
            <HomeTitle tabIndex={0} aria-label='Top Pools'>
                Top Pools
            </HomeTitle>
            <HomeContent minHeight='120px'>
                {isFading || !visibleTopPoolData.length
                    ? skeletonDisplay
                    : visibleTopPoolData.map((pool, idx) => (
                          <PoolCard key={idx} pool={pool} />
                      ))}
            </HomeContent>

            <HomeContent
                justifyContent='center'
                alignItems='center'
                gap={16}
                as={TopPoolViewMore}
            >
                <Link to='/explore'>View More</Link>
            </HomeContent>
        </TopPoolContainer>
    );
}
