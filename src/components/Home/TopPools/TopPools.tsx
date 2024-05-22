import PoolCard from '../../Global/PoolCard/PoolCard';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { Link } from 'react-router-dom';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import {
    HomeContent,
    HomeTitle,
    TopPoolContainer,
    TopPoolViewMore,
} from '../../../styled/Components/Home';

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}

// eslint-disable-next-line
export default function TopPools(props: TopPoolsPropsIF) {
    const { topPools } = useContext(CrocEnvContext);
    const show1Pool = useMediaQuery('(max-height: 800px)');
    const showMobileVersion = useMediaQuery('(max-width: 900px)');
    const show4TopPools = useMediaQuery('(min-width: 1400px)');
    const show3TopPools = useMediaQuery('(min-width: 980px)');
    const showAllTopPools = useMediaQuery('(min-width: 1920px)');

    const poolData = showMobileVersion
        ? show1Pool
            ? topPools.slice(0, 1)
            : showAllTopPools
            ? topPools
            : topPools.slice(0, 2)
        : show4TopPools
        ? topPools.slice(0, 4)
        : show3TopPools
        ? topPools.slice(0, 3)
        : topPools;

    return (
        <TopPoolContainer flexDirection='column' gap={16}>
            <HomeTitle tabIndex={0} aria-label='Top Pools'>
                Top Pools
            </HomeTitle>
            <HomeContent>
                {poolData.map((pool, idx) => (
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
