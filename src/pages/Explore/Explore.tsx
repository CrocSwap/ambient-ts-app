import { useContext, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import TopPools from '../../components/Global/Analytics/TopPools';
import { ExploreContext } from '../../contexts/ExploreContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import styled from 'styled-components/macro';
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

    const getLimitedPools = async (): Promise<void> => {
        if (crocEnv && poolList.length) {
            pools.getLimited(poolList, crocEnv, chainData.chainId);
        }
    };

    const getAllPools = async (): Promise<void> => {
        // make sure crocEnv exists and pool metadata is present
        // prevent rapid-fire of requests to infura
        if (crocEnv && poolList.length && pools.autopoll.allowed) {
            // clear text in DOM for time since last update
            timeSince.reset();
            pools.resetPoolData();
            // use metadata to get expanded pool data
            console.log('getting limited pools');
            getLimitedPools().then(() => {
                setTimeout(async () => {
                    console.log('getting extra pools');
                    pools.getExtra(poolList, crocEnv, chainData.chainId);
                }, 3000);
            });
            // disable autopolling of infura
            pools.autopoll.disable();
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
                <Refresh>
                    {/* <RefreshText>{timeSince.value}</RefreshText> */}
                    {/* Above line was commented to temporarily remove 'Last Updated: ' timestamp */}
                    {/* Refer to issue #2737 */}

                    <RefreshButton
                        onClick={() => {
                            pools.autopoll.enable();
                            getAllPools();
                        }}
                    >
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
        font-size: var(--header1-size);
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
    font-size: var(--body-size);
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
    border-radius: var(--border-radius);

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
    font-size: var(--header2-size);
    cursor: pointer;
`;
