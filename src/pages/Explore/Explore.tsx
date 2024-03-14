import { useContext, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import TopPools from '../../components/Global/Analytics/TopPools';
import DexTokens from '../../components/Global/Analytics/DexTokens';
import {
    ExploreContext,
    ExploreContextIF,
} from '../../contexts/ExploreContext';
import styled from 'styled-components/macro';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import Toggle from '../../components/Form/Toggle';
import { FlexContainer, Text } from '../../styled/Common';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';

export default function Explore() {
    // full expanded data set
    const exploreData: ExploreContextIF = useContext(ExploreContext);
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    const { poolList } = useContext(PoolContext);
    const {
        isActiveNetworkBlast,
        isActiveNetworkScroll,
        isActiveNetworkMainnet,
    } = useContext(ChainDataContext);

    const getLimitedPools = async (): Promise<void> => {
        if (crocEnv && poolList.length) {
            exploreData.pools.getLimited(poolList, crocEnv, chainData.chainId);
        }
    };

    const getAllPools = async (): Promise<void> => {
        // make sure crocEnv exists and pool metadata is present
        if (crocEnv && poolList.length) {
            // clear text in DOM for time since last update
            exploreData.pools.reset();
            // use metadata to get expanded pool data
            getLimitedPools().then(() => {
                exploreData.pools.getExtra(
                    poolList,
                    crocEnv,
                    chainData.chainId,
                );
            });
        }
    };

    // get expanded pool metadata, if not already fetched
    useEffect(() => {
        if (crocEnv !== undefined && poolList.length === 0) {
            getAllPools();
        }
    }, [crocEnv, poolList.length]);

    // logic to handle onClick navigation action
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    function goToMarket(tknA: string, tknB: string): void {
        linkGenMarket.navigate({
            chain: chainData.chainId,
            tokenA: tknA,
            tokenB: tknB,
        });
    }

    const titleTextPools: string = isActiveNetworkMainnet
        ? 'Top Ambient Pools on Ethereum'
        : isActiveNetworkBlast
        ? 'Top Ambient Pools on Blast'
        : isActiveNetworkScroll
        ? 'Top Ambient Pools on Scroll'
        : 'Top Pools on Ambient';

    const titleTextTokens: string = isActiveNetworkMainnet
        ? 'Active Tokens on Ethereum'
        : isActiveNetworkBlast
        ? 'Active Tokens on Blast'
        : isActiveNetworkScroll
        ? 'Active Tokens on Scroll'
        : 'Top Pools on Ambient';

    const titleTextForDOM: string =
        exploreData.tab.active === 'pools' ? titleTextPools : titleTextTokens;

    // logic router to dispatch the correct action for a refresh button click
    function handleRefresh(): void {
        switch (exploreData.tab.active) {
            case 'pools':
                getAllPools();
                break;
            case 'tokens':
                exploreData.tokens.update();
                break;
        }
    }

    return (
        <Section>
            <MainWrapper>
                <TitleText>{titleTextForDOM}</TitleText>
            </MainWrapper>
            <OptionsWrapper>
                <FlexContainer
                    flexDirection='row'
                    alignItems='center'
                    gap={12}
                    marginLeft='12px'
                >
                    <Text>Pools</Text>
                    <Toggle
                        isOn={exploreData.tab.active === 'tokens'}
                        id={'explore_page_'}
                        handleToggle={() => exploreData.tab.toggle()}
                    />
                    <Text>Tokens</Text>
                </FlexContainer>
                <Refresh>
                    <RefreshButton onClick={() => handleRefresh()}>
                        <RefreshIcon />
                    </RefreshButton>
                </Refresh>
            </OptionsWrapper>

            {exploreData.tab.active === 'pools' && (
                <TopPools
                    allPools={exploreData.pools.all}
                    goToMarket={goToMarket}
                />
            )}
            {exploreData.tab.active === 'tokens' && (
                <DexTokens
                    dexTokens={exploreData.tokens.data}
                    chainId={chainData.chainId}
                    goToMarket={goToMarket}
                />
            )}
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

const OptionsWrapper = styled.div`
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

const RefreshIcon = styled(FiRefreshCw)`
    font-size: var(--header2-size);
    cursor: pointer;
`;
