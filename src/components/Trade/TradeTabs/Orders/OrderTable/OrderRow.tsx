import {
    Dispatch,
    MutableRefObject,
    SetStateAction,
    memo,
    useContext,
    useEffect,
    useRef,
} from 'react';
import {
    LimitModalAction,
    LimitOrderIF,
} from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import { OrderRow as OrderRowStyled } from '../../../../../styled/Components/TransactionTable';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { useProcessOrder } from '../../../../../utils/hooks/useProcessOrder';
import OrdersMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import { orderRowConstants } from '../orderRowConstants';
interface propsIF {
    limitOrder: LimitOrderIF;
    isAccountView: boolean;
    tableView: 'small' | 'medium' | 'large';
    openDetailsModal: () => void;
    openActionModal: () => void;
    setLimitModalAction: Dispatch<SetStateAction<LimitModalAction>>;
    observedRowRef: MutableRefObject<HTMLDivElement | null> | undefined;
}

function OrderRow(props: propsIF) {
    const {
        tableView,
        limitOrder,
        isAccountView,
        openDetailsModal,
        openActionModal,
        setLimitModalAction,
        observedRowRef,
    } = props;
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const { showAllData: showAllDataSelection, currentLimitOrderActive } =
        useContext(TradeTableContext);
    const { crocEnv } = useContext(CrocEnvContext);

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;

    const { userAddress } = useContext(UserDataContext);

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
        displayPriceInUsd,
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
    } = useProcessOrder(limitOrder, crocEnv, userAddress, isAccountView);

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
        limitOrder.limitOrderId === currentLimitOrderActive ||
        posHash === currentLimitOrderActive
            ? `order-${limitOrder.limitOrderId}`
            : '';

    const activePositionRef = useRef(null);

    function scrollToDiv() {
        const element = document.getElementById(orderDomId);
        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
        });
    }

    useEffect(() => {
        limitOrder.limitOrderId === currentLimitOrderActive ||
        posHash === currentLimitOrderActive
            ? scrollToDiv()
            : null;
    }, [currentLimitOrderActive]);

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
                        ? 'account' + '/limits'
                        : ensName
                          ? ensName + '/limits'
                          : ownerId + '/limits'
                }`,
            );
    }

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
        displayPriceInUsd,
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
        isBaseTokenMoneynessGreaterOrEqual,
    };

    const {
        IDWithTooltip,
        ValueWithTooltip,
        walletWithTooltip,
        tokenPair,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        OrderTimeWithTooltip,
        priceDisplay,
        typeDisplay,
        sideDisplay,
        sideTypeColumn,
        tokensColumn,
        statusDisplay,
        hiddenIDColumn,
    } = orderRowConstants(orderRowConstantsProps);

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
                active={
                    limitOrder.limitOrderId === currentLimitOrderActive ||
                    posHash === currentLimitOrderActive
                }
                user={userNameToDisplay === 'You' && showAllData}
                id={orderDomId}
                onClick={openDetailsModal}
                ref={currentLimitOrderActive ? activePositionRef : null}
                tabIndex={0}
                onKeyDown={handleKeyPress}
                data-type='infinite-scroll-row'
            >
                {hiddenIDColumn}
                {tableView === 'large' && OrderTimeWithTooltip}
                {isAccountView && tokenPair}
                {(tableView === 'large' ||
                    (tableView === 'medium' && isAccountView)) &&
                    IDWithTooltip}
                {!isAccountView && walletWithTooltip}
                {tableView !== 'small' && priceDisplay}
                {tableView === 'large' && sideDisplay}
                {tableView === 'large' && typeDisplay}
                {tableView !== 'large' && sideTypeColumn}
                {ValueWithTooltip}
                {tableView === 'large' && baseQtyDisplayWithTooltip}
                {tableView === 'large' && quoteQtyDisplayWithTooltip}
                {tableView === 'medium' && tokensColumn}
                {tableView !== 'small' && statusDisplay}

                <div data-label='menu' ref={observedRowRef}>
                    <OrdersMenu
                        limitOrder={limitOrder}
                        {...orderMenuProps}
                        isAccountView={isAccountView}
                        openDetailsModal={openDetailsModal}
                        openActionModal={openActionModal}
                        setLimitModalAction={setLimitModalAction}
                        tableView={tableView}
                        handleWalletLinkClick={handleWalletLinkClick}
                    />
                </div>
            </OrderRowStyled>
        </>
    );
}

export default memo(OrderRow);
