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
import OrderRemoval from '../../../../OrderRemoval/OrderRemoval';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { ChainSpec } from '@crocswap-libs/sdk';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import ClaimOrder from '../../../../ClaimOrder/ClaimOrder';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import {
    setIsTokenAPrimary,
    setLimitTick,
    setLimitTickCopied,
    setShouldLimitConverterUpdate,
    tradeData,
} from '../../../../../utils/state/tradeDataSlice';
import { useNavigate } from 'react-router-dom';
import { IS_LOCAL_ENV } from '../../../../../constants';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { AppStateContext } from '../../../../../contexts/AppStateContext';

// interface for React functional component props
interface propsIF {
    chainData: ChainSpec;
    tradeData: tradeData;
    limitOrder: LimitOrderIF;
    isOwnerActiveAccount?: boolean;
    isShowAllEnabled: boolean;
    isOrderFilled: boolean;
    handlePulseAnimation?: (type: string) => void;
    account: string;
    lastBlockNumber: number;
    showHighlightedButton: boolean;
    isOnPortfolioPage: boolean;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    handleAccountClick: () => void;
}

// React functional component
export default function OrdersMenu(props: propsIF) {
    const menuItemRef = useRef<HTMLDivElement>(null);

    const {
        // isShowAllEnabled,
        chainData,
        tradeData,
        limitOrder,
        isOrderFilled,
        isOwnerActiveAccount,
        handlePulseAnimation,
        lastBlockNumber,
        account,
        isBaseTokenMoneynessGreaterOrEqual,
        isOnPortfolioPage,
    } = props;

    const {
        globalModal: { open: openGlobalModal, close: closeGlobalModal },
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(AppStateContext);

    const [
        isModalOpen,
        //  openModal,
        closeModal,
    ] = useModal();

    const crocEnv = useContext(CrocEnvContext);

    // ---------------------MODAL FUNCTIONALITY----------------
    let modalContent: ReactNode;
    let modalTitle;

    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    // -----------------SNACKBAR----------------
    function handleCopyOrder() {
        handlePulseAnimation ? handlePulseAnimation('limitOrder') : null;
        dispatch(setLimitTickCopied(true));
        if (IS_LOCAL_ENV) {
            console.debug({ tradeData });
            console.debug({ limitOrder });
        }
        const shouldMovePrimaryQuantity =
            tradeData.tokenA.address.toLowerCase() ===
            (limitOrder.isBid
                ? limitOrder.quote.toLowerCase()
                : limitOrder.base.toLowerCase());

        IS_LOCAL_ENV && console.debug({ shouldMovePrimaryQuantity });
        const shouldClearNonPrimaryQty =
            tradeData.limitTick !== limitOrder.askTick &&
            (tradeData.isTokenAPrimary
                ? tradeData.tokenA.address.toLowerCase() ===
                  (limitOrder.isBid
                      ? limitOrder.base.toLowerCase()
                      : limitOrder.quote.toLowerCase())
                    ? true
                    : false
                : tradeData.tokenB.address.toLowerCase() ===
                  (limitOrder.isBid
                      ? limitOrder.quote.toLowerCase()
                      : limitOrder.base.toLowerCase())
                ? true
                : false);
        if (shouldMovePrimaryQuantity) {
            IS_LOCAL_ENV && console.debug('flipping primary');
            const sellQtyField = document.getElementById(
                'sell-limit-quantity',
            ) as HTMLInputElement;
            const buyQtyField = document.getElementById(
                'buy-limit-quantity',
            ) as HTMLInputElement;

            if (tradeData.isTokenAPrimary) {
                if (buyQtyField) {
                    buyQtyField.value = sellQtyField.value;
                }
                if (sellQtyField) {
                    sellQtyField.value = '';
                }
            } else {
                if (sellQtyField) {
                    sellQtyField.value = buyQtyField.value;
                }
                if (buyQtyField) {
                    buyQtyField.value = '';
                }
            }
            // }, 500);
            dispatch(setIsTokenAPrimary(!tradeData.isTokenAPrimary));
            dispatch(setShouldLimitConverterUpdate(true));
        } else if (shouldClearNonPrimaryQty) {
            if (!tradeData.isTokenAPrimary) {
                const sellQtyField = document.getElementById(
                    'sell-limit-quantity',
                ) as HTMLInputElement;
                if (sellQtyField) {
                    sellQtyField.value = '';
                    // tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            } else {
                const buyQtyField = document.getElementById(
                    'buy-limit-quantity',
                ) as HTMLInputElement;
                if (buyQtyField) {
                    buyQtyField.value = '';
                }
            }
            IS_LOCAL_ENV && console.debug('resetting');
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
            <OrderRemoval
                account={account}
                chainData={chainData}
                crocEnv={crocEnv}
                limitOrder={limitOrder}
                closeGlobalModal={closeGlobalModal}
            />,
        );
    const openClaimModal = () =>
        openGlobalModal(
            <ClaimOrder
                account={account}
                chainData={chainData}
                crocEnv={crocEnv}
                limitOrder={limitOrder}
                closeGlobalModal={closeGlobalModal}
            />,
        );

    const openDetailsModal = () =>
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

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    // ------------------  END OF MODAL FUNCTIONALITY-----------------

    const minView = useMediaQuery('(min-width: 720px)');
    // const view1 = useMediaQuery('(min-width: 1280px)');
    // const view2 = useMediaQuery('(min-width: 1680px)');
    const view3 = useMediaQuery('(min-width: 2300px)');

    // const view1NoSidebar = useMediaQuery('(min-width: 1200px)') && !showSidebar;
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
            onClick={props.handleAccountClick}
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
        // limitOrder && isShowAllEnabled && !isOwnerActiveAccount ? (
        <button
            style={{ opacity: '1' }}
            // style={{ opacity: showHighlightedButton ? '1' : '0.2' }}
            className={styles.option_button}
            onClick={() => {
                dispatch(setLimitTickCopied(true));
                dispatch(setLimitTick(undefined));
                navigate(
                    '/trade/limit/' +
                        'chain=' +
                        limitOrder.chainId +
                        '&tokenA=' +
                        (limitOrder.isBid
                            ? limitOrder.base
                            : limitOrder.quote) +
                        '&tokenB=' +
                        (limitOrder.isBid
                            ? limitOrder.quote
                            : limitOrder.base) +
                        '&limitTick=' +
                        (limitOrder.isBid
                            ? limitOrder.bidTick
                            : limitOrder.askTick),
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
                style={{ cursor: 'pointer' }}
            >
                <CiCircleMore size={25} color='var(--text3)' />
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
