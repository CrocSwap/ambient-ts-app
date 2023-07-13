import { useContext, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import TopPools from '../../components/Global/Analytics/TopPools';
import { ExploreContext } from '../../contexts/ExploreContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import styled from 'styled-components';

export default function Explore() {
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    // metadata only
    const { poolList } = useContext(PoolContext);
    // full expanded data set
    const { pools } = useContext(ExploreContext);

    const getPools = async () => {
        if (crocEnv && poolList.length) {
            pools.getAll(poolList, crocEnv, chainData.chainId);
            pools.autopoll.disable();
        }
    };

    useEffect(() => {
        pools.autopoll.allowed && getPools();
    }, [crocEnv, chainData.chainId, poolList.length]);

    return (
        <Section>
            <MainWrapper>
                Top Pools on Ambient
                <Button onClick={() => getPools()}>
                    <RefreshIcon />
                </Button>
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
`;

const Button = styled.button`
    background-color: var(--dark3);
    border-radius: 4px;
    padding: 4px 8px;
    border: none;
    outline: none;
`;

const RefreshIcon = styled(FiRefreshCw)`
    font-size: 18px;
    cursor: pointer;
`;
