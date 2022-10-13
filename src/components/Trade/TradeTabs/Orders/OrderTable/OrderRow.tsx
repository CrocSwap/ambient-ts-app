import { ILimitOrderState } from '../../../../../utils/state/graphDataSlice';
import styles from '../Orders.module.css';
import { useProcessOrder } from '../../../../../utils/hooks/useProcessOrder';
import OpenOrderStatus from '../../../../Global/OpenOrderStatus/OpenOrderStatus';
import OrdersMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import OrderDetails from '../../../../OrderDetails/OrderDetails';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface OrderRowPropsIF {
    showColumns: boolean;
    ipadView: boolean;
    limitOrder: ILimitOrderState;
    showSidebar: boolean;

    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;

    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;

    isShowAllEnabled: boolean;
}
export default function OrderRow(props: OrderRowPropsIF) {
    const {
        showColumns,
        ipadView,
        limitOrder,
        showSidebar,
        openGlobalModal,
        closeGlobalModal,
        currentPositionActive,
        setCurrentPositionActive,
        isShowAllEnabled,
    } = props;

    const {
        posHashTruncated,
        userNameToDisplay,
        quoteTokenLogo,
        baseTokenLogo,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        isOrderFilled,
        truncatedDisplayPrice,
        side,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
        ensName,
        orderMatchesSelectedTokens,
    } = useProcessOrder(limitOrder);

    const orderMenuProps = {
        closeGlobalModal: props.closeGlobalModal,
        openGlobalModal: props.openGlobalModal,
        isOwnerActiveAccount: isOwnerActiveAccount,
    };

    const sellOrderStyle = side === 'sell' ? 'order_sell' : 'order_buy';

    const usernameStyle = ensName || isOwnerActiveAccount ? 'gradient_text' : 'base_color';

    const userPositionStyle =
        userNameToDisplay === 'You' && isShowAllEnabled ? styles.border_left : null;

    const openDetailsModal = () =>
        openGlobalModal(
            <OrderDetails limitOrder={limitOrder} closeGlobalModal={closeGlobalModal} />,
        );
    const orderDomId =
        limitOrder.limitOrderIdentifier === currentPositionActive
            ? `order-${limitOrder.limitOrderIdentifier}`
            : '';

    // console.log(rangeDetailsProps.lastBlockNumber);

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

    if (!orderMatchesSelectedTokens) return null;
    return (
        <ul
            className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle}`}
            id={orderDomId}
            onClick={() =>
                limitOrder.limitOrderIdentifier === currentPositionActive
                    ? null
                    : setCurrentPositionActive('')
            }
        >
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='id' className='base_color'>
                    {posHashTruncated}
                </li>
            )}
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='wallet' className={usernameStyle}>
                    {userNameToDisplay}
                </li>
            )}
            {showColumns && (
                <li data-label='id'>
                    <p className='base_color'>{posHashTruncated}</p>{' '}
                    <p className={usernameStyle}>{userNameToDisplay}</p>
                </li>
            )}
            {!ipadView && (
                <li onClick={openDetailsModal} data-label='price' className={sellOrderStyle}>
                    {truncatedDisplayPrice}
                </li>
            )}

            {!showColumns && (
                <li onClick={openDetailsModal} data-label='side' className={sellOrderStyle}>
                    {side}
                </li>
            )}
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='type' className={sellOrderStyle}>
                    Order
                </li>
            )}
            {showColumns && !ipadView && (
                <li data-label='side-type' className={sellOrderStyle}>
                    <p>{side}</p>
                    <p>Order</p>
                </li>
            )}
            <li onClick={openDetailsModal} data-label='value' className='gradient_text'>
                {' '}
                {usdValue}
            </li>

            {!showColumns && !showSidebar && (
                <li onClick={openDetailsModal} data-label={baseTokenSymbol} className='color_white'>
                    <p>{baseDisplayFrontend}</p>
                </li>
            )}
            {!showColumns && !showSidebar && (
                <li
                    onClick={openDetailsModal}
                    data-label={quoteTokenSymbol}
                    className='color_white'
                >
                    <p>{quoteDisplayFrontend}</p>
                </li>
            )}
            {(showColumns || showSidebar) && (
                <li data-label={baseTokenSymbol + quoteTokenSymbol} className='color_white'>
                    <p className={styles.align_center}>
                        {' '}
                        <img src={baseTokenLogo} alt='' width='15px' />
                        {baseDisplayFrontend}{' '}
                    </p>

                    <p className={styles.align_center}>
                        {' '}
                        <img src={quoteTokenLogo} alt='' width='15px' />
                        {quoteDisplayFrontend}
                    </p>
                </li>
            )}
            {!ipadView && (
                <li onClick={openDetailsModal} data-label='status'>
                    <OpenOrderStatus isFilled={isOrderFilled} />
                </li>
            )}

            <li data-label='menu' style={{ width: showColumns ? '50px' : '100px' }}>
                <OrdersMenu limitOrder={limitOrder} {...orderMenuProps} />
            </li>
        </ul>
    );
}
