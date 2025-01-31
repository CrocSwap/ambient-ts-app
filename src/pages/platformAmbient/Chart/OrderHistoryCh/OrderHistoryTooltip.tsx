import { useContext, useRef, useState } from 'react';
import { RiExternalLinkLine } from 'react-icons/ri';
import { CSSTransition } from 'react-transition-group';
import {
    formatSubscript,
    getFormattedNumber,
    trimString,
    uriToHttp,
} from '../../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../../ambient-utils/types';
import { AppStateContext, TradeDataContext } from '../../../../contexts';
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
    ArrowHoverContainer,
    IdContainer,
} from './OrderHistoryTooltipCss';
import { ArrowContainer } from '../../../../styled/Components/Chart';
import TokenIcon from '../../../../components/Global/TokenIcon/TokenIcon';

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
    handleCardClick: (id: string, type: string) => void;
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

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const {
        activeNetwork: { blockExplorer },
    } = useContext(AppStateContext);

    const { platformName } = useContext(BrandContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const { setCurrentTxActiveInTransactions } = useContext(TradeTableContext);

    function handleOpenExplorer(txHash: string) {
        const explorerUrl = `${blockExplorer}tx/${txHash}`;
        window.open(explorerUrl);
    }

    const [hoveredID, setHoveredID] = useState<string | undefined>();

    const [showUpArrow, setShowUpArrow] = useState(false);
    const [showDownArrow, setShowDownArrow] = useState(false);

    const isAtBottom = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
                scrollContainerRef.current;
            return scrollTop >= scrollHeight - clientHeight;
        }
        return false;
    };

    const handleMouseMove = () => {
        const scrollContainer = scrollContainerRef.current;

        if (scrollContainer && scrollContainer.scrollTop <= 5) {
            setShowUpArrow(false);
        } else {
            setShowUpArrow(true);
        }

        if (isAtBottom()) {
            setShowDownArrow(false);
        } else {
            setShowDownArrow(true);
        }
    };

    const handleMouseLeave = () => {
        setShowUpArrow(false);
        setShowDownArrow(false);
    };

    const handleScroll = (direction: string) => {
        const scrollContainer = scrollContainerRef.current;

        if (scrollContainer) {
            const scrollAmount = 50;

            if (direction === 'up') {
                scrollContainer.scrollTop -= scrollAmount;
            } else if (direction === 'down') {
                scrollContainer.scrollTop += scrollAmount;
            }

            if (scrollContainer.scrollTop <= 5) {
                setShowUpArrow(false);
            } else {
                setShowUpArrow(true);
            }
        }
    };

    const downArrow = (
        <ArrowHoverContainer
            isTop={false}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                event.stopPropagation();
                handleScroll('down');
            }}
            onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
                event.stopPropagation();
            }}
            onMouseLeave={(event: React.MouseEvent<HTMLDivElement>) => {
                event.stopPropagation();
            }}
        >
            <ArrowContainer degree={135} />
        </ArrowHoverContainer>
    );

    const upArrow = (
        <ArrowHoverContainer
            isTop={true}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                event.stopPropagation();
                handleScroll('up');
            }}
            onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
                event.stopPropagation();
            }}
            onMouseLeave={(event: React.MouseEvent<HTMLDivElement>) => {
                event.stopPropagation();
            }}
        >
            <ArrowContainer degree={315} />
        </ArrowHoverContainer>
    );

    const swapHeader = (hoveredOrderHistory.type === 'swap' ||
        hoveredOrderHistory.type === 'limitOrder' ||
        hoveredOrderHistory.type === 'claimableLimit') && (
        <OrderHistoryHeader>
            <StyledHeader
                color={
                    (denomInBase &&
                        (hoveredOrderHistory.type === 'claimableLimit'
                            ? !hoveredOrderHistory.order.order.isBid
                            : !hoveredOrderHistory.order.order.isBuy)) ||
                    (!denomInBase &&
                        (hoveredOrderHistory.type === 'claimableLimit'
                            ? hoveredOrderHistory.order.order.isBid
                            : hoveredOrderHistory.order.order.isBuy))
                        ? ['futa'].includes(platformName)
                            ? 'var(--negative)'
                            : 'var(--accent5)'
                        : 'var(--accent1)'
                }
                size={'15px'}
            >
                {((denomInBase &&
                    (hoveredOrderHistory.type === 'claimableLimit'
                        ? !hoveredOrderHistory.order.order.isBid
                        : !hoveredOrderHistory.order.order.isBuy)) ||
                (!denomInBase &&
                    (hoveredOrderHistory.type === 'claimableLimit'
                        ? hoveredOrderHistory.order.order.isBid
                        : hoveredOrderHistory.order.order.isBuy))
                    ? 'Buy'
                    : 'Sell') + ': '}
            </StyledHeader>

            <StyledHeader color={'white'} size={'15px'}>
                {(hoveredOrderHistory.type === 'limitOrder' ||
                    hoveredOrderHistory.type === 'claimableLimit') &&
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
                <TokenIcon
                    token={denomInBase ? baseToken : quoteToken}
                    src={uriToHttp(
                        denomInBase
                            ? hoveredOrderHistory.order.order.baseTokenLogoURI
                            : hoveredOrderHistory.order.order.quoteTokenLogoURI,
                    )}
                    alt='base token'
                    size='m'
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
                {hoveredOrderHistory.tokenFlowDecimalCorrected < 1
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
                    ? hoveredOrderHistory.order.baseSymbol
                    : hoveredOrderHistory.order.quoteSymbol}
            </StyledHeader>
            {(
                denomInBase
                    ? hoveredOrderHistory.order.baseTokenLogoURI
                    : hoveredOrderHistory.order.quoteTokenLogoURI
            ) ? (
                <TokenIcon
                    token={denomInBase ? baseToken : quoteToken}
                    src={uriToHttp(
                        denomInBase
                            ? hoveredOrderHistory.order.baseTokenLogoURI
                            : hoveredOrderHistory.order.quoteTokenLogoURI,
                    )}
                    alt='base token'
                    size='m'
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
                <TokenIcon
                    token={baseToken}
                    src={uriToHttp(hoveredOrderHistory.order.baseTokenLogoURI)}
                    alt='base token'
                    size='m'
                />
            ) : undefined}

            {hoveredOrderHistory.order.quoteTokenLogoURI ? (
                <TokenIcon
                    token={quoteToken}
                    src={uriToHttp(hoveredOrderHistory.order.quoteTokenLogoURI)}
                    alt='base token'
                    size='m'
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
                ? hoveredOrderHistory.order.bidTickInvPriceDecimalCorrected >
                  0.1
                    ? hoveredOrderHistory.order.lowRangeShortDisplayInBase
                    : formatSubscript(
                          hoveredOrderHistory.order
                              .bidTickInvPriceDecimalCorrected,
                      )
                : hoveredOrderHistory.order.bidTickPriceDecimalCorrected > 0.1
                  ? hoveredOrderHistory.order.lowRangeShortDisplayInQuote
                  : formatSubscript(
                        hoveredOrderHistory.order.bidTickPriceDecimalCorrected,
                    )) +
                ' - ' +
                (denomInBase
                    ? hoveredOrderHistory.order
                          .askTickInvPriceDecimalCorrected > 0.1
                        ? hoveredOrderHistory.order.highRangeShortDisplayInBase
                        : formatSubscript(
                              hoveredOrderHistory.order
                                  .askTickInvPriceDecimalCorrected,
                          )
                    : hoveredOrderHistory.order.askTickPriceDecimalCorrected >
                        0.1
                      ? hoveredOrderHistory.order.highRangeShortDisplayInQuote
                      : formatSubscript(
                            hoveredOrderHistory.order
                                .askTickPriceDecimalCorrected,
                        ))}
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
                        handleCardClick(
                            hoveredOrderHistory.id,
                            hoveredOrderHistory.type,
                        );

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
                        hoveredOrderHistory.type === 'limitOrder' ||
                        hoveredOrderHistory.type === 'claimableLimit') &&
                        swapHeader}
                    {hoveredOrderHistory.type === 'limitSwapLine' &&
                        limitOrderHeader}
                    {(hoveredOrderHistory.type === 'historical' ||
                        hoveredOrderHistory.type === 'historicalLiq') &&
                        headerHistorical}

                    <OrderHistoryBody
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {hoveredOrderHistory.type === 'swap' && swapTypeText}
                        {(hoveredOrderHistory.type === 'limitSwapLine' ||
                            hoveredOrderHistory.type === 'limitOrder' ||
                            hoveredOrderHistory.type === 'claimableLimit') &&
                            LimitTypeText}
                        {(hoveredOrderHistory.type === 'historical' ||
                            hoveredOrderHistory.type === 'historicalLiq') &&
                            historicalTypeText}

                        {!(
                            hoveredOrderHistory.type === 'historical' &&
                            hoveredOrderHistory.order.positionLiq === 0
                        ) && (
                            <StyledHeader color={'var(--text2)'} size={'13px'}>
                                {'$' +
                                    getFormattedNumber({
                                        value: hoveredOrderHistory.totalValueUSD,
                                        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                                    })}
                            </StyledHeader>
                        )}

                        {(hoveredOrderHistory.type === 'swap' ||
                            hoveredOrderHistory.type === 'limitOrder' ||
                            hoveredOrderHistory.type === 'limitSwapLine' ||
                            hoveredOrderHistory.type === 'claimableLimit') &&
                            hoveredOrderHistory.mergedIds.length > 5 &&
                            showUpArrow &&
                            upArrow}

                        {(hoveredOrderHistory.type === 'swap' ||
                            hoveredOrderHistory.type === 'limitOrder' ||
                            hoveredOrderHistory.type === 'limitSwapLine' ||
                            hoveredOrderHistory.type === 'claimableLimit') && (
                            <IdContainer>
                                <LinkContainer
                                    isHover={false}
                                    ref={scrollContainerRef}
                                >
                                    {hoveredOrderHistory.mergedIds.map(
                                        (
                                            merge: {
                                                hash: string;
                                                type: string;
                                            },
                                            index: number,
                                        ) => {
                                            return (
                                                <StyledLink
                                                    color={'var(--text2)'}
                                                    size={'13px'}
                                                    key={index}
                                                    onClick={(
                                                        event: React.MouseEvent<HTMLDivElement>,
                                                    ) => {
                                                        event.stopPropagation();
                                                        handleOpenExplorer(
                                                            merge.hash,
                                                        );
                                                    }}
                                                    onMouseEnter={() => {
                                                        setHoveredID(
                                                            merge.hash,
                                                        );
                                                    }}
                                                    onMouseLeave={() =>
                                                        setHoveredID(
                                                            () => undefined,
                                                        )
                                                    }
                                                >
                                                    {trimString(
                                                        merge.hash,
                                                        6,
                                                        4,
                                                        '…',
                                                    )}
                                                    <RiExternalLinkLine />
                                                </StyledLink>
                                            );
                                        },
                                    )}
                                </LinkContainer>
                            </IdContainer>
                        )}

                        {(hoveredOrderHistory.type === 'swap' ||
                            hoveredOrderHistory.type === 'limitOrder' ||
                            hoveredOrderHistory.type === 'limitSwapLine' ||
                            hoveredOrderHistory.type === 'claimableLimit') &&
                            hoveredOrderHistory.mergedIds.length > 5 &&
                            showDownArrow &&
                            downArrow}

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
