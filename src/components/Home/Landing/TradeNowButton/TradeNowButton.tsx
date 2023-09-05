import React from 'react';
import { FlexContainer } from '../../../../styled/Common';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import {
    StyledLink,
    TradeNowButtonText,
} from '../../../../styled/Components/Home';

interface propsIF {
    inNav?: boolean;
}

export default function TradeNowButton(props: propsIF) {
    const { inNav } = props;
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    return (
        <StyledLink
            to={showMobileVersion ? '/trade' : '/trade/market'}
            tabIndex={0}
            aria-label='Go to trade page button'
            inNav={inNav}
        >
            <FlexContainer
                fullHeight
                fullWidth
                justifyContent='center'
                alignItems='center'
                rounded
                background='dark2'
            >
                <TradeNowButtonText
                    fontWeight='300'
                    font='font-logo'
                    fontSize='header2'
                    color='accent1'
                    inNav={inNav}
                >
                    Trade Now
                </TradeNowButtonText>
            </FlexContainer>
        </StyledLink>
    );
}
