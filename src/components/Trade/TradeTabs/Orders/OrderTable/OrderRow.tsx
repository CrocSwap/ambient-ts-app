import styles from '../Orders.module.css';
import { useProcessOrder } from '../../../../../utils/hooks/useProcessOrder';
import OpenOrderStatus from '../../../../Global/OpenOrderStatus/OpenOrderStatus';
import OrdersMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import OrderDetails from '../../../../OrderDetails/OrderDetails';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { DefaultTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import { NavLink } from 'react-router-dom';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import { tradeData } from '../../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import moment from 'moment';
import { ZERO_ADDRESS } from '../../../../../constants';
import { FiExternalLink } from 'react-icons/fi';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';

interface OrderRowPropsIF {
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    tradeData: tradeData;
    expandTradeTable: boolean;
    showColumns: boolean;
    ipadView: boolean;
    view2: boolean;
    limitOrder: LimitOrderIF;
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
export default function OrderRow(props: OrderRowPropsIF) {
    const {
        account,
        crocEnv,
        chainData,
        tradeData,
        showColumns,
        ipadView,
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
        side,
        usdValue,
        usdValueLocaleString,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
        ensName,
        // orderMatchesSelectedTokens,
        truncatedDisplayPriceDenomByMoneyness,

        baseTokenCharacter,
        quoteTokenCharacter,
        isDenomBase,
    } = useProcessOrder(limitOrder, account);

    const orderMenuProps = {
        crocEnv: crocEnv,
        closeGlobalModal: props.closeGlobalModal,
        openGlobalModal: props.openGlobalModal,
        isOwnerActiveAccount: isOwnerActiveAccount,
        isOrderFilled: isOrderFilled,
        isOnPortfolioPage: isOnPortfolioPage,
    };

    const dispatch = useAppDispatch();

    const sideCharacter = isDenomBase ? baseTokenCharacter : quoteTokenCharacter;

    const sellOrderStyle = side === 'sell' ? 'order_sell' : 'order_buy';

    const usernameStyle = ensName || isOwnerActiveAccount ? 'gradient_text' : 'base_color';

    const userPositionStyle =
        userNameToDisplay === 'You' && isShowAllEnabled ? styles.border_left : null;

    const openDetailsModal = () => {
        console.log({ limitOrder });

        openGlobalModal(
            <OrderDetails
                account={account}
                limitOrder={limitOrder}
                closeGlobalModal={closeGlobalModal}
                lastBlockNumber={lastBlockNumber}
            />,
        );
    };
    const orderDomId =
        limitOrder.limitOrderIdentifier === currentPositionActive
            ? `order-${limitOrder.limitOrderIdentifier}`
            : '';

    // console.log(rangeDetailsProps.lastBlockNumber);

    const activePositionRef = useRef(null);

    const clickOutsideHandler = () => {
        setCurrentPositionActive('');
    };
    useOnClickOutside(activePositionRef, clickOutsideHandler);

    function scrollToDiv() {
        const element = document.getElementById(orderDomId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }

    useEffect(() => {
        limitOrder.limitOrderIdentifier === currentPositionActive ? scrollToDiv() : null;
    }, [currentPositionActive]);

    const activePositionStyle =
        limitOrder.limitOrderIdentifier === currentPositionActive
            ? styles.active_position_style
            : '';

    const IDWithTooltip = (
        <DefaultTooltip
            interactive
            title={posHash}
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li
                onClick={openDetailsModal}
                data-label='id'
                className='base_color'
                style={{ fontFamily: 'monospace' }}
            >
                {posHashTruncated}
            </li>
        </DefaultTooltip>
    );

    const ValueWithTooltip = (
        <DefaultTooltip
            interactive
            title={'$' + usdValueLocaleString}
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li
                onClick={openDetailsModal}
                data-label='value'
                className='gradient_text'
                style={{ textAlign: 'right', fontFamily: 'monospace' }}
            >
                {' '}
                {'$' + usdValue}
            </li>
        </DefaultTooltip>
    );

    const walletWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <div>
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
                        to={`/${isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId}`}
                    >
                        {'View Account' + 'ㅤ'}
                        <FiExternalLink size={'12px'} />
                    </NavLink>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li
                onClick={openDetailsModal}
                data-label='wallet'
                className={usernameStyle}
                style={{ textTransform: 'lowercase', fontFamily: 'monospace' }}
            >
                {userNameToDisplay}
            </li>
        </DefaultTooltip>
    );

    const baseTokenLogoComponent = baseTokenLogo ? (
        <img src={baseTokenLogo} alt='base token' width='20px' />
    ) : (
        <NoTokenIcon tokenInitial={limitOrder.baseSymbol.charAt(0)} width='20px' />
    );

    const quoteTokenLogoComponent = quoteTokenLogo ? (
        <img src={quoteTokenLogo} alt='quote token' width='20px' />
    ) : (
        <NoTokenIcon tokenInitial={limitOrder.quoteSymbol.charAt(0)} width='20px' />
    );

    // const tokensTogether = (
    //     <div
    //         style={{
    //             display: 'flex',
    //             flexDirection: 'row',
    //             alignItems: 'center',
    //             gap: '4px',
    //         }}
    //     >
    //         {baseTokenLogoComponent}
    //         {quoteTokenLogoComponent}
    //     </div>
    // );

    // portfolio page li element ---------------
    // const accountTokenImages = (
    //     <li className={styles.token_images_account}>

    //         {tokensTogether}

    //     </li>
    // );

    const pair =
        limitOrder.base !== ZERO_ADDRESS
            ? [
                  `${limitOrder.baseSymbol}: ${limitOrder.base}`,
                  `${limitOrder.quoteSymbol}: ${limitOrder.quote}`,
              ]
            : [`${limitOrder.quoteSymbol}: ${limitOrder.quote}`];
    const tip = pair.join('\n');

    const tokenPair = (
        <DefaultTooltip
            interactive
            title={<div style={{ whiteSpace: 'pre-line' }}>{tip}</div>}
            placement={'right'}
            arrow
            enterDelay={150}
            leaveDelay={200}
        >
            <li className='base_color'>
                {/* {tokensTogether} */}
                <p>
                    {' '}
                    {baseTokenSymbol} / {quoteTokenSymbol}
                </p>
            </li>
        </DefaultTooltip>
    );

    // const poolName = (
    //     <li className='base_color'>
    //         {baseTokenSymbol} / {quoteTokenSymbol}
    //     </li>
    // );
    // end of portfolio page li element ---------------

    // if (!orderMatchesSelectedTokens) return null;

    // const fillTime = new Intl.DateTimeFormat('en-US', {
    //     month: 'short',
    //     day: 'numeric',
    //     // hour12: false,
    //     hour: '2-digit',
    //     minute: '2-digit',
    //     // second: '2-digit',
    // }).format(limitOrder.time * 1000);

    const positionTime = limitOrder.latestUpdateTime || limitOrder.timeFirstMint;

    const elapsedTimeInSecondsNum = positionTime
        ? moment(Date.now()).diff(positionTime * 1000, 'seconds')
        : 0;

    // const elapsedTimeInSecondsNum = moment(Date.now()).diff(
    //     (limitOrder.latestUpdateTime !== 0
    //         ? limitOrder.latestUpdateTime
    //         : limitOrder.timeFirstMint) * 1000,
    //     // (limitOrder.timeFirstMint || limitOrder.time) * 1000,
    //     'seconds',
    // );

    const elapsedTimeString =
        elapsedTimeInSecondsNum !== undefined
            ? elapsedTimeInSecondsNum < 60
                ? '< 1 min. ago'
                : elapsedTimeInSecondsNum < 120
                ? '1 min. ago'
                : elapsedTimeInSecondsNum < 3600
                ? `${Math.floor(elapsedTimeInSecondsNum / 60)} min. ago`
                : elapsedTimeInSecondsNum < 7200
                ? '1 hour ago'
                : elapsedTimeInSecondsNum < 86400
                ? `${Math.floor(elapsedTimeInSecondsNum / 3600)} hrs. ago`
                : elapsedTimeInSecondsNum < 172800
                ? '1 day ago'
                : `${Math.floor(elapsedTimeInSecondsNum / 86400)} days ago`
            : 'Pending...';

    // const baseQtyToolTipStyle = <p className={styles.tooltip_style}>{baseTokenSymbol + ' Qty'}</p>;
    // const quoteQtyToolTipStyle = (
    //     <p className={styles.tooltip_style}>{quoteTokenSymbol + ' Qty'}</p>
    // );
    const baseQtyDisplayWithTooltip = (
        // <DefaultTooltip
        //     interactive
        //     title={baseQtyToolTipStyle}
        //     placement={'right'}
        //     arrow
        //     enterDelay={150}
        //     leaveDelay={200}
        // >
        <li onClick={openDetailsModal} data-label={baseTokenSymbol} className='color_white'>
            <p
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                }}
            >
                {baseDisplay}
                {baseTokenLogoComponent}
                {/* {<img src={baseTokenLogo} width='15px' alt='' />} */}
                {/* {isOnPortfolioPage && <img src={baseTokenLogo} width='15px' alt='' />} */}
            </p>
        </li>
        /* </DefaultTooltip> */
    );
    const quoteQtyDisplayWithTooltip = (
        // <DefaultTooltip
        //     interactive
        //     title={quoteQtyToolTipStyle}
        //     placement={'right'}
        //     arrow
        //     enterDelay={150}
        //     leaveDelay={200}
        // >
        <li onClick={openDetailsModal} data-label={quoteTokenSymbol} className='color_white'>
            <p
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                }}
            >
                {quoteDisplay}
                {quoteTokenLogoComponent}
                {/* {<img src={quoteTokenLogo} width='15px' alt='' />} */}
                {/* {isOnPortfolioPage && <img src={quoteTokenLogo} width='15px' alt='' />} */}
            </p>
        </li>
        /* </DefaultTooltip> */
    );

    const OrderTimeWithTooltip = limitOrder.timeFirstMint ? (
        <DefaultTooltip
            interactive
            title={
                'First Minted: ' +
                moment(limitOrder.timeFirstMint * 1000).format('MM/DD/YYYY HH:mm')
            }
            placement={'left'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li onClick={openDetailsModal} style={{ textTransform: 'lowercase' }}>
                <p className='base_color' style={{ fontFamily: 'monospace' }}>
                    {elapsedTimeString}
                </p>
                {/* <p className='base_color'> Nov 9 10:36:23 AM</p> */}
            </li>
        </DefaultTooltip>
    ) : (
        <li onClick={openDetailsModal} style={{ textTransform: 'lowercase' }}>
            <p className='base_color' style={{ fontFamily: 'monospace' }}>
                {elapsedTimeString}
            </p>
        </li>
    );

    const [showHighlightedButton, setShowHighlightedButton] = useState(false);

    return (
        <ul
            onMouseEnter={() => setShowHighlightedButton(true)}
            onMouseLeave={() => setShowHighlightedButton(false)}
            className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle}`}
            id={orderDomId}
            style={{ cursor: 'pointer' }}
            onClick={() =>
                limitOrder.limitOrderIdentifier === currentPositionActive
                    ? null
                    : setCurrentPositionActive('')
            }
            ref={currentPositionActive ? activePositionRef : null}
        >
            {/* {isOnPortfolioPage && accountTokenImages} */}
            {!showColumns && OrderTimeWithTooltip}
            {isOnPortfolioPage && !showSidebar && tokenPair}
            {!showColumns && IDWithTooltip}
            {!showColumns && walletWithTooltip}
            {showColumns && (
                <li data-label='id'>
                    <p className='base_color'>{posHashTruncated}</p>{' '}
                    <p className={usernameStyle} style={{ textTransform: 'lowercase' }}>
                        {userNameToDisplay}
                    </p>
                </li>
            )}
            {!ipadView && (
                <li
                    onClick={openDetailsModal}
                    data-label='price'
                    className={sellOrderStyle}
                    style={{ textAlign: 'right', fontFamily: 'monospace' }}
                >
                    {isOnPortfolioPage
                        ? truncatedDisplayPriceDenomByMoneyness || '…'
                        : truncatedDisplayPrice || '…'}
                </li>
            )}
            {!showColumns && (
                <li
                    style={{ textAlign: 'center' }}
                    onClick={openDetailsModal}
                    data-label='side'
                    className={sellOrderStyle}
                >
                    {`${side} ${sideCharacter}`}
                </li>
            )}
            {!showColumns && (
                <li
                    onClick={openDetailsModal}
                    data-label='type'
                    className={sellOrderStyle}
                    style={{ textAlign: 'center' }}
                >
                    Order
                </li>
            )}
            {showColumns && !ipadView && (
                <li
                    data-label='side-type'
                    className={sellOrderStyle}
                    style={{ textAlign: 'center' }}
                >
                    <p>Order</p>
                    <p>{`${side} ${sideCharacter}`}</p>
                </li>
            )}

            {ValueWithTooltip}
            {!showColumns && baseQtyDisplayWithTooltip}
            {!showColumns && quoteQtyDisplayWithTooltip}
            {showColumns && (
                <li data-label={baseTokenSymbol + quoteTokenSymbol} className='color_white'>
                    <p className={styles.token_qty} style={{ fontFamily: 'monospace' }}>
                        {' '}
                        {baseDisplay} {baseTokenLogoComponent}
                    </p>

                    <p className={styles.token_qty} style={{ fontFamily: 'monospace' }}>
                        {' '}
                        {quoteDisplay}
                        {quoteTokenLogoComponent}
                    </p>
                </li>
            )}
            {!ipadView && (
                <li onClick={openDetailsModal} data-label='status'>
                    <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <OpenOrderStatus isFilled={isOrderFilled} />
                    </p>
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
                />
            </li>
        </ul>
    );
}
