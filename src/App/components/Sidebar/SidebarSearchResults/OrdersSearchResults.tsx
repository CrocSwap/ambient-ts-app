import { useContext } from 'react';
import {
    getFormattedNumber,
    getUnicodeCharacter,
} from '../../../../ambient-utils/dataLayer';
import { LimitOrderIF } from '../../../../ambient-utils/types';
import { AppStateContext } from '../../../../contexts';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { FlexContainer, GridContainer, Text } from '../../../../styled/Common';
import {
    Results,
    ResultsContainer,
} from '../../../../styled/Components/Sidebar';
import {
    limitParamsIF,
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';

interface propsIF {
    searchedLimitOrders: LimitOrderIF[];
}
interface limitOrderPropsIF {
    limitOrder: LimitOrderIF;
    handleClick: (limitOrder: LimitOrderIF) => void;
}

function LimitOrderLI(props: limitOrderPropsIF) {
    const { limitOrder, handleClick } = props;
    const { isDenomBase } = useContext(TradeDataContext);

    const symbols = {
        base: limitOrder.baseSymbol
            ? getUnicodeCharacter(limitOrder.baseSymbol)
            : '',
        quote: limitOrder.quoteSymbol
            ? getUnicodeCharacter(limitOrder.quoteSymbol)
            : '',
    };

    const displayPrice = getFormattedNumber({
        value: isDenomBase
            ? limitOrder.invLimitPriceDecimalCorrected
            : limitOrder.limitPriceDecimalCorrected,
        prefix: isDenomBase ? symbols.quote : symbols.base,
    });
    const valueUSD = getFormattedNumber({
        value: limitOrder.totalValueUSD,
        prefix: '$',
    });

    return (
        <Results
            numCols={3}
            fullWidth
            fontWeight='300'
            fontSize='body'
            color='text2'
            padding='4px'
            onClick={() => handleClick(limitOrder)}
        >
            <p>
                {limitOrder.baseSymbol} / {limitOrder.quoteSymbol}
            </p>
            <p style={{ textAlign: 'center' }}>{displayPrice}</p>
            <p style={{ textAlign: 'center' }}>{valueUSD}</p>
        </Results>
    );
}

export default function OrdersSearchResults(props: propsIF) {
    const { searchedLimitOrders } = props;
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const {
        setCurrentLimitOrderActive,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    const handleClick = (limitOrder: LimitOrderIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(1);
        setCurrentLimitOrderActive(limitOrder.limitOrderId);
        setShowAllData(false);
        const { base, quote, isBid, bidTick, askTick } = limitOrder;
        // URL params for link to limit page
        const limitLinkParams: limitParamsIF = {
            chain: chainId,
            tokenA: base,
            tokenB: quote,
            limitTick: isBid ? bidTick : askTick,
        };
        // navigate user to limit page with URL params defined above
        linkGenLimit.navigate(limitLinkParams);
    };

    return (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='flex-start'
            gap={8}
        >
            <Text fontWeight='500' fontSize='body' color='accent5'>
                My Limit Orders
            </Text>
            {searchedLimitOrders.length ? (
                <FlexContainer flexDirection='column' fullWidth>
                    <GridContainer
                        numCols={3}
                        fullWidth
                        fontWeight='300'
                        fontSize='body'
                        color='text2'
                        style={{ borderBottom: '1px solid var(--dark3)' }}
                        padding='0 0 4px 0'
                    >
                        {['Pool', 'Price', 'Value'].map((item, idx) => (
                            <Text
                                key={idx}
                                fontWeight='300'
                                fontSize='body'
                                color='text2'
                                align='center'
                            >
                                {item}
                            </Text>
                        ))}
                    </GridContainer>
                    <ResultsContainer
                        flexDirection='column'
                        onClick={() => {
                            if (isPoolDropdownOpen)
                                setIsPoolDropdownOpen(false);
                        }}
                    >
                        {searchedLimitOrders
                            .slice(0, 4)
                            .map((limitOrder: LimitOrderIF) => (
                                <LimitOrderLI
                                    key={`order-search-result-${JSON.stringify(
                                        limitOrder,
                                    )}`}
                                    limitOrder={limitOrder}
                                    handleClick={handleClick}
                                />
                            ))}
                    </ResultsContainer>
                </FlexContainer>
            ) : (
                <FlexContainer
                    margin='0 8px 96px 8px'
                    fontSize='body'
                    color='text2'
                >
                    No Limit Orders Found
                </FlexContainer>
            )}
        </FlexContainer>
    );
}
