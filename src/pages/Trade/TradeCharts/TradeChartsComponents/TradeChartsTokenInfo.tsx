import { NoColorTooltip } from '../../../../components/Global/StyledTooltip/StyledTooltip';
import React, { memo, useContext, useRef, useState } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import TokenIcon from '../../../../components/Global/TokenIcon/TokenIcon';
import {
    getFormattedNumber,
    getUnicodeCharacter,
} from '../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../ambient-utils/types';
import { FlexContainer, Text } from '../../../../styled/Common';
import { HeaderButtons, HeaderText } from '../../../../styled/Components/Chart';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import DropdownSearch from '../../../../components/Global/DropdownSearch/DropdownSearch';
import { textColors } from '../../../../styled/Common/Types';
import styled from 'styled-components';
import PoolData from './PoolData';

interface PairDataItemIF {
    label: string;
    value: string;
    color?: textColors | 'white';
    onClick?: () => void;
}
function TradeChartsTokenInfo() {
    const { baseToken, quoteToken, isDenomBase } = useContext(TradeDataContext);
    const {
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);
    const {
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
        usdPrice,
        isTradeDollarizationEnabled,
        poolData,
    } = useContext(PoolContext);
    const { favePools } = useContext(UserPreferenceContext);
    const { toggleDidUserFlipDenom } = useContext(TradeDataContext);
    const { appHeaderDropdown } = useContext(AppStateContext);

    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    const searchDropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideWalletHandler = () => setShowSearchDropdown(false);

    useOnClickOutside(searchDropdownItemRef, clickOutsideWalletHandler);

    const denomInBase = isDenomBase;

    const [topToken, bottomToken]: [TokenIF, TokenIF] = denomInBase
        ? [baseToken, quoteToken]
        : [quoteToken, baseToken];

    const currencyCharacter = denomInBase
        ? // denom in a, return token b character
          getUnicodeCharacter(quoteToken.symbol)
        : // denom in b, return token a character
          getUnicodeCharacter(baseToken.symbol);

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : 0;

    const truncatedPoolPrice = getFormattedNumber({
        value: poolPriceDisplayWithDenom,
        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
    });

    const smallScrenView = useMediaQuery('(max-width: 968px)');

    const poolPrice = isTradeDollarizationEnabled
        ? usdPrice
            ? getFormattedNumber({ value: usdPrice, prefix: '$' })
            : '…'
        : poolPriceDisplay === Infinity ||
          poolPriceDisplay === 0 ||
          poolPriceDisplay === undefined
        ? '…'
        : `${currencyCharacter}${truncatedPoolPrice}`;

    console.log({ poolData });

    const currentAmountDisplay = (
        <span
            onClick={() => toggleDidUserFlipDenom()}
            style={{ cursor: 'pointer' }}
            aria-label={poolPrice}
        >
            {poolPrice}
        </span>
    );

    const poolPriceChangeString =
        poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent;

    const poolPriceChange = (
        <NoColorTooltip
            title={'24 hour price change'}
            interactive
            placement='right'
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <span
                style={
                    isPoolPriceChangePositive
                        ? {
                              color: 'var(--other-green)',
                              fontSize: '15px',
                          }
                        : {
                              color: 'var(--other-red)',
                              fontSize: '15px',
                          }
                }
                aria-label={`Pool price change is ${poolPriceChangeString}`}
            >
                {poolPriceChangeString}
            </span>
        </NoColorTooltip>
    );

    const denomToggleButton = (
        <FlexContainer gap={8}>
            <HeaderButtons
                id='token_pair_in_chart_header'
                aria-label='flip denomination.'
                onClick={() => toggleDidUserFlipDenom()}
            >
                <FlexContainer
                    id='trade_chart_header_token_pair_logos'
                    role='button'
                    gap={8}
                >
                    <TokenIcon
                        token={topToken}
                        src={topToken.logoURI}
                        alt={topToken.symbol}
                        size={smallScrenView ? 's' : 'l'}
                    />
                    <TokenIcon
                        token={bottomToken}
                        src={bottomToken.logoURI}
                        alt={bottomToken.symbol}
                        size={smallScrenView ? 's' : 'l'}
                    />
                </FlexContainer>
                <HeaderText
                    id='trade_chart_header_token_pair_symbols'
                    fontSize='header1'
                    fontWeight='300'
                    color='text1'
                    role='button'
                    aria-live='polite'
                    aria-atomic='true'
                    aria-relevant='all'
                >
                    {topToken.symbol} / {bottomToken.symbol}
                </HeaderText>
            </HeaderButtons>
            <DropdownSearch />
        </FlexContainer>
    );

    const sideScroll = (
        element: HTMLDivElement,
        speed: number,
        distance: number,
        step: number,
    ) => {
        let scrollAmount = 0;
        const slideTimer = setInterval(() => {
            element.scrollLeft += step;
            scrollAmount += Math.abs(step);
            if (scrollAmount >= distance) {
                clearInterval(slideTimer);
            }
        }, speed);
    };
    const contentWrapper = React.useRef<any>(null);

    function PairDataItem(props: PairDataItemIF) {
        const { label, value, color, onClick } = props;

        return (
            <FlexContainer
                fullHeight
                flexDirection='column'
                justifyContent='space-between'
                alignItems='center'
                gap={8}
                aria-label={`${label} is ${value}`}
                style={{
                    cursor: onClick ? 'pointer' : 'default',
                    minWidth: '80px',
                }}
                onClick={onClick ?? undefined}
            >
                <Text color='text2' fontSize='body'>
                    {label}
                </Text>
                <Text color={color ? color : 'white'} fontSize='body'>
                    {value}
                </Text>
            </FlexContainer>
        );
    }

    const pairItemData = [
        {
            label: 'Price',
            value: `$${poolPrice}`,
            onClick: () => toggleDidUserFlipDenom(),
        },
        {
            label: '24h Change',
            value: `${poolPriceChangeString}`,
            color: isPoolPriceChangePositive ? 'positive' : 'negative',
        },
        { label: '24h Volume', value: '...' },
        { label: 'TVL', value: '...' },
        { label: 'Fee Rate', value: '...' },
        { label: 'FDV', value: '...' },
        { label: 'Pool Created', value: '...' },
        { label: 'Token Taxes', value: '...' },
    ];

    const poolDataDisplay = pairItemData.map((item) => (
        <PairDataItem
            key={item.label + item.value}
            label={item.label}
            value={item.value}
            color={item.color as textColors}
            onClick={item?.onClick}
        />
    ));

    const trial = (
        <FlexContainer flexDirection='row'>
            <Button
                onClick={() => {
                    sideScroll(contentWrapper.current, 25, 100, -80);
                }}
            >
                Left
            </Button>

            <ContentWrapper ref={contentWrapper}>
                {pairItemData.map((item) => (
                    <PairDataItem
                        key={item.label + item.value}
                        label={item.label}
                        value={item.value}
                        color={item.color as textColors}
                        onClick={item?.onClick}
                    />
                ))}
            </ContentWrapper>

            <Button
                onClick={() => {
                    sideScroll(contentWrapper.current, 25, 100, 80);
                }}
            >
                Right
            </Button>
        </FlexContainer>
    );

    const poolDataProps = {
        poolPrice,
        poolPriceChangeString,
        isPoolPriceChangePositive,
        toggleDidUserFlipDenom,
    };
    return (
        // <>
        //     {trial}
        // </>
        <FlexContainer alignItems='center' gap={16}>
            {denomToggleButton}

            <PoolData {...poolDataProps} />
        </FlexContainer>
    );
}

export default memo(TradeChartsTokenInfo);

const Container = styled.div``;

interface ContentProps {
    url: string;
}

const Content = styled.div<ContentProps>`
    background-image: url(${(props) => props.url});
    width: 100px;
    height: 100px;
    background-size: cover;
    background-position: center;
    border-radius: 20px;
    flex-shrink: 0;
`;

const ContentWrapper = styled.div`
    display: flex;
    overflow: hidden;
    width: 50%;
    border-radius: 10px;
`;

const ButtonWrapper = styled.div`
    display: flex;
    width: 100%;
    margin-top: 20px;
    justify-content: space-between;
`;

const Button = styled.button`
    background: #ffffff;
    border: 0;
    color: #000000;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 15px;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
`;
