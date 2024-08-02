import React, { useContext } from 'react';
import { FlexContainer } from '../../../../styled/Common';
import {
    StyledLink,
    TradeNowButtonText,
} from '../../../../styled/Components/Home';
import { chainNumToString } from '../../../../ambient-utils/dataLayer';
import {
    linkGenMethodsIF,
    marketParamsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';

interface propsIF {
    fieldId: string;
    inNav?: boolean;
}

export default function TradeNowButton(props: propsIF) {
    const { fieldId, inNav } = props;
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenSwap: linkGenMethodsIF = useLinkGen('swap');

    const { isActiveNetworkPlume } = useContext(ChainDataContext);

    const { tokenA, tokenB } = useContext(TradeDataContext);

    const tradeButtonParams: marketParamsIF = {
        chain: chainNumToString(tokenA.chainId),
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    };
    return (
        <StyledLink
            id={fieldId}
            to={
                isActiveNetworkPlume
                    ? linkGenSwap.getFullURL(tradeButtonParams)
                    : linkGenMarket.getFullURL(tradeButtonParams)
            }
            tabIndex={0}
            aria-label='Go to trade page button'
            inNav={inNav}
            isPlume={isActiveNetworkPlume}
        >
            <FlexContainer
                fullHeight
                fullWidth
                justifyContent='center'
                alignItems='center'
                rounded
                background={!isActiveNetworkPlume ? 'dark2' : undefined}
                style={{
                    color: isActiveNetworkPlume ? 'var(--text1)' : 'none',
                }}
            >
                <TradeNowButtonText
                    fontWeight='300'
                    font='font-logo'
                    fontSize='header2'
                    color={isActiveNetworkPlume ? 'text1' : 'accent1'}
                    inNav={inNav}
                >
                    {isActiveNetworkPlume ? 'Swap Now' : 'Trade Now'}
                </TradeNowButtonText>
            </FlexContainer>
        </StyledLink>
    );
}
