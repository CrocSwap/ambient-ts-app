import { useContext } from 'react';
import { GridContainer, ScrollContainer } from '../../../styled/Common';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { MainSection } from './TableInfo.styles';

import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';

import { DetailedBox } from './DetailedBox';
import { FeaturedBox } from './FeaturedBox';
import { PoolContext } from '../../../contexts/PoolContext';

export default function TableInfo() {
    const { tradeData } = useAppSelector((state) => state);

    const denomInBase = tradeData.isDenomBase;

    const { poolData } = useContext(PoolContext);

    const {
        poolTvl,
        baseTvlDecimal,
        quoteTvlDecimal,
        quoteTvlUsd,
        baseTvlUsd,
        poolFeesTotal,
        poolVolume,
    } = poolData;

    const [topTokenTvl, bottomTokenTvl] = denomInBase
        ? [baseTvlDecimal, quoteTvlDecimal]
        : [quoteTvlDecimal, baseTvlDecimal];
    const [topTokenTvlUsd, bottomTokenTvlUsd] = denomInBase
        ? [baseTvlUsd, quoteTvlUsd]
        : [quoteTvlUsd, baseTvlUsd];

    const [topToken, bottomToken]: [TokenIF, TokenIF] = [
        tradeData.baseToken,
        tradeData.quoteToken,
    ];

    const featuredData = [
        {
            token: topToken,
            balance: getFormattedNumber({ value: topTokenTvl }),
            value: getFormattedNumber({ value: topTokenTvlUsd }),
        },
        {
            token: bottomToken,
            balance: getFormattedNumber({ value: bottomTokenTvl }),
            value: getFormattedNumber({ value: bottomTokenTvlUsd }),
        },
    ];

    return (
        <MainSection>
            <ScrollContainer>
                <GridContainer numCols={2} gapSize={8} height={200}>
                    <GridContainer numCols={2} gapSize={8}>
                        {featuredData.map((data, idx) => (
                            <FeaturedBox
                                key={idx}
                                token={data.token}
                                balance={data.balance}
                                value={data.value}
                            />
                        ))}
                    </GridContainer>

                    <GridContainer gapSize={28} customRows='46px 46px auto'>
                        <GridContainer numCols={4} gapSize={8}>
                            {/* first 4 row items go here */}
                            <DetailedBox
                                label='Total Vol.'
                                value={`$${poolVolume?.toString() || '...'}`}
                            />
                            <DetailedBox
                                label='TVL'
                                value={`$${poolTvl?.toString() || '...'}`}
                            />
                            <DetailedBox
                                label='Total Fees'
                                value={`$${poolFeesTotal?.toString() || '...'}`}
                            />
                        </GridContainer>
                        {/* second 4 row items go here */}
                        <GridContainer numCols={4} gapSize={8}></GridContainer>
                    </GridContainer>
                </GridContainer>
            </ScrollContainer>
        </MainSection>
    );
}
