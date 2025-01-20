import { useContext } from 'react';
import { FlexContainer, GridContainer } from '../../../styled/Common';

import { MainSection } from './TableInfo.styles';

import { getFormattedNumber } from '../../../ambient-utils/dataLayer';

import { GraphDataContext } from '../../../contexts/GraphDataContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { useMediaQuery } from '../../../utils/hooks/useMediaQuery';
import { DetailedBox } from './DetailedBox';
import { FeaturedBox } from './FeaturedBox';

export default function TableInfo() {
    const { baseToken, quoteToken } = useContext(TradeDataContext);
    const { poolData, baseTokenFdvDisplay, quoteTokenFdvDisplay } =
        useContext(PoolContext);
    const { liquidityFee } = useContext(GraphDataContext);

    const {
        poolTvl,
        baseTvlDecimal,
        quoteTvlDecimal,
        quoteTvlUsd,
        baseTvlUsd,
        poolFeesTotal,
        poolVolume,
        poolVolume24h,
        apr,
        poolFees24h,
    } = poolData;

    const smallScreen = useMediaQuery('(max-width: 500px)');

    const featuredData = [
        {
            token: baseToken,
            balance: getFormattedNumber({ value: baseTvlDecimal }),
            value: baseTvlUsd
                ? getFormattedNumber({ value: baseTvlUsd })
                : undefined,
        },
        {
            token: quoteToken,
            balance: getFormattedNumber({ value: quoteTvlDecimal }),
            value: quoteTvlUsd
                ? getFormattedNumber({ value: quoteTvlUsd })
                : undefined,
        },
    ];

    const liquidityProviderFeeString = liquidityFee
        ? (liquidityFee * 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + '%'
        : undefined;

    const aprString = apr ? (apr === '0.00' ? '< 0.01%' : apr + '%') : '...';

    return (
        <MainSection>
            <FlexContainer
                className='custom_scroll_ambient'
                fullWidth
                fullHeight
                style={{ overflow: 'hidden' }}
            >
                <GridContainer
                    numCols={smallScreen ? 1 : 2}
                    gap={8}
                    height={'200px'}
                    fullWidth
                >
                    <GridContainer numCols={2} gap={8}>
                        {featuredData.map((data, idx) => (
                            <FeaturedBox
                                key={idx}
                                token={data.token}
                                balance={data.balance}
                                value={data.value}
                            />
                        ))}
                    </GridContainer>

                    <GridContainer gap={28} customRows='46px 46px auto'>
                        <GridContainer numCols={smallScreen ? 2 : 4} gap={8}>
                            {/* first 4 row items go here */}
                            <DetailedBox
                                label='Total Vol.'
                                value={
                                    poolVolume
                                        ? `$${poolVolume?.toString()}`
                                        : '...'
                                }
                                tooltipText='Total volume since pool initialization'
                            />
                            <DetailedBox
                                label='24h Vol.'
                                value={
                                    poolVolume24h
                                        ? `$${poolVolume24h?.toString()}`
                                        : '...'
                                }
                                tooltipText='Total volume in the last 24 hours'
                            />
                            <DetailedBox
                                label='TVL'
                                value={
                                    poolTvl ? `$${poolTvl?.toString()}` : '...'
                                }
                                tooltipText='Total value locked in the pool'
                            />
                            <DetailedBox
                                label='Total Fees'
                                value={
                                    poolFeesTotal
                                        ? `$${poolFeesTotal?.toString()}`
                                        : '...'
                                }
                                tooltipText='Total fees collected since pool initialization'
                            />
                            <DetailedBox
                                label='24h Fees'
                                value={
                                    poolFees24h
                                        ? `$${poolFees24h?.toString()}`
                                        : '...'
                                }
                                tooltipText='Total fees collected in the last 24 hours'
                            />
                            <DetailedBox
                                label='Current Fee Rate'
                                value={`${
                                    liquidityProviderFeeString?.toString() ||
                                    '...'
                                }`}
                                tooltipText={`This is a dynamically updated rate to reward ${quoteToken.symbol} / ${baseToken.symbol} liquidity providers`}
                            />
                            <DetailedBox
                                label='APR'
                                value={aprString}
                                tooltipText={
                                    <>
                                        <div>
                                            Annual Percentage Rate (APR) is
                                            estimated using the following
                                            formula: 24h Fees / TVL × 365
                                        </div>
                                        <div>{' '}</div>
                                        <div>
                                            This estimate is based on historical
                                            data. Past performance does not
                                            guarantee future results.
                                        </div>
                                    </>
                                }
                            />
                            {baseTokenFdvDisplay && (
                                <DetailedBox
                                    label={`${baseToken.symbol} FDV`}
                                    value={baseTokenFdvDisplay}
                                    tooltipText={`Fully Diluted Value (FDV) is the product of the total supply of ${baseToken.symbol} and the current market price of ${baseToken.symbol}.`}
                                />
                            )}
                            {quoteTokenFdvDisplay && (
                                <DetailedBox
                                    label={`${quoteToken.symbol} FDV`}
                                    value={quoteTokenFdvDisplay}
                                    tooltipText={`Fully Diluted Value (FDV) is the product of the total supply of ${quoteToken.symbol} and the current market price of ${quoteToken.symbol}.`}
                                />
                            )}
                        </GridContainer>
                        {/* second 4 row items go here */}
                        <GridContainer numCols={4} gap={8}></GridContainer>
                    </GridContainer>
                </GridContainer>
            </FlexContainer>
        </MainSection>
    );
}
