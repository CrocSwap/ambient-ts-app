// START: Import React and Dongles
import { useState, ReactNode, useRef, useEffect, useContext } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
// START: Import JSX Functional Components
import Modal from '../../../../Global/Modal/Modal';

// START: Import Local Files
import styles from './TableMenus.module.css';
import { useModal } from '../../../../Global/Modal/useModal';
import OrderDetails from '../../../../OrderDetails/OrderDetails';
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
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';

// interface for React functional component props
interface propsIF {
    limitOrder: LimitOrderIF;
    isOwnerActiveAccount?: boolean;
    isOrderFilled: boolean;
    isAccountView: boolean;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    handleAccountClick: () => void;
}

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

    const {
        globalModal: { open: openGlobalModal },
    } = useContext(AppStateContext);
    const { chainData } = useContext(CrocEnvContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { handlePulseAnimation } = useContext(TradeTableContext);

    const tradeData = useAppSelector((state) => state.tradeData);

    const [isModalOpen, closeModal] = useModal();

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    // ---------------------MODAL FUNCTIONALITY----------------
    let modalContent: ReactNode;
    let modalTitle;

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

    const openRemoveModal = () =>
        openGlobalModal(
            <LimitActionModal limitOrder={limitOrder} type='Remove' />,
        );
    const openClaimModal = () =>
        openGlobalModal(
            <LimitActionModal limitOrder={limitOrder} type='Claim' />,
        );

    const openDetailsModal = () =>
        openGlobalModal(
            <OrderDetails
                limitOrder={limitOrder}
                isBaseTokenMoneynessGreaterOrEqual={
                    isBaseTokenMoneynessGreaterOrEqual
                }
                isAccountView={isAccountView}
            />,
        );

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    // ------------------  END OF MODAL FUNCTIONALITY-----------------

    const minView = useMediaQuery('(min-width: 720px)');
    const view3 = useMediaQuery('(min-width: 2300px)');

    const view2WithNoSidebar =
        useMediaQuery('(min-width: 1680px)') && !isSidebarOpen;

    const removeButtonOnClick = () => {
        setShowDropdownMenu(false);
        openRemoveModal();
    };
    const claimButtonOnClick = () => {
        setShowDropdownMenu(false);
        openClaimModal();
    };

    const detailsButtonOnClick = () => {
        setShowDropdownMenu(false);
        openDetailsModal();
    };

    const walletButton = (
        <button
            className={styles.option_button}
            tabIndex={0}
            aria-label='View wallet.'
            onClick={handleAccountClick}
        >
            Wallet
            <FiExternalLink
                size={15}
                color='white'
                style={{ marginLeft: '.5rem' }}
            />
        </button>
    );
    const removeButton =
        limitOrder && isOwnerActiveAccount && !isOrderFilled ? (
            <button
                className={styles.option_button}
                onClick={removeButtonOnClick}
            >
                Remove
            </button>
        ) : null;
    const claimButton =
        limitOrder && isOwnerActiveAccount && isOrderFilled ? (
            <button
                className={styles.option_button}
                onClick={claimButtonOnClick}
            >
                Claim
            </button>
        ) : null;
    const copyButton = limitOrder ? (
        <button
            style={{ opacity: '1' }}
            className={styles.option_button}
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
        >
            Copy Trade
        </button>
    ) : null;
    const detailsButton = (
        <button className={styles.option_button} onClick={detailsButtonOnClick}>
            Details
        </button>
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
        <div
            className={styles.main_container}
            onClick={(event) => event.stopPropagation()}
        >
            {ordersMenu}
            {dropdownOrdersMenu}
            {modalOrNull}
        </div>
    );
}
