import { useContext, useEffect } from 'react';
import TopPools from '../../components/Global/Analytics/TopPools';
import { ExploreContext } from '../../contexts/ExploreContext';
import styled from 'styled-components/macro';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';

export default function Explore() {
    // full expanded data set
    const { pools } = useContext(ExploreContext);
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    const { poolList } = useContext(PoolContext);

    const getLimitedPools = async (): Promise<void> => {
        if (crocEnv && poolList.length) {
            pools.getLimited(poolList, crocEnv, chainData.chainId);
        }
    };

    const getAllPools = async (): Promise<void> => {
        // make sure crocEnv exists and pool metadata is present
        if (crocEnv && poolList.length) {
            // clear text in DOM for time since last update
            pools.resetPoolData();
            // use metadata to get expanded pool data
            getLimitedPools().then(() => {
                pools.getExtra(poolList, crocEnv, chainData.chainId);
            });
        }
    };

    // get expanded pool metadata
    useEffect(() => {
        if (crocEnv !== undefined && poolList.length > 0) {
            getAllPools();
        }
    }, [crocEnv, poolList.length]);

    return (
        <Section>
            <MainWrapper>
                <TitleText>Top Pools on Ambient</TitleText>
            </MainWrapper>
            <TopPools allPools={pools.all} chainId={chainData.chainId} />
        </Section>
    );
}

const Section = styled.section`
    background: var(--dark2);
    height: calc(100vh - 120px);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (max-width: 1280px) {
        margin-left: 2rem;
    }
`;

const MainWrapper = styled.div`
    font-size: var(--header1-size);
    line-height: var(--header1-lh);
    color: var(--text1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
    user-select: none;
`;

const TitleText = styled.h2`
    /* Responsive font size for smaller screens */
    @media (max-width: 768px) {
        font-size: var(--header1-size);
    }

    /* Responsive font size for even smaller screens */
    @media (max-width: 480px) {
        font-size: 20px;
    }
`;
