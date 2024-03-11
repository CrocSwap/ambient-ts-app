import { useContext, useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import TopPools from '../../components/Global/Analytics/TopPools';
import DexTokens from '../../components/Global/Analytics/DexTokens';
import { ExploreContext } from '../../contexts/ExploreContext';
import styled from 'styled-components/macro';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { dexTokenData, useTokenStats } from './useTokenStats';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { TokenContext } from '../../contexts/TokenContext';
import Toggle from '../../components/Form/Toggle';
import { FlexContainer, Text } from '../../styled/Common';

export default function Explore() {
    // full expanded data set
    const { pools } = useContext(ExploreContext);
    const { activeNetwork, crocEnv, chainData, provider } =
        useContext(CrocEnvContext);
    const { poolList } = useContext(PoolContext);
    const {
        isActiveNetworkBlast,
        isActiveNetworkScroll,
        isActiveNetworkMainnet,
    } = useContext(ChainDataContext);

    const { tokens } = useContext(TokenContext);

    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

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

    // get expanded pool metadata, if not already fetched
    useEffect(() => {
        if (
            crocEnv !== undefined &&
            poolList.length > 0 &&
            pools.all.length === 0
        ) {
            getAllPools();
        }
    }, [crocEnv, poolList.length, pools.all.length]);

    const dexTokens: dexTokenData[] = useTokenStats(
        chainData.chainId,
        crocEnv,
        activeNetwork.graphCacheUrl,
        cachedFetchTokenPrice,
        tokens,
        provider,
    );

    const titleTextPools: string = isActiveNetworkMainnet
        ? 'Top Ambient Pools on Ethereum'
        : isActiveNetworkBlast
        ? 'Top Ambient Pools on Blast'
        : isActiveNetworkScroll
        ? 'Top Ambient Pools on Scroll'
        : 'Top Pools on Ambient';

    const titleTextTokens: string = isActiveNetworkMainnet
        ? 'Recently Added Tokens on Ethereum'
        : isActiveNetworkBlast
        ? 'Recently Added on Blast'
        : isActiveNetworkScroll
        ? 'Recently Added on Scroll'
        : 'Top Pools on Ambient';

    type tables = 'pools' | 'tokens';
    const [activeTable, setActiveTable] = useState<tables>('pools');
    function toggleTable(current: tables): void {
        let nextTable: tables;
        switch (current) {
            case 'pools':
                nextTable = 'tokens';
                break;
            case 'tokens':
                nextTable = 'pools';
                break;
        }
        setActiveTable(nextTable);
    }

    const titleTextForDOM: string =
        activeTable === 'pools' ? titleTextPools : titleTextTokens;

    return (
        <Section>
            <MainWrapper>
                <TitleText>{titleTextForDOM}</TitleText>
                <Refresh>
                    <RefreshButton
                        onClick={() => {
                            getAllPools();
                        }}
                    >
                        <RefreshIcon />
                    </RefreshButton>
                </Refresh>
            </MainWrapper>
            <FlexContainer
                flexDirection='row'
                alignItems='center'
                gap={12}
                marginLeft='12px'
            >
                <Text>Pools</Text>
                <Toggle
                    isOn={activeTable === 'tokens'}
                    id={'explore_page_'}
                    handleToggle={() => toggleTable(activeTable)}
                />
                <Text>Tokens</Text>
            </FlexContainer>
            {activeTable === 'pools' && (
                <TopPools allPools={pools.all} chainId={chainData.chainId} />
            )}
            {activeTable === 'tokens' && <DexTokens dexTokens={dexTokens} />}
        </Section>
    );
}

const Section = styled.section`
    background: var(--dark2);
    height: calc(100vh - 170px);
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
