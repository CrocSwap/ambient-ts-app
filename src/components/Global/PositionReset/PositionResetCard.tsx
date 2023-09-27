import { FlexContainer, GridContainer, Text } from '../../../styled/Common';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import TokenIcon from '../TokenIcon/TokenIcon';

import styled from 'styled-components';
export default function PositionResetCard() {
    const ResetButton = styled.div`
        cursor: pointer;
        height: 23px;
        line-height: var(--body-lh);
        font-size: var(--body-size);
        white-space: nowrap;
        padding: 5px 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--accent1);
        border: 1px solid var(--accent1);
        border-radius: 50px;
        transition: all var(--animation-speed) ease-in-out;
        z-index: 2;

        &:hover {
            color: var(--dark1);
            background: var(--accent1);
        }
    `;

    const shouldInvertDisplay = false;
    const tradeData = useAppSelector((state) => state.tradeData);
    const tokenA = shouldInvertDisplay ? tradeData.tokenB : tradeData.tokenA;
    const tokenB = !shouldInvertDisplay ? tradeData.tokenB : tradeData.tokenA;

    const tokensDisplay = (
        <FlexContainer gap={8} flexDirection='row'>
            <TokenIcon
                token={tokenA}
                size='2xl'
                src={uriToHttp(tokenA.logoURI)}
                alt={tokenA.symbol}
            />
            <TokenIcon
                token={tokenB}
                size='2xl'
                src={uriToHttp(tokenB.logoURI)}
                alt={tokenB.symbol}
            />
        </FlexContainer>
    );

    return (
        <GridContainer
            gap={8}
            customCols='80px 127px 63.5px 63.5px 48px'
            style={{ alignItems: 'center' }}
        >
            {tokensDisplay}

            <Text
                tabIndex={0}
                fontWeight='300'
                color='text1'
                style={{
                    fontSize: 'var(--body-size)',
                    lineHeight: 'var(--body-lh)',
                    textAlign: 'center',
                }}
            >
                Pool
            </Text>
            <Text
                tabIndex={0}
                fontWeight='300'
                color='accent5'
                style={{
                    fontSize: 'var(--body-size)',
                    lineHeight: 'var(--body-lh)',
                    textAlign: 'end',
                }}
            >
                Min
            </Text>
            <Text
                tabIndex={0}
                fontWeight='300'
                color='accent5'
                style={{
                    fontSize: 'var(--body-size)',
                    lineHeight: 'var(--body-lh)',
                    textAlign: 'end',
                }}
            >
                Min
            </Text>
            <ResetButton>Reset</ResetButton>
        </GridContainer>
    );
}
