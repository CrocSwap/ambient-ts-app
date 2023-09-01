import { useContext } from 'react';
import { GridContainer, ScrollContainer } from '../../../styled/Common';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { MainSection } from './TableInfo.styles';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import useFetchPoolStats from '../../../App/hooks/useFetchPoolStats';
import { PoolIF } from '../../../utils/interfaces/PoolIF';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';

import { DetailedBox } from './DetailedBox';
import { FeaturedBox } from './FeaturedBox';

export default function TableInfo() {
    const { tradeData } = useAppSelector((state) => state);
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const denomInBase = tradeData.isDenomBase;

    const pool: PoolIF = {
        base: tradeData.baseToken,
        quote: tradeData.quoteToken,
        chainId: chainId,
        poolIdx: 36000,
    };

    const poolData = useFetchPoolStats(pool);

    const {
        poolTvl,
        baseTvlDecimal,
        quoteTvlDecimal,
        quoteTvlUsd,
        baseTvlUsd,
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
                                label='TVL'
                                value={`$${poolTvl?.toString() || '...'}`}
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
