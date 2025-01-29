import { useContext } from 'react';
import {
    getFormattedNumber,
    getLimitPriceForSidebar,
    getMoneynessRankByAddr,
} from '../../../../ambient-utils/dataLayer';
import { LimitOrderIF } from '../../../../ambient-utils/types';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import { FlexContainer } from '../../../../styled/Common';
import { ItemContainer } from '../../../../styled/Components/Sidebar';

interface propsIF {
    order: LimitOrderIF;
    handleClick: (limitOrder: LimitOrderIF) => void;
}
export default function SidebarLimitOrdersCard(props: propsIF) {
    const { order, handleClick } = props;
    const { tokens } = useContext(TokenContext);
    const { isTradeDollarizationEnabled } = useContext(PoolContext);

    const baseTokenMoneyness = getMoneynessRankByAddr(order.base);
    const quoteTokenMoneyness = getMoneynessRankByAddr(order.quote);

    const isDenomBase = baseTokenMoneyness < quoteTokenMoneyness;

    // human-readable limit price to display in the DOM
    const price = getLimitPriceForSidebar(
        order,
        tokens,
        isDenomBase,
        isTradeDollarizationEnabled,
    );

    // human-readable limit order value to display in the DOM
    const value = getFormattedNumber({
        value: order.totalValueUSD,
        prefix: '$',
    });

    return (
        <ItemContainer color='text2' onClick={() => handleClick(order)}>
            {[
                isDenomBase
                    ? `${order?.baseSymbol} / ${order?.quoteSymbol}`
                    : `${order?.quoteSymbol} / ${order?.baseSymbol}`,
                price,
                value,
            ].map((item) => (
                <FlexContainer
                    key={item}
                    justifyContent='center'
                    alignItems='center'
                    padding='4px'
                >
                    {item}
                </FlexContainer>
            ))}
        </ItemContainer>
    );
}
