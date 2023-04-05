import styles from '../Orders.module.css';
import { useProcessOrder } from '../../../../../utils/hooks/useProcessOrder';
import OpenOrderStatus from '../../../../Global/OpenOrderStatus/OpenOrderStatus';
import OrdersMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import OrderDetails from '../../../../OrderDetails/OrderDetails';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { TextOnlyTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import { NavLink, useNavigate } from 'react-router-dom';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import { tradeData } from '../../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import moment from 'moment';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../../constants';
import { FiExternalLink } from 'react-icons/fi';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    tradeData: tradeData;
    expandTradeTable: boolean;
    showColumns: boolean;
    ipadView: boolean;
    view2: boolean;
    limitOrder: LimitOrderIF;
    showPair: boolean;
    showSidebar: boolean;
    lastBlockNumber: number;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;

    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;

    isShowAllEnabled: boolean;
    isOnPortfolioPage: boolean;
    account: string;
    handlePulseAnimation?: (type: string) => void;
}
export default function OrderRow(props: propsIF) {
    const {
        account,
        crocEnv,
        chainData,
        tradeData,
        showColumns,
        ipadView,
        showPair,
        // view2,
        limitOrder,
        showSidebar,
        openGlobalModal,
        closeGlobalModal,
        currentPositionActive,
        setCurrentPositionActive,
        isShowAllEnabled,
        isOnPortfolioPage,
        handlePulseAnimation,
        lastBlockNumber,
    } = props;

    const {
        posHash,
        ownerId,
        posHashTruncated,
        userNameToDisplay,
        quoteTokenLogo,
        baseTokenLogo,
        baseDisplay,
        quoteDisplay,
        // baseDisplayFrontend,
        // quoteDisplayFrontend,
        isOrderFilled,
        truncatedDisplayPrice,
        sideType,
        usdValue,
        // usdValueLocaleString,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
        ensName,
        // orderMatchesSelectedTokens,

        truncatedDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        baseTokenCharacter,
        quoteTokenCharacter,
        isDenomBase,
    } = useProcessOrder(limitOrder, account, isOnPortfolioPage);

    const orderMenuProps = {
        crocEnv: crocEnv,
        closeGlobalModal: props.closeGlobalModal,
        openGlobalModal: props.openGlobalModal,
        isOwnerActiveAccount: isOwnerActiveAccount,
        isOrderFilled: isOrderFilled,
        isOnPortfolioPage: isOnPortfolioPage,
    };

    const dispatch = useAppDispatch();

    const priceCharacter = isOnPortfolioPage
        ? isBaseTokenMoneynessGreaterOrEqual
            ? baseTokenCharacter
            : quoteTokenCharacter
        : !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const sideCharacter = isOnPortfolioPage
        ? isBaseTokenMoneynessGreaterOrEqual
            ? quoteTokenCharacter
            : baseTokenCharacter
        : isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const priceStyle = 'base_color';

    const sellOrderStyle = sideType === 'sell' ? 'order_sell' : 'order_buy';

    const phoneScreen = useMediaQuery('(max-width: 500px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const logoSizes = phoneScreen ? '10px' : smallScreen ? '15px' : '20px';

    const usernameStyle =
        isOwnerActiveAccount && isShowAllEnabled
            ? 'owned_tx_contrast'
            : ensName || userNameToDisplay === 'You'
            ? 'gradient_text'
            : 'username_base_color';
    // eslint-disable-next-line
    const usernameStyleModule =
        isOwnerActiveAccount && isShowAllEnabled
            ? styles.owned_tx_contrast
            : ensName
            ? styles.gradient_text
            : styles.base_color;
    const userPositionStyle =
        userNameToDisplay === 'You' && isShowAllEnabled
            ? styles.border_left
            : null;

    const openDetailsModal = () => {
        IS_LOCAL_ENV && console.debug({ limitOrder });

        openGlobalModal(
            <OrderDetails
                account={account}
                limitOrder={limitOrder}
                closeGlobalModal={closeGlobalModal}
                lastBlockNumber={lastBlockNumber}
                isBaseTokenMoneynessGreaterOrEqual={
                    isBaseTokenMoneynessGreaterOrEqual
                }
                isOnPortfolioPage={isOnPortfolioPage}
                chainData={chainData}
            />,
        );
    };
    const orderDomId =
        limitOrder.limitOrderIdentifier === currentPositionActive
            ? `order-${limitOrder.limitOrderIdentifier}`
            : '';

    const activePositionRef = useRef(null);

    const clickOutsideHandler = () => {
        setCurrentPositionActive('');
    };
    useOnClickOutside(activePositionRef, clickOutsideHandler);

    function scrollToDiv() {
        const element = document.getElementById(orderDomId);
        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
        });
    }

    useEffect(() => {
        limitOrder.limitOrderIdentifier === currentPositionActive
            ? scrollToDiv()
            : null;
    }, [currentPositionActive]);

    const activePositionStyle =
        limitOrder.limitOrderIdentifier === currentPositionActive
            ? styles.active_position_style
            : '';

    const [highlightRow, setHighlightRow] = useState(false);
    const highlightStyle = highlightRow ? 'var(--dark2)' : '';
    const handleRowMouseDown = () => setHighlightRow(true);
    const handleRowMouseOut = () => setHighlightRow(false);

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    style={{
                        marginLeft: '-40px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                    }}
                >
                    {posHash}
                </p>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={openDetailsModal}
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
            >
                {posHashTruncated}
            </li>
        </TextOnlyTooltip>
    );

    const ValueWithTooltip = (
        <li
            onClick={openDetailsModal}
            data-label='value'
            className={sellOrderStyle}
            style={{ textAlign: 'right' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            {' '}
            {'$' + usdValue}
        </li>
    );
    const navigate = useNavigate();

    const walletWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    style={{
                        marginLeft: isOwnerActiveAccount ? '-100px' : '-50px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    <p>{ensName ? ensName : ownerId}</p>
                    <NavLink
                        onClick={() => {
                            dispatch(
                                setDataLoadingStatus({
                                    datasetName: 'lookupUserTxData',
                                    loadingStatus: true,
                                }),
                            );
                        }}
                        to={`/${
                            isOwnerActiveAccount
                                ? 'account'
                                : ensName
                                ? ensName
                                : ownerId
                        }`}
                    >
                        {'View Account' + 'ㅤ'}
                        <FiExternalLink size={'12px'} />
                    </NavLink>
                </div>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={() => {
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'lookupUserTxData',
                            loadingStatus: true,
                        }),
                    );
                    navigate(
                        `/${
                            isOwnerActiveAccount
                                ? 'account'
                                : ensName
                                ? ensName
                                : ownerId
                        }`,
                    );
                }}
                data-label='wallet'
                className={`${usernameStyle} ${styles.hover_style}`}
                style={{ textTransform: 'lowercase' }}
            >
                {userNameToDisplay}
            </li>
        </TextOnlyTooltip>
    );

    const baseTokenLogoComponent = baseTokenLogo ? (
        <img src={baseTokenLogo} alt='base token' width={logoSizes} />
    ) : (
        <NoTokenIcon
            tokenInitial={limitOrder.baseSymbol.charAt(0)}
            width={logoSizes}
        />
    );

    const quoteTokenLogoComponent = quoteTokenLogo ? (
        <img src={quoteTokenLogo} alt='quote token' width={logoSizes} />
    ) : (
        <NoTokenIcon
            tokenInitial={limitOrder.quoteSymbol.charAt(0)}
            width={logoSizes}
        />
    );

    const pair =
        limitOrder.base !== ZERO_ADDRESS
            ? [
                  `${limitOrder.baseSymbol}: ${limitOrder.base}`,
                  `${limitOrder.quoteSymbol}: ${limitOrder.quote}`,
              ]
            : [`${limitOrder.quoteSymbol}: ${limitOrder.quote}`];
    // eslint-disable-next-line
    const tip = pair.join('\n');

    const tradeLinkPath =
        '/trade/limit/' +
        'chain=' +
        limitOrder.chainId +
        '&tokenA=' +
        limitOrder.quote +
        '&tokenB=' +
        limitOrder.base;

    const tokenPair = (
        // <DefaultTooltip
        //     interactive
        //     title={<div style={{ whiteSpace: 'pre-line' }}>{tip}</div>}
        //     placement={'left'}
        //     arrow
        //     enterDelay={150}
        //     leaveDelay={0}
        // >
        <li
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <NavLink to={tradeLinkPath}>
                {baseTokenSymbol} / {quoteTokenSymbol}
            </NavLink>
        </li>
        // </DefaultTooltip>
    );

    const positionTime =
        limitOrder.latestUpdateTime || limitOrder.timeFirstMint;

    const elapsedTimeInSecondsNum = positionTime
        ? moment(Date.now()).diff(positionTime * 1000, 'seconds')
        : 0;

    const elapsedTimeString =
        elapsedTimeInSecondsNum !== undefined
            ? elapsedTimeInSecondsNum < 60
                ? '< 1 min. '
                : elapsedTimeInSecondsNum < 120
                ? '1 min. '
                : elapsedTimeInSecondsNum < 3600
                ? `${Math.floor(elapsedTimeInSecondsNum / 60)} min. `
                : elapsedTimeInSecondsNum < 7200
                ? '1 hour '
                : elapsedTimeInSecondsNum < 86400
                ? `${Math.floor(elapsedTimeInSecondsNum / 3600)} hrs. `
                : elapsedTimeInSecondsNum < 172800
                ? '1 day '
                : `${Math.floor(elapsedTimeInSecondsNum / 86400)} days `
            : 'Pending...';

    const baseQtyDisplayWithTooltip = (
        <li
            onClick={openDetailsModal}
            data-label={baseTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                }}
            >
                {baseDisplay}
                {baseTokenLogoComponent}
            </div>
        </li>
    );
    const quoteQtyDisplayWithTooltip = (
        <li
            onClick={openDetailsModal}
            data-label={quoteTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                }}
            >
                {quoteDisplay}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

    const OrderTimeWithTooltip = limitOrder.timeFirstMint ? (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    style={{
                        marginLeft: '-70px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {'First Minted: ' +
                        moment(limitOrder.timeFirstMint * 1000).format(
                            'MM/DD/YYYY HH:mm',
                        )}
                </p>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={openDetailsModal}
                style={{ textTransform: 'lowercase' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                <p className='base_color'>{elapsedTimeString}</p>
            </li>
        </TextOnlyTooltip>
    ) : (
        <li
            onClick={openDetailsModal}
            style={{ textTransform: 'lowercase' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <p className='base_color'>{elapsedTimeString}</p>
        </li>
    );

    const [showHighlightedButton, setShowHighlightedButton] = useState(false);

    const handleAccountClick = () => {
        if (!isOnPortfolioPage) {
            dispatch(
                setDataLoadingStatus({
                    datasetName: 'lookupUserTxData',
                    loadingStatus: true,
                }),
            );
            navigate(
                `/${
                    isOwnerActiveAccount
                        ? 'account'
                        : ensName
                        ? ensName
                        : ownerId
                }`,
            );
        } else {
            openDetailsModal();
        }
    };

    return (
        <ul
            onMouseEnter={() => setShowHighlightedButton(true)}
            onMouseLeave={() => setShowHighlightedButton(false)}
            className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle}`}
            id={orderDomId}
            style={{ cursor: 'pointer', backgroundColor: highlightStyle }}
            onClick={() =>
                limitOrder.limitOrderIdentifier === currentPositionActive
                    ? null
                    : setCurrentPositionActive('')
            }
            ref={currentPositionActive ? activePositionRef : null}
        >
            {!showColumns && OrderTimeWithTooltip}
            {isOnPortfolioPage && showPair && tokenPair}
            {!showColumns && IDWithTooltip}
            {!isOnPortfolioPage && !showColumns && walletWithTooltip}
            {showColumns && (
                <li data-label='id'>
                    <p
                        className={`base_color ${styles.hover_style} ${styles.mono_font}`}
                    >
                        {posHashTruncated}
                    </p>{' '}
                    <p
                        className={`${usernameStyle} ${styles.hover_style} `}
                        onClick={handleAccountClick}
                        style={{ textTransform: 'lowercase' }}
                    >
                        {userNameToDisplay}
                    </p>
                </li>
            )}
            {!ipadView && (
                <li
                    onClick={openDetailsModal}
                    data-label='price'
                    className={priceStyle + ' ' + sellOrderStyle}
                    style={{ textAlign: 'right' }}
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                >
                    {isOnPortfolioPage
                        ? (
                              <p className={`${styles.align_right} `}>
                                  <span>{priceCharacter}</span>
                                  <span>
                                      {truncatedDisplayPriceDenomByMoneyness}
                                  </span>
                              </p>
                          ) || '…'
                        : (
                              <p className={`${styles.align_right} `}>
                                  <span>{priceCharacter}</span>
                                  <span>{truncatedDisplayPrice}</span>
                              </p>
                          ) || '…'}
                </li>
            )}
            {!showColumns && (
                <li
                    style={{ textAlign: 'center' }}
                    onClick={openDetailsModal}
                    data-label='side'
                    className={sellOrderStyle}
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                >
                    {`${sideType} ${sideCharacter}`}
                </li>
            )}
            {!showColumns && (
                <li
                    onClick={openDetailsModal}
                    data-label='type'
                    className={sellOrderStyle}
                    style={{ textAlign: 'center' }}
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                >
                    Order
                </li>
            )}
            {showColumns && !ipadView && (
                <li
                    data-label='side-type'
                    className={sellOrderStyle}
                    style={{ textAlign: 'center' }}
                    onClick={openDetailsModal}
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                >
                    <p>Order</p>
                    <p>{`${sideType} ${sideCharacter}`}</p>
                </li>
            )}

            {ValueWithTooltip}
            {!showColumns && baseQtyDisplayWithTooltip}
            {!showColumns && quoteQtyDisplayWithTooltip}
            {showColumns && (
                <li
                    data-label={baseTokenSymbol + quoteTokenSymbol}
                    className='base_color'
                    onClick={openDetailsModal}
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                >
                    <div
                        className={styles.token_qty}
                        style={{
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {' '}
                        {baseDisplay} {baseTokenLogoComponent}
                    </div>

                    <div
                        className={styles.token_qty}
                        style={{
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {' '}
                        {quoteDisplay}
                        {quoteTokenLogoComponent}
                    </div>
                </li>
            )}
            {!ipadView && (
                <li
                    onClick={openDetailsModal}
                    data-label='status'
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <OpenOrderStatus isFilled={isOrderFilled} />
                    </div>
                </li>
            )}
            <li data-label='menu'>
                <OrdersMenu
                    account={account}
                    chainData={chainData}
                    isShowAllEnabled={isShowAllEnabled}
                    tradeData={tradeData}
                    limitOrder={limitOrder}
                    {...orderMenuProps}
                    showSidebar={showSidebar}
                    handlePulseAnimation={handlePulseAnimation}
                    lastBlockNumber={lastBlockNumber}
                    showHighlightedButton={showHighlightedButton}
                    isBaseTokenMoneynessGreaterOrEqual={
                        isBaseTokenMoneynessGreaterOrEqual
                    }
                    isOnPortfolioPage={isOnPortfolioPage}
                />
            </li>
        </ul>
    );
}
