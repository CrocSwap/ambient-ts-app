import { TransactionIF } from '../../../ambient-utils/types';
import { CSSTransition } from 'react-transition-group';
import {
    OrderHistoryBody,
    OrderHistoryContainer,
    OrderHistoryHeader,
    StyledHeader,
    StyledLink,
} from './OrderHistoryTooltipCss';
import {
    getFormattedNumber,
    trimString,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import { RiExternalLinkLine } from 'react-icons/ri';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useContext } from 'react';

export default function OrderHistoryTooltip(props: {
    hoveredOrderHistory: TransactionIF;
    isHoveredOrderHistory: boolean;
    denomInBase: boolean;
    hoveredOrderTooltipPlacement: { top: number; left: number };
    handleCardClick: React.Dispatch<TransactionIF>;
    setSelectedOrderHistory: React.Dispatch<
        React.SetStateAction<TransactionIF | undefined>
    >;
}) {
    const {
        hoveredOrderHistory,
        isHoveredOrderHistory,
        denomInBase,
        hoveredOrderTooltipPlacement,
        handleCardClick,
        setSelectedOrderHistory,
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
                top={hoveredOrderTooltipPlacement.top}
                left={hoveredOrderTooltipPlacement.left}
                onClick={() => {
                    handleCardClick(hoveredOrderHistory);
                    setSelectedOrderHistory(() => {
                        return hoveredOrderHistory;
                    });
                }}
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
                            {getFormattedNumber({
                                value: Math.abs(
                                    denomInBase
                                        ? hoveredOrderHistory.baseFlowDecimalCorrected
                                        : hoveredOrderHistory.quoteFlowDecimalCorrected,
                                ),
                                abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                            })}
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
                            getFormattedNumber({
                                value: hoveredOrderHistory.totalValueUSD,
                                abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                            })}
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
