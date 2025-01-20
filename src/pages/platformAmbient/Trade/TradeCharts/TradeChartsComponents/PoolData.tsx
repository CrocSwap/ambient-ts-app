import React, { useContext } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import styled from 'styled-components';
import { GraphDataContext } from '../../../../../contexts/GraphDataContext';
import { PoolContext } from '../../../../../contexts/PoolContext';
import { FlexContainer, Text } from '../../../../../styled/Common';
import { textColors } from '../../../../../styled/Common/Types';
import { useMediaQuery } from '../../../../../utils/hooks/useMediaQuery';
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
    const { poolData, fdvOfDenomTokenDisplay } = useContext(PoolContext);
    const { liquidityFee } = useContext(GraphDataContext);

    const { poolTvl, poolFeesTotal, poolVolume24h } = poolData;
    const liquidityProviderFeeString = liquidityFee
        ? (liquidityFee * 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + '%'
        : '...';

    const {
        poolPrice,
        poolPriceChangeString,
        toggleDidUserFlipDenom,
        isPoolPriceChangePositive,
    } = props;

    const mobileView = useMediaQuery('(max-width: 500px)');
    const tabletView = useMediaQuery(
        '(min-width: 768px) and (max-width: 1200px)',
    );

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
                    width: mobileView ? 'auto' : tabletView ? '75px' : '90px',
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
            value: `${liquidityProviderFeeString?.toString()}`,
        },

        {
            label: 'Total Fees',
            value: poolFeesTotal ? `$${poolFeesTotal?.toString()}` : '...',
        },

        // { label: 'Pool Created', value: '...' },
        // { label: 'Token Taxes', value: '...' },
    ];

    if (fdvOfDenomTokenDisplay) {
        pairItemData.push({
            label: 'FDV',
            value: fdvOfDenomTokenDisplay,
        });
    }

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
        <MainContainer>
            {pairItemData.map((item) => (
                <PairDataItem
                    key={item.label + item.value}
                    label={item.label}
                    value={item.value}
                    color={item.color as textColors}
                    onClick={item?.onClick}
                />
            ))}
        </MainContainer>
    );
}
const MainContainer = styled.div`
    display: flex;
    flex-direction: row;

    @media only screen and (max-width: 500px) {
        width: 100px;
        overflow-x: scroll;
        gap: 1rem;
    }
`;

const ContentWrapper = styled.div`
    display: flex;
    overflow: hidden;
    width: 100%;
    border-radius: 10px;
    background-image: @media only screen and (min-width: 1400px) {
        width: 100%;
    }
`;
