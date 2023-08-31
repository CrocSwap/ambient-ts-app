import PoolCard from '../../Global/PoolCard/PoolCard';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { Link } from 'react-router-dom';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { Container, ViewMore } from './TopPools.styles';
import { HomeContent, HomeTitle } from '../../../styled/Components/Home';

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}

// eslint-disable-next-line
export default function TopPools(props: TopPoolsPropsIF) {
    const { topPools } = useContext(CrocEnvContext);
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const show3TopPools = useMediaQuery('(min-height: 700px)');
    const poolData = showMobileVersion
        ? show3TopPools
            ? topPools.slice(0, 3)
            : topPools.slice(0, 2)
        : topPools;

    return (
        <Container flexDirection='column' gap={16}>
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
                as={ViewMore}
            >
                <Link to='/explore'>View More</Link>
            </HomeContent>
        </Container>
    );
}
