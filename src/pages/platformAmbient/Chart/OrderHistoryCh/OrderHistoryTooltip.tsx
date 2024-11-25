import { useContext, useState } from 'react';
import { RiExternalLinkLine } from 'react-icons/ri';
import { CSSTransition } from 'react-transition-group';
import {
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
} from './OrderHistoryTooltipCss';

export default function OrderHistoryTooltip(props: {
    hoveredOrderHistory: TransactionIF;
    isHoveredOrderHistory: boolean;
    denomInBase: boolean;
    hoveredOrderTooltipPlacement: {
        top: number;
        left: number;
        isOnLeftSide: boolean;
    };
    handleCardClick: React.Dispatch<TransactionIF>;
    setSelectedOrderHistory: React.Dispatch<
        React.SetStateAction<TransactionIF | undefined>
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
                        handleCardClick(hoveredOrderHistory);

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

                                        return hoveredOrderHistory ===
                                            prevSelected
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
                    <OrderHistoryHeader>
                        <StyledHeader
                            color={
                                (denomInBase && !hoveredOrderHistory.isBuy) ||
                                (!denomInBase && hoveredOrderHistory.isBuy)
                                    ? ['futa'].includes(platformName)
                                        ? 'var(--negative)'
                                        : 'var(--accent5)'
                                    : 'var(--accent1)'
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
                        {(
                            denomInBase
                                ? hoveredOrderHistory.baseTokenLogoURI
                                : hoveredOrderHistory.quoteTokenLogoURI
                        ) ? (
                            <img
                                src={uriToHttp(
                                    denomInBase
                                        ? hoveredOrderHistory.baseTokenLogoURI
                                        : hoveredOrderHistory.quoteTokenLogoURI,
                                )}
                                alt='base token'
                                style={{ width: '18px' }}
                            />
                        ) : undefined}
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
                            onClick={(
                                event: React.MouseEvent<HTMLDivElement>,
                            ) => {
                                event.stopPropagation();
                                handleOpenExplorer(hoveredOrderHistory.txHash);
                            }}
                            onMouseEnter={() => {
                                setHoveredID(hoveredOrderHistory.txHash);
                            }}
                            onMouseLeave={() => setHoveredID(() => undefined)}
                        >
                            {trimString(hoveredOrderHistory.txHash, 6, 4, '…')}
                            <RiExternalLinkLine />
                        </StyledLink>
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
