import { useContext } from 'react';
import { GridContainer, ScrollContainer } from '../../../styled/Common';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
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
        poolFeesTotal,
        poolVolume,
    } = poolData;

    const featuredData = [
        {
            token: tradeData.baseToken,
            balance: getFormattedNumber({ value: baseTvlDecimal }),
            value: getFormattedNumber({ value: baseTvlUsd }),
        },
        {
            token: tradeData.quoteToken,
            balance: getFormattedNumber({ value: quoteTvlDecimal }),
            value: getFormattedNumber({ value: quoteTvlUsd }),
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
