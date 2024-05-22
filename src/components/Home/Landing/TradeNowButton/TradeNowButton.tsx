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

interface propsIF {
    fieldId: string;
    inNav?: boolean;
}

export default function TradeNowButton(props: propsIF) {
    const { fieldId, inNav } = props;
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    const { tokenA, tokenB } = useContext(TradeDataContext);

    const tradeButtonParams: marketParamsIF = {
        chain: chainNumToString(tokenA.chainId),
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    };
    return (
        <StyledLink
            id={fieldId}
            to={linkGenMarket.getFullURL(tradeButtonParams)}
            tabIndex={0}
            aria-label='Go to trade page button'
            inNav={inNav}
        >
            Trade Now
        </StyledLink>
    );
}
