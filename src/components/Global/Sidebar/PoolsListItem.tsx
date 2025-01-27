import { useContext, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getMoneynessRank, uriToHttp } from '../../../ambient-utils/dataLayer';
import { PoolIF } from '../../../ambient-utils/types';
import useFetchPoolStats from '../../../App/hooks/useFetchPoolStats';
import { AppStateContext } from '../../../contexts';
import { BrandContext } from '../../../contexts/BrandContext';
import { SidebarContext } from '../../../contexts/SidebarContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { FlexContainer, Text } from '../../../styled/Common';
import {
    ItemContainer,
    MainItemContainer,
} from '../../../styled/Components/Sidebar';
import {
    linkGenMethodsIF,
    pageNames,
    useLinkGen,
} from '../../../utils/hooks/useLinkGen';
import { useMediaQuery } from '../../../utils/hooks/useMediaQuery';
import TokenIcon from '../TokenIcon/TokenIcon';
import FavButton from './FavButton';

interface propsIF {
    pool: PoolIF;
    spotPrice: number | undefined;
}

export default function PoolsListItem(props: propsIF) {
    const { pool, spotPrice } = props;
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const {
        activeNetwork: { chainId, poolIndex },
    } = useContext(AppStateContext);
    const { favePools } = useContext(UserPreferenceContext);
    const { platformName } = useContext(BrandContext);
    const isFuta = platformName.toLowerCase() === 'futa';

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
    const poolData = useFetchPoolStats(pool, spotPrice);

    const {
        poolPrice,
        poolTvl,
        poolVolume24h,
        poolPriceChangePercent,
        isPoolPriceChangePositive,
        baseLogoUri,
        quoteLogoUri,
    } = poolData;

    const { pathname } = useLocation();

    const navTarget = useMemo<pageNames>(() => {
        if (isFuta) return 'swap';
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
    }, [pathname, isFuta]);

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
            {!mobileScreen && !isFuta && (
                <FlexContainer gap={4}>
                    <TokenIcon
                        token={
                            isBaseTokenMoneynessGreaterOrEqual
                                ? pool.quote
                                : pool.base
                        }
                        src={uriToHttp(
                            (isBaseTokenMoneynessGreaterOrEqual
                                ? quoteLogoUri
                                : baseLogoUri) ?? '...',
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
                                ? baseLogoUri
                                : quoteLogoUri) ?? '...',
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

    const priceChangeDisplay = (
        <Text
            color={
                poolPriceChangePercent?.toLowerCase().includes('change')
                    ? 'white'
                    : isPoolPriceChangePositive
                      ? 'positive'
                      : 'negative'
            }
        >
            {poolPriceChangePercent}
        </Text>
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
                    `${poolPrice ?? '...'}`,
                    `${poolVolume24h ? '$' + poolVolume24h : '...'}`,
                    `${poolTvl ? '$' + poolTvl : '...'}`,

                    poolPrice === undefined ||
                    poolPriceChangePercent === undefined
                        ? '…'
                        : priceChangeDisplay,
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
