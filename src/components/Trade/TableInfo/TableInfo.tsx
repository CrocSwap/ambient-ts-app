import { useContext } from 'react';
import { GridContainer, ScrollContainer } from '../../../styled/Common';

import { MainSection } from './TableInfo.styles';

import { getFormattedNumber } from '../../../ambient-utils/dataLayer';

import { DetailedBox } from './DetailedBox';
import { FeaturedBox } from './FeaturedBox';
import { PoolContext } from '../../../contexts/PoolContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { GraphDataContext } from '../../../contexts/GraphDataContext';

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
        apr24h,
        poolFees24h,
    } = poolData;

    const smallScreen = useMediaQuery('(max-width: 500px)');

    const featuredData = [
        {
            token: baseToken,
            balance: getFormattedNumber({ value: baseTvlDecimal }),
            value: getFormattedNumber({ value: baseTvlUsd }),
        },
        {
            token: quoteToken,
            balance: getFormattedNumber({ value: quoteTvlDecimal }),
            value: getFormattedNumber({ value: quoteTvlUsd }),
        },
    ];

    const liquidityProviderFeeString = (liquidityFee * 100).toLocaleString(
        'en-US',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    const aprString = apr24h
        ? apr24h === '0.00'
            ? '< 0.01%'
            : apr24h + '%'
        : '...';

    return (
        <MainSection>
            <ScrollContainer>
                <GridContainer
                    numCols={smallScreen ? 1 : 2}
                    gap={8}
                    height={'200px'}
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
                        <GridContainer numCols={4} gap={8}>
                            {/* first 4 row items go here */}
                            <DetailedBox
                                label='Total Vol.'
                                value={`$${poolVolume?.toString() || '...'}`}
                            />
                            <DetailedBox
                                label='24h Vol.'
                                value={`$${poolVolume24h?.toString() || '...'}`}
                            />
                            <DetailedBox
                                label='TVL'
                                value={`$${poolTvl?.toString() || '...'}`}
                            />
                            <DetailedBox
                                label='Total Fees'
                                value={`$${poolFeesTotal?.toString() || '...'}`}
                            />
                            <DetailedBox
                                label='24h Fees'
                                value={`$${poolFees24h?.toString() || '...'}`}
                            />
                            <DetailedBox
                                label='Current Fee Rate'
                                value={`${
                                    liquidityProviderFeeString?.toString() ||
                                    '...'
                                }%`}
                            />
                            <DetailedBox label='24h APR' value={aprString} />
                            {baseTokenFdvDisplay && (
                                <DetailedBox
                                    label={`${baseToken.symbol} FDV`}
                                    value={baseTokenFdvDisplay}
                                />
                            )}
                            {quoteTokenFdvDisplay && (
                                <DetailedBox
                                    label={`${quoteToken.symbol} FDV`}
                                    value={quoteTokenFdvDisplay}
                                />
                            )}
                        </GridContainer>
                        {/* second 4 row items go here */}
                        <GridContainer numCols={4} gap={8}></GridContainer>
                    </GridContainer>
                </GridContainer>
            </ScrollContainer>
        </MainSection>
    );
}
