import styles from '../Orders.module.css';
import { useProcessOrder } from '../../../../../utils/hooks/useProcessOrder';
import OrdersMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import OrderDetails from '../../../../OrderDetails/OrderDetails';

import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { ChainSpec } from '@crocswap-libs/sdk';

import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import { tradeData } from '../../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import { IS_LOCAL_ENV } from '../../../../../constants';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { orderRowConstants } from '../orderRowConstants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';

interface propsIF {
    chainData: ChainSpec;
    tradeData: tradeData;
    expandTradeTable: boolean;
    showColumns: boolean;
    ipadView: boolean;
    view2: boolean;
    limitOrder: LimitOrderIF;
    showPair: boolean;
    lastBlockNumber: number;

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
        chainData,
        tradeData,
        showColumns,
        ipadView,
        showPair,
        limitOrder,
        currentPositionActive,
        setCurrentPositionActive,
        isShowAllEnabled,
        isOnPortfolioPage,
        handlePulseAnimation,
        lastBlockNumber,
    } = props;
    const {
        globalModal: { open: openGlobalModal, close: closeGlobalModal },
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

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
    } = useProcessOrder(limitOrder, account, isOnPortfolioPage);

    const orderMenuProps = {
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
            ? `${styles.border_left} ${sideType}_style`
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
        if (!isOnPortfolioPage)
            dispatch(
                setDataLoadingStatus({
                    datasetName: 'lookupUserTxData',
                    loadingStatus: isOnPortfolioPage ? false : true,
                }),
            );

        window.open(
            `/${
                isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
            }`,
        );
    }

    const [showHighlightedButton, setShowHighlightedButton] = useState(false);
    // eslint-disable-next-line
    const handleAccountClick = () => {
        if (!isOnPortfolioPage) {
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
        isOnPortfolioPage,
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

    return (
        <>
            <ul
                onMouseEnter={() => setShowHighlightedButton(true)}
                onMouseLeave={() => setShowHighlightedButton(false)}
                className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle}`}
                id={orderDomId}
                style={{ backgroundColor: highlightStyle }}
                onClick={handleRowClick}
                ref={currentPositionActive ? activePositionRef : null}
            >
                {!showColumns && OrderTimeWithTooltip}
                {isOnPortfolioPage && showPair && tokenPair}
                {!showColumns && <li>{IDWithTooltip}</li>}
                {!showColumns && !isOnPortfolioPage && (
                    <li>{walletWithTooltip}</li>
                )}
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

                <li data-label='menu'>
                    <OrdersMenu
                        account={account}
                        chainData={chainData}
                        isShowAllEnabled={isShowAllEnabled}
                        tradeData={tradeData}
                        limitOrder={limitOrder}
                        {...orderMenuProps}
                        handlePulseAnimation={handlePulseAnimation}
                        lastBlockNumber={lastBlockNumber}
                        showHighlightedButton={showHighlightedButton}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        isOnPortfolioPage={isOnPortfolioPage}
                        handleAccountClick={handleAccountClick}
                    />
                </li>
            </ul>
        </>
    );
}
