import styles from '../Orders.module.css';
import { useProcessOrder } from '../../../../../utils/hooks/useProcessOrder';
import OrdersMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import OrderDetails from '../../../../OrderDetails/OrderDetails';

import { memo, useContext, useEffect, useRef, useState } from 'react';

import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import { tradeData } from '../../../../../utils/state/tradeDataSlice';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../../utils/hooks/reduxToolkit';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import { IS_LOCAL_ENV } from '../../../../../constants';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { orderRowConstants } from '../orderRowConstants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';

interface propsIF {
    tradeData: tradeData;
    showColumns: boolean;
    ipadView: boolean;
    view2: boolean;
    limitOrder: LimitOrderIF;
    showPair: boolean;
    isAccountView: boolean;
}
function OrderRow(props: propsIF) {
    const {
        tradeData,
        showColumns,
        ipadView,
        showPair,
        limitOrder,
        isAccountView,
    } = props;
    const {
        globalModal: { open: openGlobalModal, close: closeGlobalModal },
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        showAllData: showAllDataSelection,
        currentPositionActive,
        setCurrentPositionActive,
    } = useContext(TradeTableContext);

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const {
        posHash,
        ownerId,
        posHashTruncated,
        userNameToDisplay,
        quoteTokenLogo,
        baseTokenLogo,
        baseDisplay,
        quoteDisplay,

        isOrderFilled,
        truncatedDisplayPrice,
        sideType,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
        ensName,

        truncatedDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        baseTokenCharacter,
        quoteTokenCharacter,
        isDenomBase,
        elapsedTimeString,
    } = useProcessOrder(limitOrder, userAddress, isAccountView);

    const orderMenuProps = {
        isOwnerActiveAccount: isOwnerActiveAccount,
        isOrderFilled: isOrderFilled,
        isAccountView: isAccountView,
    };

    const dispatch = useAppDispatch();

    const priceCharacter = isAccountView
        ? isBaseTokenMoneynessGreaterOrEqual
            ? baseTokenCharacter
            : quoteTokenCharacter
        : !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const sideCharacter = isAccountView
        ? isBaseTokenMoneynessGreaterOrEqual
            ? quoteTokenCharacter
            : baseTokenCharacter
        : isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const priceStyle = 'base_color';

    const sellOrderStyle = sideType === 'sell' ? 'order_sell' : 'order_buy';

    const usernameStyle =
        isOwnerActiveAccount && showAllData
            ? 'owned_tx_contrast'
            : ensName || userNameToDisplay === 'You'
            ? 'gradient_text'
            : 'username_base_color';
    // eslint-disable-next-line
    const usernameStyleModule =
        isOwnerActiveAccount && showAllData
            ? styles.owned_tx_contrast
            : ensName
            ? styles.gradient_text
            : styles.base_color;
    const userPositionStyle =
        userNameToDisplay === 'You' && showAllData
            ? `${styles.border_left} ${sideType}_style`
            : null;

    const openDetailsModal = () => {
        IS_LOCAL_ENV && console.debug({ limitOrder });

        openGlobalModal(
            <OrderDetails
                limitOrder={limitOrder}
                closeGlobalModal={closeGlobalModal}
                isBaseTokenMoneynessGreaterOrEqual={
                    isBaseTokenMoneynessGreaterOrEqual
                }
                isAccountView={isAccountView}
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
    const [_, copy] = useCopyToClipboard();

    function handleWalletCopy() {
        copy(limitOrder.user);
        openSnackbar(`${limitOrder.user} copied`, 'info');
    }

    function handleCopyPosHash() {
        copy(posHash.toString());
        openSnackbar(`${posHash.toString()} copied`, 'info');
    }

    function handleWalletLinkClick() {
        if (!isAccountView)
            dispatch(
                setDataLoadingStatus({
                    datasetName: 'lookupUserTxData',
                    loadingStatus: isAccountView ? false : true,
                }),
            );

        window.open(
            `/${
                isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
            }`,
        );
    }

    // eslint-disable-next-line
    const [showHighlightedButton, setShowHighlightedButton] = useState(false);
    const handleAccountClick = () => {
        if (!isAccountView) {
            dispatch(
                setDataLoadingStatus({
                    datasetName: 'lookupUserTxData',
                    loadingStatus: true,
                }),
            );
            const accountUrl = `/${
                isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
            }`;
            window.open(accountUrl);
        } else {
            openDetailsModal();
        }
    };

    const orderRowConstantsProps = {
        posHashTruncated,
        openDetailsModal,
        handleRowMouseDown,
        handleRowMouseOut,
        posHash,
        handleCopyPosHash,
        sellOrderStyle,
        usdValue,
        usernameStyle,
        userNameToDisplay,
        limitOrder,
        handleWalletCopy,
        handleWalletLinkClick,
        baseTokenLogo,
        quoteTokenLogo,
        isOwnerActiveAccount,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseDisplay,
        quoteDisplay,
        elapsedTimeString,
        isAccountView,
        priceCharacter,
        priceStyle,
        truncatedDisplayPrice,
        truncatedDisplayPriceDenomByMoneyness,
        sideType,
        sideCharacter,
        isOrderFilled,
    };

    const {
        IDWithTooltip,
        ValueWithTooltip,
        walletWithTooltip,
        tokenPair,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        OrderTimeWithTooltip,
        txIdColumnComponent,
        priceDisplay,
        typeDisplay,
        sideDisplay,
        sideTypeColumn,
        tokensColumn,
        statusDisplay,
    } = orderRowConstants(orderRowConstantsProps);

    function handleRowClick() {
        if (limitOrder.limitOrderIdentifier === currentPositionActive) {
            return;
        }
        setCurrentPositionActive('');
        openDetailsModal();
    }
    const handleKeyPress: React.KeyboardEventHandler<HTMLUListElement> = (
        event,
    ) => {
        if (event.key === 'Enter') {
            openDetailsModal();
        } else if (event.ctrlKey && event.key === 'c') {
            // These will be shortcuts for the row menu. I will implement these at another time. -JR
        }
    };

    return (
        <>
            <ul
                className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle} row_container_global`}
                id={orderDomId}
                style={{ backgroundColor: highlightStyle }}
                onClick={handleRowClick}
                ref={currentPositionActive ? activePositionRef : null}
                tabIndex={0}
                onKeyDown={handleKeyPress}
            >
                {!showColumns && OrderTimeWithTooltip}
                {isAccountView && showPair && tokenPair}
                {!showColumns && <li>{IDWithTooltip}</li>}
                {!showColumns && !isAccountView && <li>{walletWithTooltip}</li>}
                {showColumns && txIdColumnComponent}
                {!ipadView && priceDisplay}
                {!showColumns && sideDisplay}
                {!showColumns && typeDisplay}
                {showColumns && !ipadView && sideTypeColumn}

                {ValueWithTooltip}
                {!showColumns && baseQtyDisplayWithTooltip}
                {!showColumns && quoteQtyDisplayWithTooltip}
                {showColumns && tokensColumn}
                {!ipadView && statusDisplay}

                <li data-label='menu' className={styles.menu}>
                    <OrdersMenu
                        tradeData={tradeData}
                        limitOrder={limitOrder}
                        {...orderMenuProps}
                        showHighlightedButton={showHighlightedButton}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        isAccountView={isAccountView}
                        handleAccountClick={handleAccountClick}
                    />
                </li>
            </ul>
        </>
    );
}

export default memo(OrderRow);
