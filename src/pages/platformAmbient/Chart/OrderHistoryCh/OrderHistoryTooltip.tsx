import { useContext, useState } from 'react';
import { RiExternalLinkLine } from 'react-icons/ri';
import { CSSTransition } from 'react-transition-group';
import {
    formatSubscript,
    getFormattedNumber,
    trimString,
    uriToHttp,
} from '../../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../../ambient-utils/types';
import { AppStateContext } from '../../../../contexts';
import { BrandContext } from '../../../../contexts/BrandContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import HoveredTooltip from '../Draw/Toolbar/HoveredTooltip';
import {
    OrderHistoryBody,
    OrderHistoryContainer,
    OrderHistoryHeader,
    OrderHistoryHover,
    StyledHeader,
    StyledLink,
    LinkContainer,
} from './OrderHistoryTooltipCss';

export default function OrderHistoryTooltip(props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hoveredOrderHistory: any;
    isHoveredOrderHistory: boolean;
    denomInBase: boolean;
    hoveredOrderTooltipPlacement: {
        top: number;
        left: number;
        isOnLeftSide: boolean;
    };
    handleCardClick: React.Dispatch<string>;
    setSelectedOrderHistory: React.Dispatch<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.SetStateAction<any>
    >;
    setIsSelectedOrderHistory: React.Dispatch<React.SetStateAction<boolean>>;
    pointerEvents: boolean;
    setHoverOHTooltip: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const {
        hoveredOrderHistory,
        isHoveredOrderHistory,
        denomInBase,
        hoveredOrderTooltipPlacement,
        handleCardClick,
        setSelectedOrderHistory,
        setIsSelectedOrderHistory,
        pointerEvents,
        setHoverOHTooltip,
    } = props;

    const {
        activeNetwork: { blockExplorer },
    } = useContext(AppStateContext);

    const { platformName } = useContext(BrandContext);

    const { setCurrentTxActiveInTransactions } = useContext(TradeTableContext);

    function handleOpenExplorer(txHash: string) {
        const explorerUrl = `${blockExplorer}tx/${txHash}`;
        window.open(explorerUrl);
    }

    const [hoveredID, setHoveredID] = useState<string | undefined>();

    const swapHeader = (hoveredOrderHistory.type === 'swap' ||
        hoveredOrderHistory.type === 'limitCircle') && (
        <OrderHistoryHeader>
            <StyledHeader
                color={
                    (denomInBase && !hoveredOrderHistory.order.order.isBuy) ||
                    (!denomInBase && hoveredOrderHistory.order.order.isBuy)
                        ? ['futa'].includes(platformName)
                            ? 'var(--negative)'
                            : 'var(--accent5)'
                        : 'var(--accent1)'
                }
                size={'15px'}
            >
                {((denomInBase && !hoveredOrderHistory.order.order.isBuy) ||
                (!denomInBase && hoveredOrderHistory.order.order.isBuy)
                    ? 'Buy'
                    : 'Sell') + ': '}
            </StyledHeader>

            <StyledHeader color={'white'} size={'15px'}>
                {hoveredOrderHistory.type === 'limitCircle' &&
                hoveredOrderHistory.tokenFlowDecimalCorrected < 1
                    ? formatSubscript(
                          hoveredOrderHistory.tokenFlowDecimalCorrected,
                      )
                    : getFormattedNumber({
                          value: Math.abs(
                              hoveredOrderHistory.tokenFlowDecimalCorrected,
                          ),
                          abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                      })}
            </StyledHeader>

            <StyledHeader color={'white'} size={'15px'}>
                {denomInBase
                    ? hoveredOrderHistory.order.order.baseSymbol
                    : hoveredOrderHistory.order.order.quoteSymbol}
            </StyledHeader>

            {(
                denomInBase
                    ? hoveredOrderHistory.order.order.baseTokenLogoURI
                    : hoveredOrderHistory.order.order.quoteTokenLogoURI
            ) ? (
                <img
                    src={uriToHttp(
                        denomInBase
                            ? hoveredOrderHistory.order.order.baseTokenLogoURI
                            : hoveredOrderHistory.order.order.quoteTokenLogoURI,
                    )}
                    alt='base token'
                    style={{ width: '18px' }}
                />
            ) : undefined}
        </OrderHistoryHeader>
    );

    const limitOrderHeader = (
        <OrderHistoryHeader>
            <StyledHeader
                color={
                    (denomInBase && !hoveredOrderHistory.order.isBid) ||
                    (!denomInBase && hoveredOrderHistory.order.isBid)
                        ? ['futa'].includes(platformName)
                            ? 'var(--negative)'
                            : 'var(--accent5)'
                        : 'var(--accent1)'
                }
                size={'15px'}
            >
                {((denomInBase && !hoveredOrderHistory.order.isBid) ||
                (!denomInBase && hoveredOrderHistory.order.isBid)
                    ? 'Buy'
                    : 'Sell') + ': '}
            </StyledHeader>
            <StyledHeader color={'white'} size={'15px'}>
                {formatSubscript(
                    denomInBase
                        ? hoveredOrderHistory.order.isBid
                            ? hoveredOrderHistory.order
                                  .originalPositionLiqBaseDecimalCorrected
                            : hoveredOrderHistory.order
                                  .expectedPositionLiqBaseDecimalCorrected
                        : hoveredOrderHistory.order.isBid
                          ? hoveredOrderHistory.order
                                .expectedPositionLiqQuoteDecimalCorrected
                          : hoveredOrderHistory.order
                                .originalPositionLiqQuoteDecimalCorrected,
                )}
            </StyledHeader>
            <StyledHeader color={'white'} size={'15px'}>
                {denomInBase
                    ? hoveredOrderHistory.order.baseSymbol
                    : hoveredOrderHistory.order.quoteSymbol}
            </StyledHeader>
            {(
                denomInBase
                    ? hoveredOrderHistory.order.baseTokenLogoURI
                    : hoveredOrderHistory.order.quoteTokenLogoURI
            ) ? (
                <img
                    src={uriToHttp(
                        denomInBase
                            ? hoveredOrderHistory.order.baseTokenLogoURI
                            : hoveredOrderHistory.order.quoteTokenLogoURI,
                    )}
                    alt='base token'
                    style={{ width: '18px' }}
                />
            ) : undefined}
        </OrderHistoryHeader>
    );

    const headerHistorical = (
        <OrderHistoryHeader>
            <StyledHeader color={'var(--accent3)'} size={'15px'}>
                Range
            </StyledHeader>

            {hoveredOrderHistory.order.baseTokenLogoURI ? (
                <img
                    src={uriToHttp(hoveredOrderHistory.order.baseTokenLogoURI)}
                    alt='base token'
                    style={{ width: '18px' }}
                />
            ) : undefined}

            {hoveredOrderHistory.order.quoteTokenLogoURI ? (
                <img
                    src={uriToHttp(hoveredOrderHistory.order.quoteTokenLogoURI)}
                    alt='base token'
                    style={{ width: '18px' }}
                />
            ) : undefined}
        </OrderHistoryHeader>
    );

    const swapTypeText = (
        <StyledHeader color={'var(--text2)'} size={'13px'}>
            Market
        </StyledHeader>
    );

    const LimitTypeText = (
        <StyledHeader color={'var(--text2)'} size={'13px'}>
            Limit
        </StyledHeader>
    );

    const historicalTypeText = (
        <StyledHeader color={'var(--text1)'} size={'15px'}>
            {(denomInBase
                ? hoveredOrderHistory.order.highRangeShortDisplayInBase
                : hoveredOrderHistory.order.highRangeShortDisplayInQuote) +
                ' - ' +
                (denomInBase
                    ? hoveredOrderHistory.order.lowRangeShortDisplayInBase
                    : hoveredOrderHistory.order.lowRangeShortDisplayInQuote)}
        </StyledHeader>
    );

    return (
        <CSSTransition
            in={isHoveredOrderHistory}
            timeout={300}
            classNames='orderHistoryTooltip'
            unmountOnExit
        >
            <OrderHistoryHover
                top={hoveredOrderTooltipPlacement.top}
                left={hoveredOrderTooltipPlacement.left}
                isOnLeftSide={hoveredOrderTooltipPlacement.isOnLeftSide}
                pointerEvents={pointerEvents}
                onMouseEnter={() => setHoverOHTooltip(true)}
                onMouseLeave={() => setHoverOHTooltip(false)}
            >
                <OrderHistoryContainer
                    onClick={() => {
                        handleCardClick(hoveredOrderHistory.id);

                        setIsSelectedOrderHistory((prev: boolean) => {
                            let shouldDeselect = !prev;
                            if (!prev) {
                                setSelectedOrderHistory(() => {
                                    return hoveredOrderHistory;
                                });
                            } else {
                                setSelectedOrderHistory(
                                    (
                                        prevSelected: TransactionIF | undefined,
                                    ) => {
                                        shouldDeselect =
                                            hoveredOrderHistory === prevSelected
                                                ? !prev
                                                : prev;

                                        return hoveredOrderHistory.order
                                            .order === prevSelected
                                            ? undefined
                                            : hoveredOrderHistory;
                                    },
                                );
                            }

                            if (!shouldDeselect)
                                setCurrentTxActiveInTransactions('');

                            return shouldDeselect;
                        });
                        setHoverOHTooltip(false);
                    }}
                >
                    {(hoveredOrderHistory.type === 'swap' ||
                        hoveredOrderHistory.type === 'limitCircle') &&
                        swapHeader}
                    {hoveredOrderHistory.type === 'limitSwapLine' &&
                        limitOrderHeader}
                    {hoveredOrderHistory.type === 'historical' &&
                        headerHistorical}

                    <OrderHistoryBody>
                        {hoveredOrderHistory.type === 'swap' && swapTypeText}
                        {(hoveredOrderHistory.type === 'limitSwapLine' ||
                            hoveredOrderHistory.type === 'limitCircle') &&
                            LimitTypeText}
                        {hoveredOrderHistory.type === 'historical' &&
                            historicalTypeText}

                        <StyledHeader color={'var(--text2)'} size={'13px'}>
                            {'$' +
                                getFormattedNumber({
                                    value: hoveredOrderHistory.totalValueUSD,
                                    abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                                })}
                        </StyledHeader>

                        <LinkContainer>
                            {hoveredOrderHistory.mergedIds.map(
                                (id: string, index: number) => {
                                    return (
                                        <StyledLink
                                            color={'var(--text2)'}
                                            size={'13px'}
                                            key={index}
                                            onClick={(
                                                event: React.MouseEvent<HTMLDivElement>,
                                            ) => {
                                                event.stopPropagation();
                                                handleOpenExplorer(id);
                                            }}
                                            onMouseEnter={() => {
                                                setHoveredID(id);
                                            }}
                                            onMouseLeave={() =>
                                                setHoveredID(() => undefined)
                                            }
                                        >
                                            {trimString(id, 6, 4, '…')}
                                            <RiExternalLinkLine />
                                        </StyledLink>
                                    );
                                },
                            )}
                        </LinkContainer>

                        {hoveredID && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '-130%',
                                    top: '110%',
                                }}
                            >
                                <HoveredTooltip
                                    hoveredTool={hoveredID}
                                    height={22}
                                    width={490}
                                    arrow={false}
                                ></HoveredTooltip>
                            </div>
                        )}
                    </OrderHistoryBody>
                </OrderHistoryContainer>
            </OrderHistoryHover>
        </CSSTransition>
    );
}
