import { useContext } from 'react';
import { GridContainer, ScrollContainer } from '../../../styled/Common';
import { FiExternalLink, FiCopy } from 'react-icons/fi';
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
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { DetailedBox } from './DetailedBox';
interface FeaturedBoxPropsIF {
    token: TokenIF;
    balance: string;
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

    const [topToken, bottomToken]: [TokenIF, TokenIF] = [
        tradeData.baseToken,
        tradeData.quoteToken,
    ];
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

    const [_, copy] = useCopyToClipboard();

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    function FeaturedBox(props: FeaturedBoxPropsIF) {
        const { token, balance, value } = props;

        function handleCopyAddress() {
            copy(token.address);
            openSnackbar(`${token.address} copied`, 'info');
        }
        return (
            <BoxContainer>
                <FeaturedBoxInnerContainer>
                    <FlexCenter>
                        <TokenIcon token={token} size={'3xl'} />
                        <TokenSymbol>{token.symbol}</TokenSymbol>
                        <TokenName>{token.name}</TokenName>
                    </FlexCenter>
                    <FlexCenter style={{ gap: '8px' }}>
                        <InfoHeader>
                            {trimString(token.address, 5, 6, '…')}
                        </InfoHeader>
                        <IconWithTooltip
                            title='Copy transaction hash to clipboard'
                            placement='bottom'
                        >
                            <div onClick={handleCopyAddress}>
                                <FiCopy size={16} color='var(--text3)' />
                            </div>
                        </IconWithTooltip>
                        <IconWithTooltip
                            title='View on Block Explorer'
                            placement='bottom'
                        >
                            <a
                                href={
                                    token.address === ZERO_ADDRESS
                                        ? `${blockExplorer}address/${addrs.dex}`
                                        : `${blockExplorer}token/${token.address}`
                                }
                                target='_blank'
                                rel='noreferrer'
                            >
                                <FiExternalLink />
                            </a>
                        </IconWithTooltip>
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
                                token={data.token}
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
