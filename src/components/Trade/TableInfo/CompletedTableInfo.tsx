// This is currently not in use. It is simply the completed UI for the table Info. We will ureplace TableInfo with this once we have all the data. For now, leave this file as it is.

import { GridContainer, ScrollContainer } from '../../../styled/Common';
import { DetailedBox } from './DetailedBox';
import { MainSection, TabPlaceholder } from './TableInfo.styles';
import TableInfoTabs from './TableInfoTabs';

// TODO: DO NOT DELETE THIS FILE

function CompletedTableInfo() {
    const detailedData = [
        { label: 'Market Cap:', value: '$69m' },
        { label: 'FDV:', value: '$690m' },
        { label: '24h Volume:', value: '$6.93k' },
        { label: 'TVL:', value: '234.22' },
        { label: 'Total Fees:', value: '$6.93k' },
        { label: 'Tick Liquidity:', value: '$500k' },
        { label: 'Out of Range Liq:', value: '20%' },
        { label: 'Pool Created:', value: '15/07/2022' },
    ];

    return (
        <MainSection>
            <ScrollContainer>
                <GridContainer numCols={2} gapSize={8} height={200}>
                    <GridContainer numCols={2} gapSize={8}>
                        {/* {featuredData.map((data, idx) => (
                                <FeaturedBox
                                    key={idx}
                                    token={data.token}
                                    balance={data.balance}
                                    value={data.value}
                                />
                            ))} */}
                    </GridContainer>

                    <GridContainer gapSize={28} customRows='46px 46px auto'>
                        <GridContainer numCols={4} gapSize={8}>
                            {detailedData.slice(0, 4).map((data, idx) => (
                                <DetailedBox
                                    label={data.label}
                                    value={data.label}
                                    key={idx}
                                />
                            ))}
                        </GridContainer>
                        <GridContainer numCols={4} gapSize={8}>
                            {detailedData
                                .slice(4, detailedData.length)
                                .map((data, idx) => (
                                    <DetailedBox
                                        label={data.label}
                                        value={data.label}
                                        key={idx}
                                    />
                                ))}
                        </GridContainer>

                        <TabPlaceholder>
                            <TableInfoTabs />
                        </TabPlaceholder>
                    </GridContainer>
                </GridContainer>
            </ScrollContainer>
        </MainSection>
    );
}
