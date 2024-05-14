import { PoolIF } from '../../../ambient-utils/types';
import {
    PoolStatsFn,
    getMoneynessRank,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import { Link, useLocation } from 'react-router-dom';
import { useContext, useMemo } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import {
    useLinkGen,
    linkGenMethodsIF,
    pageNames,
} from '../../../utils/hooks/useLinkGen';
import { TokenPriceFn } from '../../../ambient-utils/api';
import {
    ItemContainer,
    MainItemContainer,
} from '../../../styled/Components/Sidebar';
import { FlexContainer } from '../../../styled/Common';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import useFetchPoolStats from '../../../App/hooks/useFetchPoolStats';
import TokenIcon from '../TokenIcon/TokenIcon';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import FavButton from './FavButton';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { SidebarContext } from '../../../contexts/SidebarContext';

interface propsIF {
    pool: PoolIF;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function PoolsListItem(props: propsIF) {
    const { pool } = props;
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const {
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);
    const { favePools } = useContext(UserPreferenceContext);

    const isBaseTokenMoneynessGreaterOrEqual =
        pool.base.address && pool.quote.address
            ? getMoneynessRank(pool.base.symbol) -
                  getMoneynessRank(pool.quote.symbol) >=
              0
            : false;

    const baseToken = isBaseTokenMoneynessGreaterOrEqual
        ? pool.quote
        : pool.base;
    const quoteToken = isBaseTokenMoneynessGreaterOrEqual
        ? pool.base
        : pool.quote;
    const currentPoolData = {
        base: baseToken,
        quote: quoteToken,
        chainId: chainId,
        poolId: poolIndex,
    };

    const isButtonFavorited = favePools.check(
        currentPoolData.base.address,
        currentPoolData.quote.address,
        currentPoolData.chainId,
        currentPoolData.poolId,
    );

    function handleFavButton() {
        isButtonFavorited
            ? favePools.remove(baseToken, quoteToken, chainId, poolIndex)
            : favePools.add(quoteToken, baseToken, chainId, poolIndex);
    }

    // hook to get human-readable values for pool volume and TVL
    const poolData = useFetchPoolStats(pool);

    const { pathname } = useLocation();

    const navTarget = useMemo<pageNames>(() => {
        let output: pageNames;
        if (
            pathname.startsWith('/trade/market') ||
            pathname.startsWith('/account') ||
            pathname === '/'
        ) {
            output = 'market';
        } else if (pathname.startsWith('/trade/limit')) {
            output = 'limit';
        } else if (pathname.startsWith('/trade/pool')) {
            output = 'pool';
        } else {
            console.warn(
                'Could not identify the correct URL path for redirect. Using /trade/market as a fallback value. Refer to TopPoolsCard.tsx for troubleshooting.',
            );
            output = 'market';
        }
        return output as pageNames;
    }, [pathname]);

    const { tokenA, tokenB } = useContext(TradeDataContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenMarket: linkGenMethodsIF = useLinkGen(navTarget);

    const [addrTokenA, addrTokenB] =
        tokenA.address.toLowerCase() === pool.base.address.toLowerCase()
            ? [pool.base.address, pool.quote.address]
            : tokenA.address.toLowerCase() === pool.quote.address.toLowerCase()
            ? [pool.quote.address, pool.base.address]
            : tokenB.address.toLowerCase() === pool.base.address.toLowerCase()
            ? [pool.quote.address, pool.base.address]
            : [pool.base.address, pool.quote.address];

    const mobileScreen = useMediaQuery('(max-width: 500px)');

    const poolDisplay = (
        <FlexContainer gap={8} alignItems='center'>
            {!mobileScreen && (
                <FlexContainer gap={4}>
                    <TokenIcon
                        token={
                            isBaseTokenMoneynessGreaterOrEqual
                                ? pool.quote
                                : pool.base
                        }
                        src={uriToHttp(
                            (isBaseTokenMoneynessGreaterOrEqual
                                ? poolData.quoteLogoUri
                                : poolData.baseLogoUri) ?? '...',
                        )}
                        alt={
                            isBaseTokenMoneynessGreaterOrEqual
                                ? pool.quote.symbol
                                : pool.base.symbol
                        }
                        size='m'
                    />
                    <TokenIcon
                        token={
                            isBaseTokenMoneynessGreaterOrEqual
                                ? pool.base
                                : pool.quote
                        }
                        src={uriToHttp(
                            (isBaseTokenMoneynessGreaterOrEqual
                                ? poolData.baseLogoUri
                                : poolData.quoteLogoUri) ?? '...',
                        )}
                        alt={
                            isBaseTokenMoneynessGreaterOrEqual
                                ? pool.base.symbol
                                : pool.quote.symbol
                        }
                        size='m'
                    />
                </FlexContainer>
            )}
            {isBaseTokenMoneynessGreaterOrEqual
                ? pool.quote.symbol
                : pool.base.symbol}{' '}
            /{' '}
            {isBaseTokenMoneynessGreaterOrEqual
                ? pool.base.symbol
                : pool.quote.symbol}
        </FlexContainer>
    );

    return (
        <MainItemContainer style={{ width: '100%' }}>
            <ItemContainer
                as={Link}
                to={linkGenMarket.getFullURL({
                    chain: chainId,
                    tokenA: addrTokenA,
                    tokenB: addrTokenB,
                })}
                color='text2'
                onClick={() => {
                    if (isPoolDropdownOpen) setIsPoolDropdownOpen(false);
                }}
            >
                {[
                    [poolDisplay],
                    `${poolData.poolPrice ?? '...'}`,
                    `${
                        poolData.poolVolume24h
                            ? '$' + poolData.poolVolume24h
                            : '...'
                    }`,
                    `${poolData.poolTvl ? '$' + poolData.poolTvl : '...'}`,
                ].map((item, idx) => (
                    <FlexContainer key={idx} padding='4px 0'>
                        {item}
                    </FlexContainer>
                ))}
            </ItemContainer>

            <FavButton
                key={'pool'}
                handleFavButton={handleFavButton}
                isButtonFavorited={isButtonFavorited}
            />
        </MainItemContainer>
    );
}
