import { useContext, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import TopPools from '../../components/Global/Analytics/TopPools';
import { ExploreContext } from '../../contexts/ExploreContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import styled from 'styled-components';
import { useTimeElapsed, useTimeElapsedIF } from './useTimeElapsed';
import { ChainDataContext } from '../../contexts/ChainDataContext';

export default function Explore() {
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    // metadata only
    const { poolList } = useContext(PoolContext);
    // full expanded data set
    const { pools } = useContext(ExploreContext);

    // hook to produce human-readable time since fetch for DOM
    const timeSince: useTimeElapsedIF = useTimeElapsed(
        pools.all.length,
        pools.retrievedAt,
        lastBlockNumber,
    );

    // fn wrapper to get pools
    const getPools = async (): Promise<void> => {
        // make sure crocEnv exists and pool metadata is present
        if (crocEnv && poolList.length) {
            // clear text in DOM for time since last update
            timeSince.reset();
            // use metadata to get expanded pool data
            pools.getAll(poolList, crocEnv, chainData.chainId);
            // disable autopolling of infura
            pools.autopoll.disable();
        }
    };

    // get expanded pool metadata
    useEffect(() => {
        // prevent rapid-fire of requests to infura
        pools.autopoll.allowed && getPools();
    }, [crocEnv, chainData.chainId, poolList.length]);

    return (
        <Section>
            <MainWrapper>
                <TitleText>Top Pools on Ambient</TitleText>
                <Refresh>
                    {/* <RefreshText>{timeSince.value}</RefreshText> */}
                    {/* Above line was commented to temporarily remove 'Last Updated: ' timestamp */}
                    {/* Refer to issue #2737 */}

                    <RefreshButton onClick={() => getPools()}>
                        <RefreshIcon />
                    </RefreshButton>
                </Refresh>
            </MainWrapper>
            <TopPools allPools={pools.all} chainId={chainData.chainId} />
        </Section>
    );
}

const Section = styled.section`
    background: var(--dark2);
    height: calc(100vh - 56px);
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
        font-size: 24px;
    }

    /* Responsive font size for even smaller screens */
    @media (max-width: 480px) {
        font-size: 20px;
    }
`;
const Refresh = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 12px;
    font-style: italic;
    color: var(--text1);
    gap: 8px;
`;
const RefreshButton = styled.button`
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--dark3);
    border-radius: 4px;

    border: none;
    outline: none;
`;

// const RefreshText = styled.p`
//     /* Hide the RefreshText on screens smaller than 600px */
//     @media (max-width: 600px) {
//         display: none;
//     }
// `;
const RefreshIcon = styled(FiRefreshCw)`
    font-size: 18px;
    cursor: pointer;
`;
