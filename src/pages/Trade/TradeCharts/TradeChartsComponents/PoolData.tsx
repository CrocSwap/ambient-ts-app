import React, { useContext, useEffect } from 'react';
import { FlexContainer, Text } from '../../../../styled/Common';
import { textColors } from '../../../../styled/Common/Types';
import styled from 'styled-components';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { PoolContext } from '../../../../contexts/PoolContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
interface PairDataItemIF {
    label: string;
    value: string;
    color?: textColors | 'white';
    onClick?: () => void;
}
interface PoolDataIF {
    poolPrice: string;
    poolPriceChangeString: string;
    toggleDidUserFlipDenom: () => void;
    isPoolPriceChangePositive: boolean;
}

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
export default function PoolData(props: PoolDataIF) {
    // eslint-disable-next-line
    const contentWrapper = React.useRef<any>(null);
    const { poolData } = useContext(PoolContext);
    const { liquidityFee } = useContext(GraphDataContext);

    const { poolTvl, poolFeesTotal, poolVolume24h } = poolData;
    const liquidityProviderFeeString = (liquidityFee * 100).toLocaleString(
        'en-US',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    const {
        poolPrice,
        poolPriceChangeString,
        toggleDidUserFlipDenom,
        isPoolPriceChangePositive,
    } = props;

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
                    width: '90px',
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
            value: poolPrice ? `${poolPrice}` : '...',
            onClick: () => toggleDidUserFlipDenom(),
        },
        {
            label: '24h Change',
            value: `${poolPriceChangeString}`,
            color: isPoolPriceChangePositive ? 'positive' : 'negative',
        },

        {
            label: '24h Volume',
            value: poolVolume24h ? `$${poolVolume24h.toString()}` : '...',
        },
        {
            label: 'TVL',
            value: poolTvl ? `$${poolTvl?.toString()}` : '...',
        },
        {
            label: 'Fee Rate',
            value: `${liquidityProviderFeeString?.toString() || '...'}%`,
        },

        {
            label: 'Total Fees',
            value: poolFeesTotal ? `$${poolFeesTotal?.toString()}` : '...',
        },

        // { label: 'FDV', value: '...' },
        // { label: 'Pool Created', value: '...' },
        // { label: 'Token Taxes', value: '...' },
    ];

    useEffect(
        () => console.log('here', contentWrapper.current),
        [contentWrapper.current],
    );

    const trial = (
        <FlexContainer flexDirection='row'>
            <FaAngleLeft
                onClick={() => {
                    sideScroll(contentWrapper.current, 25, 100, -80);
                }}
            />

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

            <FaAngleRight
                onClick={() => {
                    sideScroll(contentWrapper.current, 25, 100, 80);
                }}
            />
        </FlexContainer>
    );

    const example = false;
    if (example) return trial;

    return (
        <FlexContainer flexDirection='row'>
            {pairItemData.map((item) => (
                <PairDataItem
                    key={item.label + item.value}
                    label={item.label}
                    value={item.value}
                    color={item.color as textColors}
                    onClick={item?.onClick}
                />
            ))}
        </FlexContainer>
    );
}

const ContentWrapper = styled.div`
    display: flex;
    overflow: hidden;
    width: 100%;
    border-radius: 10px;
    background-image: @media only screen and (min-width: 1400px) {
        width: 100%;
    }
`;
