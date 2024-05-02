import React, { useEffect } from 'react';
import { FlexContainer, Text } from '../../../../styled/Common';
import { textColors } from '../../../../styled/Common/Types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
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
    const contentWrapper = React.useRef<any>(null);
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
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                layout
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
