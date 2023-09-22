import { useProcessOrder } from '../../../../../utils/hooks/useProcessOrder';
import OrdersMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import OrderDetailsModal from '../../../../OrderDetails/OrderDetailsModal/OrderDetailsModal';
import { memo, useContext, useEffect, useRef } from 'react';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { orderRowConstants } from '../orderRowConstants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { useModal } from '../../../../Global/Modal/useModal';
import { OrderRow as OrderRowStyled } from '../../../../../styled/Components/TransactionTable';
interface propsIF {
    limitOrder: LimitOrderIF;
    isAccountView: boolean;
    tableView: 'small' | 'medium' | 'large';
}

function OrderRow(props: propsIF) {
    const { tableView, limitOrder, isAccountView } = props;
    const {
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
        isLimitOrderPartiallyFilled,
        truncatedDisplayPrice,
        sideType,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
        ensName,
        fillPercentage,
        truncatedDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        baseTokenCharacter,
        quoteTokenCharacter,
        isDenomBase,
        elapsedTimeString,
        baseTokenAddress,
        quoteTokenAddress,
        originalPositionLiqBase,
        originalPositionLiqQuote,
        expectedPositionLiqBase,
        expectedPositionLiqQuote,
    } = useProcessOrder(limitOrder, userAddress, isAccountView);

    const [isDetailsModalOpen, openDetailsModal, closeDetailsModal] =
        useModal();

    const orderMenuProps = {
        isOwnerActiveAccount: isOwnerActiveAccount,
        isOrderFilled: isOrderFilled,
        isAccountView: isAccountView,
    };

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

    const usernameColor: 'text1' | 'accent1' | 'accent2' =
        isOwnerActiveAccount && showAllData
            ? 'accent2'
            : ensName || userNameToDisplay === 'You'
            ? 'accent1'
            : 'text1';

    const orderDomId =
        limitOrder.limitOrderId === currentPositionActive
            ? `order-${limitOrder.limitOrderId}`
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
        limitOrder.limitOrderId === currentPositionActive
            ? scrollToDiv()
            : null;
    }, [currentPositionActive]);

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
            window.open(
                `/${
                    isOwnerActiveAccount
                        ? 'account'
                        : ensName
                        ? ensName
                        : ownerId
                }`,
            );
    }

    const handleAccountClick = () => {
        if (!isAccountView) {
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
        posHash,
        ensName,
        handleCopyPosHash,
        usdValue,
        usernameColor,
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
        baseTokenAddress,
        quoteTokenAddress,
        isLimitOrderPartiallyFilled,
        originalPositionLiqBase,
        originalPositionLiqQuote,
        expectedPositionLiqBase,
        expectedPositionLiqQuote,
        fillPercentage,
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
        if (limitOrder.limitOrderId === currentPositionActive) {
            return;
        }
        setCurrentPositionActive('');
        openDetailsModal();
    }

    const handleKeyPress: React.KeyboardEventHandler<HTMLDivElement> = (
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
            <OrderRowStyled
                size={tableView}
                account={isAccountView}
                active={limitOrder.limitOrderId === currentPositionActive}
                user={userNameToDisplay === 'You' && showAllData}
                id={orderDomId}
                onClick={handleRowClick}
                ref={currentPositionActive ? activePositionRef : null}
                tabIndex={0}
                onKeyDown={handleKeyPress}
            >
                {tableView === 'large' && OrderTimeWithTooltip}
                {isAccountView && tokenPair}
                {tableView === 'large' && <div>{IDWithTooltip}</div>}
                {tableView === 'large' && !isAccountView && (
                    <div>{walletWithTooltip}</div>
                )}
                {tableView !== 'large' && txIdColumnComponent}
                {tableView !== 'small' && priceDisplay}
                {tableView === 'large' && sideDisplay}
                {tableView === 'large' && typeDisplay}
                {tableView !== 'large' && sideTypeColumn}
                {ValueWithTooltip}
                {tableView === 'large' && baseQtyDisplayWithTooltip}
                {tableView === 'large' && quoteQtyDisplayWithTooltip}
                {tableView === 'medium' && tokensColumn}
                {tableView !== 'small' && statusDisplay}

                <div data-label='menu'>
                    <OrdersMenu
                        limitOrder={limitOrder}
                        {...orderMenuProps}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        isAccountView={isAccountView}
                        handleAccountClick={handleAccountClick}
                    />
                </div>
            </OrderRowStyled>
            {isDetailsModalOpen && (
                <OrderDetailsModal
                    limitOrder={limitOrder}
                    isBaseTokenMoneynessGreaterOrEqual={
                        isBaseTokenMoneynessGreaterOrEqual
                    }
                    isAccountView={isAccountView}
                    onClose={closeDetailsModal}
                />
            )}
        </>
    );
}

export default memo(OrderRow);
