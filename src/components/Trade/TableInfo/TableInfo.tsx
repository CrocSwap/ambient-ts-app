import { useContext } from 'react';
import { GridContainer, ScrollContainer } from '../../../styled/Common';
import { FiExternalLink } from 'react-icons/fi';
import trimString from '../../../utils/functions/trimString';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import {
    MainSection,
    BoxContainer,
    FeaturedBoxInfoContainer,
    InfoHeader,
    FeaturedBoxInnerContainer,
    FlexCenter,
    TokenName,
    TokenSymbol,
    BoxInfoText,
    LinkText,
    TabPlaceholder,
    DetailedBoxContainer,
} from './TableInfo.styles';
import TableInfoTabs from './TableInfoTabs';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { getChainExplorer } from '../../../utils/data/chains';
import useFetchPoolStats from '../../../App/hooks/useFetchPoolStats';
import { PoolIF } from '../../../utils/interfaces/PoolIF';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import { ZERO_ADDRESS } from '../../../constants';
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

export default function TableInfo() {
    const { tradeData } = useAppSelector((state) => state);
    const {
        chainData: { chainId, addrs },
    } = useContext(CrocEnvContext);
    const blockExplorer = getChainExplorer(chainId);

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

    const [topToken, bottomToken]: [TokenIF, TokenIF] = denomInBase
        ? [tradeData.baseToken, tradeData.quoteToken]
        : [tradeData.quoteToken, tradeData.baseToken];

    const detailedData = [
        { label: 'Market Cap:', value: '$69m' },
        { label: 'FDV:', value: '$690m' },
        { label: '24h Volume:', value: '$6.93k' },
        { label: 'TVL:', value: poolTvl },
        { label: 'Total Fees:', value: '$6.93k' },
        { label: 'Tick Liquidity:', value: '$500k' },
        { label: 'Out of Range Liq:', value: '20%' },
        { label: 'Pool Created:', value: '15/07/2022' },
    ];
    const featuredData = [
        {
            tokenLogo: topToken.logoURI,
            tokenSymbol: topToken.symbol,
            tokenName: topToken.name,
            tokenAddress: topToken.address,
            balance: getFormattedNumber({ value: topTokenTvl }),
            value: getFormattedNumber({ value: topTokenTvlUsd }),
        },
        {
            tokenLogo: bottomToken.logoURI,
            tokenSymbol: bottomToken.symbol,
            tokenName: bottomToken.name,
            tokenAddress: bottomToken.address,
            balance: getFormattedNumber({ value: bottomTokenTvl }),
            value: getFormattedNumber({ value: bottomTokenTvlUsd }),
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
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50px',
                            }}
                        />
                        <TokenSymbol>{tokenSymbol}</TokenSymbol>
                        <TokenName>{tokenName}</TokenName>
                    </FlexCenter>
                    <FlexCenter>
                        <InfoHeader>
                            {trimString(tokenAddress, 5, 6, '…')}
                        </InfoHeader>
                        <LinkText>
                            <a
                                href={
                                    tokenAddress === ZERO_ADDRESS
                                        ? `${blockExplorer}address/${addrs.dex}`
                                        : `${blockExplorer}token/${tokenAddress}`
                                }
                                target='_blank'
                                rel='noreferrer'
                            >
                                <FiExternalLink />
                            </a>
                        </LinkText>
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

    const temp = true;
    if (temp)
        return (
            <MainSection>
                <ScrollContainer>
                    <GridContainer numCols={2} gapSize={8} height={200}>
                        <GridContainer numCols={2} gapSize={8}>
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

                        <GridContainer gapSize={28} customRows='46px 46px auto'>
                            <GridContainer numCols={4} gapSize={8}>
                                {/* first 4 row items go here */}
                                <DetailedBox
                                    label='TVL'
                                    value={`$${poolTvl?.toString() || '...'}`}
                                />
                            </GridContainer>
                            {/* second 4 row items go here */}
                            <GridContainer
                                numCols={4}
                                gapSize={8}
                            ></GridContainer>
                        </GridContainer>
                    </GridContainer>
                </ScrollContainer>
            </MainSection>
        );

    // Leave this as it is. This is the completed UI
    return (
        <MainSection>
            <ScrollContainer>
                <GridContainer numCols={2} gapSize={8} height={200}>
                    <GridContainer numCols={2} gapSize={8}>
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
