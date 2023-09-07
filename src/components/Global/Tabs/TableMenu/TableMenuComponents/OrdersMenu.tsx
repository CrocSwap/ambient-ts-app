// START: Import React and Dongles
import { useState, useRef, useEffect, useContext } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
// START: Import JSX Functional Components

// START: Import Local Files
import styles from './TableMenus.module.css';
import OrderDetailsModal from '../../../../OrderDetails/OrderDetailsModal/OrderDetailsModal';
import LimitActionModal from '../../../../LimitActionModal/LimitActionModal';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../../utils/hooks/reduxToolkit';
import {
    setLimitTick,
    setLimitTickCopied,
    setShouldLimitDirectionReverse,
} from '../../../../../utils/state/tradeDataSlice';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { useModal } from '../../../Modal/useModal';
import { OptionButton } from '../../../Button/OptionButton';

// interface for React functional component props
interface propsIF {
    limitOrder: LimitOrderIF;
    isOwnerActiveAccount?: boolean;
    isOrderFilled: boolean;
    isAccountView: boolean;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    handleAccountClick: () => void;
}

export type LimitActionType = 'Remove' | 'Claim';

// React functional component
export default function OrdersMenu(props: propsIF) {
    const {
        limitOrder,
        isOrderFilled,
        isOwnerActiveAccount,
        isBaseTokenMoneynessGreaterOrEqual,
        isAccountView,
        handleAccountClick,
    } = props;

    const menuItemRef = useRef<HTMLDivElement>(null);

    const { chainData } = useContext(CrocEnvContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { handlePulseAnimation } = useContext(TradeTableContext);

    const tradeData = useAppSelector((state) => state.tradeData);

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    const dispatch = useAppDispatch();

    // -----------------SNACKBAR----------------
    function handleCopyOrder() {
        handlePulseAnimation('limitOrder');
        dispatch(setLimitTickCopied(true));

        const shouldReverse =
            tradeData.tokenA.address.toLowerCase() ===
            (limitOrder.isBid
                ? limitOrder.quote.toLowerCase()
                : limitOrder.base.toLowerCase());

        if (shouldReverse) {
            dispatch(setShouldLimitDirectionReverse(true));
        }

        // why is this is in on a half-second delay?
        setTimeout(() => {
            dispatch(
                setLimitTick(
                    limitOrder.isBid ? limitOrder.bidTick : limitOrder.askTick,
                ),
            );
        }, 500);

        setShowDropdownMenu(false);
    }

    // -----------------END OF SNACKBAR----------------

    const [isDetailsModalOpen, openDetailsModal, closeDetailsModal] =
        useModal();

    const [isActionModalOpen, openActionModal, closeActionModal] = useModal();
    const [limitModalAction, setLimitModalAction] =
        useState<LimitActionType>('Remove');

    const openLimitDetailsModal = () => {
        setShowDropdownMenu(false);
        openDetailsModal();
    };

    const openLimitActionModal = (type: LimitActionType) => {
        setShowDropdownMenu(false);
        setLimitModalAction(type);
        openActionModal();
    };

    const showAbbreviatedCopyTradeButton = isAccountView
        ? isSidebarOpen
            ? useMediaQuery('(max-width: 1400px)')
            : useMediaQuery('(max-width: 1150px)')
        : isSidebarOpen
        ? useMediaQuery('(max-width: 1500px)')
        : useMediaQuery('(max-width: 1250px)');

    // ------------------  END OF MODAL FUNCTIONALITY-----------------

    const minView = useMediaQuery('(min-width: 720px)');
    const view3 = useMediaQuery('(min-width: 2300px)');

    const view2WithNoSidebar =
        useMediaQuery('(min-width: 1680px)') && !isSidebarOpen;

    const walletButton = (
        <OptionButton
            ariaLabel='View wallet.'
            onClick={handleAccountClick}
            content={
                <>
                    Wallet
                    <FiExternalLink
                        size={15}
                        color='white'
                        style={{ marginLeft: '.5rem' }}
                    />
                </>
            }
        />
    );
    const removeButton =
        limitOrder && isOwnerActiveAccount && !isOrderFilled ? (
            <OptionButton
                onClick={() => openLimitActionModal('Remove')}
                content='Remove'
            />
        ) : null;
    const claimButton =
        limitOrder && isOwnerActiveAccount && isOrderFilled ? (
            <OptionButton
                onClick={() => openLimitActionModal('Claim')}
                content='Claim'
            />
        ) : null;
    const copyButton = limitOrder ? (
        <OptionButton
            onClick={() => {
                dispatch(setLimitTickCopied(true));
                linkGenLimit.navigate(
                    limitOrder.isBid
                        ? {
                              chain: chainData.chainId,
                              tokenA: limitOrder.base,
                              tokenB: limitOrder.quote,
                              limitTick: limitOrder.bidTick,
                          }
                        : {
                              chain: chainData.chainId,
                              tokenA: limitOrder.quote,
                              tokenB: limitOrder.base,
                              limitTick: limitOrder.askTick,
                          },
                );
                handleCopyOrder();
            }}
            content={showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
        />
    ) : null;
    const detailsButton = (
        <OptionButton onClick={openLimitDetailsModal} content='Details' />
    );

    const ordersMenu = (
        <div className={styles.actions_menu}>
            {(view3 || view2WithNoSidebar) && detailsButton}
            {minView && claimButton}
            {minView && removeButton}
            {!isOwnerActiveAccount && copyButton}
        </div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {detailsButton}
            {isOwnerActiveAccount && copyButton}
            {!minView && removeButton}
            {walletButton}
        </div>
    );

    const [showDropdownMenu, setShowDropdownMenu] = useState(false);

    const wrapperStyle = showDropdownMenu
        ? styles.dropdown_wrapper_active
        : styles.dropdown_wrapper;

    const clickOutsideHandler = () => {
        setShowDropdownMenu(false);
    };

    UseOnClickOutside(menuItemRef, clickOutsideHandler);
    const dropdownOrdersMenu = (
        <div className={styles.dropdown_menu} ref={menuItemRef}>
            <div
                onClick={() => setShowDropdownMenu(!showDropdownMenu)}
                className={styles.dropdown_button}
            >
                <CiCircleMore size={25} color='var(--text1)' />
            </div>
            <div className={wrapperStyle}>{menuContent}</div>
        </div>
    );

    useEffect(() => {
        if (showDropdownMenu) {
            const interval = setTimeout(() => {
                setShowDropdownMenu(false);
            }, 5000);
            return () => clearTimeout(interval);
        } else return;
    }, [showDropdownMenu]);
    return (
        <div onClick={(event) => event.stopPropagation()}>
            <div className={styles.main_container}>
                {ordersMenu}
                {dropdownOrdersMenu}
            </div>
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
            {isActionModalOpen && (
                <LimitActionModal
                    limitOrder={limitOrder}
                    type={limitModalAction}
                    isOpen={isActionModalOpen}
                    onClose={closeActionModal}
                />
            )}
        </div>
    );
}
