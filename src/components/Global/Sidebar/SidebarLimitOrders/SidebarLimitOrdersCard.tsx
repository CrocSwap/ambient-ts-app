import { LimitOrderIF } from '../../../../utils/interfaces/exports';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useContext } from 'react';
import { TokenContext } from '../../../../contexts/TokenContext';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import { getLimitPrice } from '../../../../App/functions/getLimitPrice';
import { FlexContainer } from '../../../../styled/Common';
import { ItemContainer } from '../../../../styled/Components/Sidebar';

interface propsIF {
    order: LimitOrderIF;
    handleClick: (limitOrder: LimitOrderIF) => void;
}
export default function SidebarLimitOrdersCard(props: propsIF) {
    const { order, handleClick } = props;
    const { tokens } = useContext(TokenContext);
    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    // human-readable limit price to display in the DOM
    const price = getLimitPrice(order, tokens, isDenomBase);

    // human-readable limit order value to display in the DOM
    const value = getFormattedNumber({
        value: order.totalValueUSD,
        prefix: '$',
    });

    return (
        <ItemContainer
            numCols={3}
            color='text2'
            onClick={() => handleClick(order)}
        >
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
