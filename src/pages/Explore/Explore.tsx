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
    // run when crocEnv, current chain, or number of pools changes
    useEffect(() => {
        // prevent rapid-fire of requests to infura
        pools.autopoll.allowed && getPools();
    }, [crocEnv, chainData.chainId, poolList.length]);

    const isPoolsEmpty = pools?.all?.length === 0;

    return (
        <Section>
            <MainWrapper>
                <h2>Top Pools on Ambient</h2>
                <Refresh>
                    {!isPoolsEmpty ? <p>{timeSince.value}</p> : undefined}
                    <Button onClick={() => getPools()}>
                        <RefreshIcon />
                    </Button>
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
`;

const MainWrapper = styled.p`
    font-size: var(--header1-size);
    line-height: var(--header1-lh);
    color: var(--text1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
    user-select: none;
`;

const Button = styled.button`
    background-color: var(--dark3);
    border-radius: 4px;
    padding: 4px 8px;
    border: none;
    outline: none;
`;

const Refresh = styled.div`
    display: flex;
    flex-direction: row;
    font-size: 12px;
    font-style: italic;
    color: var(--text1);
`;

const RefreshIcon = styled(FiRefreshCw)`
    font-size: 18px;
    cursor: pointer;
`;
