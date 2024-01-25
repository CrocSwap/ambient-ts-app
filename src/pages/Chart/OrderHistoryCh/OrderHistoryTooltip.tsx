import { TransactionIF } from '../../../ambient-utils/types';
import { formatAmountWithoutDigit } from '../../../utils/numbers';
import { scaleData } from '../ChartUtils/chartUtils';
import { CSSTransition } from 'react-transition-group';
import {
    OrderHistoryBody,
    OrderHistoryContainer,
    OrderHistoryHeader,
    StyledHeader,
    StyledLink,
} from './OrderHistoryTooltipCss';
import { trimString, uriToHttp } from '../../../ambient-utils/dataLayer';
import { RiExternalLinkLine } from 'react-icons/ri';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useContext } from 'react';

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

    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    function handleOpenExplorer(txHash: string) {
        const explorerUrl = `${blockExplorer}tx/${txHash}`;
        window.open(explorerUrl);
    }

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
                            (denomInBase && !hoveredOrderHistory.isBuy) ||
                            (!denomInBase && hoveredOrderHistory.isBuy)
                                ? '#CDC1FF'
                                : '#7371fc'
                        }
                        size={'15px'}
                    >
                        {((denomInBase && !hoveredOrderHistory.isBuy) ||
                        (!denomInBase && hoveredOrderHistory.isBuy)
                            ? 'Buy'
                            : 'Sell') + ': '}
                    </StyledHeader>

                    {hoveredOrderHistory.entityType !== 'liquidity' && (
                        <StyledHeader color={'white'} size={'15px'}>
                            {formatAmountWithoutDigit(
                                Math.abs(
                                    denomInBase
                                        ? hoveredOrderHistory.baseFlowDecimalCorrected
                                        : hoveredOrderHistory.quoteFlowDecimalCorrected,
                                ),
                            )}
                        </StyledHeader>
                    )}

                    {hoveredOrderHistory.entityType !== 'liquidity' && (
                        <StyledHeader color={'white'} size={'15px'}>
                            {denomInBase
                                ? hoveredOrderHistory.baseSymbol
                                : hoveredOrderHistory.quoteSymbol}
                        </StyledHeader>
                    )}
                    <img
                        src={uriToHttp(
                            denomInBase
                                ? hoveredOrderHistory.baseTokenLogoURI
                                : hoveredOrderHistory.quoteTokenLogoURI,
                        )}
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
                                2,
                            )}
                    </StyledHeader>
                    <StyledLink
                        color={'#8b98a5'}
                        size={'13px'}
                        onClick={() => {
                            handleOpenExplorer(hoveredOrderHistory.txHash);
                        }}
                    >
                        {trimString(hoveredOrderHistory.txHash, 6, 4, '…')}
                        <RiExternalLinkLine />
                    </StyledLink>
                </OrderHistoryBody>
            </OrderHistoryContainer>
        </CSSTransition>
    );
}
