import { PoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import PoolSearchResult from './PoolSearchResult';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { TokenPriceFn } from '../../../../functions/fetchTokenPrice';
import checkPoolForWETH from '../../../../functions/checkPoolForWETH';
import {
    FlexContainer,
    GridContainer,
    Text,
} from '../../../../../styled/Common';
import { ResultsContainer } from '../../../../../styled/Components/Sidebar';

interface propsIF {
    searchedPools: PoolIF[];
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function PoolsSearchResults(props: propsIF) {
    const { searchedPools, cachedPoolStatsFetch, cachedFetchTokenPrice } =
        props;
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    // fn to handle user clicks on `<PoolLI />` instances
    const handleClick = (baseAddr: string, quoteAddr: string): void => {
        // reorganize base and quote tokens as tokenA and tokenB

        const [addrTokenA, addrTokenB] =
            tokenA.address.toLowerCase() === baseAddr.toLowerCase()
                ? [baseAddr, quoteAddr]
                : tokenA.address.toLowerCase() === quoteAddr.toLowerCase()
                ? [quoteAddr, baseAddr]
                : tokenB.address.toLowerCase() === baseAddr.toLowerCase()
                ? [quoteAddr, baseAddr]
                : [baseAddr, quoteAddr];

        // navigate user to the new appropriate URL path
        linkGenMarket.navigate({
            chain: chainId,
            tokenA: addrTokenA,
            tokenB: addrTokenB,
        });
    };

    return (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='flex-start'
            gap={8}
        >
            <Text fontWeight='500' fontSize='body' color='accent5'>
                Pools
            </Text>
            {searchedPools.length ? (
                <FlexContainer flexDirection='column' fullWidth>
                    <GridContainer
                        numCols={3}
                        fullWidth
                        fontWeight='300'
                        fontSize='body'
                        color='text2'
                        style={{ borderBottom: '1px solid var(--dark3)' }}
                        padding='0 0 4px 0'
                    >
                        <Text
                            fontWeight='300'
                            fontSize='body'
                            color='text2'
                            align='center'
                        >
                            Pool
                        </Text>
                        <Text
                            fontWeight='300'
                            fontSize='body'
                            color='text2'
                            align='center'
                        >
                            Volume
                        </Text>
                        <Text
                            fontWeight='300'
                            fontSize='body'
                            color='text2'
                            align='center'
                        >
                            TVL
                        </Text>
                    </GridContainer>
                    <ResultsContainer flexDirection='column'>
                        {searchedPools
                            .filter(
                                (pool: PoolIF) =>
                                    !checkPoolForWETH(pool, chainId),
                            )
                            // max five elements before content overflows container
                            .slice(0, 5)
                            .map((pool: PoolIF) => (
                                <PoolSearchResult
                                    key={`sidebar_searched_pool_${JSON.stringify(
                                        pool,
                                    )}`}
                                    handleClick={handleClick}
                                    pool={pool}
                                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                                    cachedFetchTokenPrice={
                                        cachedFetchTokenPrice
                                    }
                                    crocEnv={crocEnv}
                                />
                            ))}
                    </ResultsContainer>
                </FlexContainer>
            ) : (
                <FlexContainer
                    margin='0 8px 96px 8px'
                    fontSize='body'
                    color='text2'
                >
                    No Pools Found
                </FlexContainer>
            )}
        </FlexContainer>
    );
}
