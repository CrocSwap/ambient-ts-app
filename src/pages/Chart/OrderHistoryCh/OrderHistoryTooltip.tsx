import { TransactionIF } from '../../../ambient-utils/types';
import { formatAmountWithoutDigit } from '../../../utils/numbers';
import { scaleData } from '../ChartUtils/chartUtils';
import { CSSTransition } from 'react-transition-group';
import {
    OrderHistoryBody,
    OrderHistoryContainer,
    OrderHistoryHeader,
    StyledHeader,
} from './OrderHistoryTooltipCss';
import { trimString, uriToHttp } from '../../../ambient-utils/dataLayer';

export default function OrderHistoryTooltip(props: {
    scaleData: scaleData;
    hoveredOrderHistory: TransactionIF;
    isHoveredOrderHistory: boolean;
    denomInBase: boolean;
}) {
    const {
        scaleData,
        hoveredOrderHistory,
        isHoveredOrderHistory,
        denomInBase,
    } = props;

    return (
        <CSSTransition
            in={isHoveredOrderHistory}
            timeout={300}
            classNames='orderHistoryTooltip'
            unmountOnExit
        >
            <OrderHistoryContainer
                top={scaleData.yScale(
                    denomInBase
                        ? hoveredOrderHistory.swapInvPriceDecimalCorrected
                        : hoveredOrderHistory.swapPriceDecimalCorrected,
                )}
                left={
                    scaleData?.xScale(hoveredOrderHistory?.txTime * 1000) + 70
                }
            >
                <OrderHistoryHeader>
                    <StyledHeader
                        color={
                            hoveredOrderHistory.isBuy ? '#CDC1FF' : '#7371fc'
                        }
                        size={'15px'}
                    >
                        {(hoveredOrderHistory.isBuy ? 'Buy' : 'Sell') + ': '}
                    </StyledHeader>

                    {hoveredOrderHistory.entityType !== 'liquidity' && (
                        <StyledHeader color={'white'} size={'15px'}>
                            {formatAmountWithoutDigit(
                                Math.abs(
                                    hoveredOrderHistory.baseFlowDecimalCorrected,
                                ),
                            )}
                        </StyledHeader>
                    )}

                    {hoveredOrderHistory.entityType !== 'liquidity' && (
                        <StyledHeader color={'white'} size={'15px'}>
                            {hoveredOrderHistory.baseSymbol}
                        </StyledHeader>
                    )}
                    <img
                        src={uriToHttp(hoveredOrderHistory.baseTokenLogoURI)}
                        alt='base token'
                        style={{ width: '18px' }}
                    />
                </OrderHistoryHeader>
                <OrderHistoryBody>
                    <StyledHeader color={'#8b98a5'} size={'13px'}>
                        {hoveredOrderHistory.entityType !== 'liquidity'
                            ? 'Market'
                            : ''}
                    </StyledHeader>
                    <StyledHeader color={'#8b98a5'} size={'13px'}>
                        {'$' +
                            formatAmountWithoutDigit(
                                hoveredOrderHistory.totalValueUSD,
                                0,
                            )}
                    </StyledHeader>
                    <StyledHeader color={'#8b98a5'} size={'13px'}>
                        {trimString(hoveredOrderHistory.txHash, 6, 4, '…')}
                    </StyledHeader>
                </OrderHistoryBody>
            </OrderHistoryContainer>
        </CSSTransition>
    );
}
