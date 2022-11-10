// START: Import React and Dongles
import { useState, ReactNode, useRef } from 'react';
// import { Link } from 'react-router-dom';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import JSX Functional Components
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';
import Modal from '../../../../Global/Modal/Modal';

// START: Import Local Files
import styles from './TableMenus.module.css';
import { useModal } from '../../../../Global/Modal/useModal';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import OrderDetails from '../../../../OrderDetails/OrderDetails';
import OrderRemoval from '../../../../OrderRemoval/OrderRemoval';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { CrocEnv } from '@crocswap-libs/sdk';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import ClaimOrder from '../../../../ClaimOrder/ClaimOrder';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';

// interface for React functional component props
interface OrdersMenuIF {
    crocEnv: CrocEnv | undefined;
    limitOrder: LimitOrderIF;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    isOwnerActiveAccount?: boolean;
    showSidebar: boolean;
    isOrderFilled: boolean;
    isOnPortfolioPage: boolean;
    // orderDetailsProps: any;
}

// React functional component
export default function OrdersMenu(props: OrdersMenuIF) {
    const menuItemRef = useRef<HTMLDivElement>(null);

    const {
        crocEnv,
        limitOrder,
        openGlobalModal,
        isOwnerActiveAccount,
        closeGlobalModal,
        showSidebar,
        // isOnPortfolioPage,
    } = props;
    const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const [
        isModalOpen,
        //  openModal,
        closeModal,
    ] = useModal();

    // ---------------------MODAL FUNCTIONALITY----------------
    let modalContent: ReactNode;
    let modalTitle;

    // -----------------SNACKBAR----------------
    function handleCopyAddress() {
        copy('Not Yet Implemented');
        setOpenSnackbar(true);
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {value}
        </SnackbarComponent>
    );
    // -----------------END OF SNACKBAR----------------

    const openRemoveModal = () =>
        openGlobalModal(
            <OrderRemoval
                crocEnv={crocEnv}
                limitOrder={limitOrder}
                closeGlobalModal={closeGlobalModal}
            />,
        );
    const openClaimModal = () =>
        openGlobalModal(
            <ClaimOrder
                crocEnv={crocEnv}
                limitOrder={limitOrder}
                closeGlobalModal={closeGlobalModal}
            />,
        );

    const openDetailsModal = () =>
        openGlobalModal(
            <OrderDetails limitOrder={limitOrder} closeGlobalModal={closeGlobalModal} />,
        );

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    // ------------------  END OF MODAL FUNCTIONALITY-----------------

    const view1 = useMediaQuery('(min-width: 1280px)');
    // const view2 = useMediaQuery('(min-width: 1680px)');
    const view3 = useMediaQuery('(min-width: 2300px)');

    // const view1NoSidebar = useMediaQuery('(min-width: 1200px)') && !showSidebar;
    const view2WithNoSidebar = useMediaQuery('(min-width: 1680px)') && !showSidebar;

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

    const removeButton =
        limitOrder && isOwnerActiveAccount && !props.isOrderFilled ? (
            <button className={styles.option_button} onClick={removeButtonOnClick}>
                Remove
            </button>
        ) : null;
    const claimButton =
        limitOrder && isOwnerActiveAccount && props.isOrderFilled ? (
            <button className={styles.option_button} onClick={claimButtonOnClick}>
                Claim
            </button>
        ) : null;
    const copyButton = limitOrder ? (
        <button className={styles.option_button} onClick={handleCopyAddress}>
            Copy
        </button>
    ) : null;
    const detailsButton = (
        <button className={styles.option_button} onClick={detailsButtonOnClick}>
            Details
        </button>
    );

    const ordersMenu = (
        <div className={styles.actions_menu}>
            {view1 && !showSidebar && claimButton}
            {/* {view1 && removeButton} */}
            {/* {(view2 || (view1NoSidebar && !isOnPortfolioPage)) && copyButton} */}
            {(view3 || view2WithNoSidebar) && detailsButton}
            {view1 && copyButton}
        </div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {detailsButton}
            {!view1 && copyButton}
            {removeButton}
            {claimButton}
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
            <div onClick={() => setShowDropdownMenu(!showDropdownMenu)}>
                <FiMoreHorizontal />
            </div>
            <div className={wrapperStyle}>{menuContent}</div>
        </div>
    );
    return (
        <div className={styles.main_container}>
            {ordersMenu}
            {dropdownOrdersMenu}
            {modalOrNull}
            {snackbarContent}
        </div>
    );
}
