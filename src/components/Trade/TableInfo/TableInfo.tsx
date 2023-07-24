import styled, { css } from 'styled-components';

interface FeaturedBoxPropsIF {
    tokenLogo: string;
    tokenSymbol: string;
    tokenName: string;
    tokenAddress: string;
    balance: string;
    value: string;
}
interface DetailedBoxPropsIF {
    label: string;
    value: string;
}
// can be extracted to common

interface GridContainerProps {
    numCols?: number;
    numRows?: number;
    gapSize?: number;
    fullHeight?: boolean;
}
const GridContainer = styled.div<GridContainerProps>`
    display: grid;
    grid-template-columns: ${({ numCols }) =>
        numCols ? `repeat(${numCols}, 1fr)` : 'auto'};
    grid-template-rows: ${({ numRows }) =>
        numRows ? `repeat(${numRows}, 1fr)` : 'auto'};
    gap: ${({ gapSize }) => (gapSize ? `${gapSize}px` : '0')};
    ${({ fullHeight }) => (fullHeight ? 'height: 100%;' : '')}
`;

export default function TableInfo() {
    const detailedData = [
        { label: 'Market Cap:', value: '$69m' },
        { label: 'FDV:', value: '$690m' },
        { label: '24h Swap Volume:', value: '$6.93k' },
        { label: 'Total Fees:', value: '$6.93k' },
        { label: 'TVL:', value: '$2.27m' },
        { label: 'Tixk Liquidity:', value: '$500k' },
        { label: 'Out of Range Liq:', value: '20%' },
        { label: 'Pool Created:', value: '15/07/2022' },
    ];
    const featuredData = [
        {
            tokenLogo: 'https://via.placeholder.com/30',
            tokenSymbol: 'ETH',
            tokenName: 'Ethereum',
            tokenAddress: 'ffhei23ifvhdfd',
            balance: '169.00',
            value: '420,000',
        },
        {
            tokenLogo: 'https://via.placeholder.com/30',
            tokenSymbol: 'USDC',
            tokenName: 'Usd coin',
            tokenAddress: 'ffhei23ifvhdfd',
            balance: '420,000.00',
            value: '420,000',
        },
    ];
    function FeaturedBox(props: FeaturedBoxPropsIF) {
        const {
            tokenLogo,
            tokenSymbol,
            tokenName,
            tokenAddress,
            balance,
            value,
        } = props;
        return (
            <BoxContainer>
                <FeaturedBoxInnerContainer>
                    <FlexCenter>
                        <img
                            src={tokenLogo}
                            alt='Logo'
                            style={{ width: '1.5rem', height: '1.5rem' }}
                        />
                        <TokenSymbol>{tokenSymbol}</TokenSymbol>
                        <TokenName>{tokenName}</TokenName>
                    </FlexCenter>
                    <FlexCenter>
                        <InfoHeader>{tokenAddress}</InfoHeader>
                        <LinkText>Link</LinkText>
                    </FlexCenter>
                    <FeaturedBoxInfoContainer>
                        <InfoHeader>Balance</InfoHeader>
                        <BoxInfoText>{balance}</BoxInfoText>
                    </FeaturedBoxInfoContainer>
                    <FeaturedBoxInfoContainer>
                        <InfoHeader>Value</InfoHeader>
                        <BoxInfoText>${value}</BoxInfoText>
                    </FeaturedBoxInfoContainer>
                </FeaturedBoxInnerContainer>
            </BoxContainer>
        );
    }
    function DetailedBox(props: DetailedBoxPropsIF) {
        const { label, value } = props;
        return (
            <BoxContainer>
                <DetailedBoxContainer>
                    <InfoHeader>{label}</InfoHeader>
                    <BoxInfoText>{value}</BoxInfoText>
                </DetailedBoxContainer>
            </BoxContainer>
        );
    }
    return (
        <section style={{ height: '100%' }}>
            <GridContainer numCols={2} gapSize={2} fullHeight>
                <GridContainer numCols={2} gapSize={2}>
                    {featuredData.map((data, idx) => (
                        <FeaturedBox
                            key={idx}
                            tokenLogo={data.tokenLogo}
                            tokenSymbol={data.tokenSymbol}
                            tokenName={data.tokenName}
                            tokenAddress={data.tokenAddress}
                            balance={data.balance}
                            value={data.value}
                        />
                    ))}
                </GridContainer>

                <GridContainer numRows={3} gapSize={2}>
                    <GridContainer numCols={4} gapSize={2}>
                        {detailedData.slice(0, 4).map((data, idx) => (
                            <DetailedBox
                                label={data.label}
                                value={data.value}
                                key={idx}
                            />
                        ))}
                    </GridContainer>
                    <GridContainer numCols={4} gapSize={2}>
                        {detailedData
                            .slice(4, detailedData.length)
                            .map((data, idx) => (
                                <DetailedBox
                                    label={data.label}
                                    value={data.value}
                                    key={idx}
                                />
                            ))}
                    </GridContainer>
                    <div>
                        <TabPlaceholder>
                            This is where the tabs go
                        </TabPlaceholder>
                    </div>
                </GridContainer>
            </GridContainer>
        </section>
    );
}

const BoxContainer = styled.div`
    grid-column: span 1;
    background-color: var(--dark3);
    border-radius: 0.25rem;
`;

const FeaturedBoxInnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
`;

const InfoHeader = styled.div`
    color: var(--text2);
    font-size: var(--body-size);
    line-height: var(--body-lh);
`;

const FlexCenter = styled.div`
    display: flex;
    align-items: center;
`;

const FeaturedBoxInfoContainer = styled.div`
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;
const TokenSymbol = styled.p`
    margin-left: 0.5rem;
    color: var(--header2-size);
    font-weight: 100;
`;

const TokenName = styled.p`
    margin-left: 0.5rem;
    font-size: var(--body-size);
    color: var(--text2);
`;

const BoxInfoText = styled.p`
    color: var(--header2-size);
    font-weight: 100;

    color: var(--text1);
`;

const LinkText = styled.a`
    margin-left: 0.5rem;
    font-size: var(--body-size);
    color: var(--accent1);
`;

const DetailedBoxContainer = styled.div`
    display: flex;
    padding: 1rem;
    margin-top: 0.5rem;
    flex-direction: column;
    gap: 0.5rem;
`;

const TabPlaceholder = styled.div`
    grid-column: span 1;
    background-color: var(--dark3);
    height: 100%;
`;
