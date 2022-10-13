// START: Import React and Dongles
import { useState, ReactNode, useRef } from 'react';
// import { Link } from 'react-router-dom';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import JSX Functional Components
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';
import Modal from '../../../../Global/Modal/Modal';

// START: Import Local Files
import styles from './TableMenuComponents.module.css';
import { useModal } from '../../../../Global/Modal/useModal';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { ILimitOrderState } from '../../../../../utils/state/graphDataSlice';
import OrderDetails from '../../../../OrderDetails/OrderDetails';
import OrderRemoval from '../../../../OrderRemoval/OrderRemoval';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { CrocEnv } from '@crocswap-libs/sdk';
// interface for React functional component props
interface OrdersMenuIF {
    crocEnv: CrocEnv | undefined;
    limitOrder: ILimitOrderState;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    isOwnerActiveAccount?: boolean;
    // orderDetailsProps: any;
}

// React functional component
export default function OrdersMenu(props: OrdersMenuIF) {
    const menuItemRef = useRef<HTMLDivElement>(null);

    const { crocEnv, limitOrder, openGlobalModal, isOwnerActiveAccount, closeGlobalModal } = props;
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

    // function openRemoveModal() {
    //     setCurrentModal('remove');
    //     openModal();
    // }

    // function openDetailsModal() {
    //     setCurrentModal('details');
    //     openModal();
    // }

    // -----------------SNACKBAR----------------
    function handleCopyAddress() {
        copy('example data');
        setOpenSnackbar(true);
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {value} copied
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

    const openDetailsModal = () =>
        openGlobalModal(
            <OrderDetails limitOrder={limitOrder} closeGlobalModal={closeGlobalModal} />,
        );

    // switch (currentModal) {
    //     case 'remove':
    //         // modalContent = <RemoveRange {...removeRangeProps} />;
    //         modalContent = removalContent;
    //         modalTitle = 'Limit Order Removal';
    //         break;

    //     case 'details':
    //         // modalContent = <RangeDetails {...removeRangeProps} />;
    //         modalContent = detailsContent;
    //         modalTitle = 'Limit Order Details';
    //         break;
    // }

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    // ------------------  END OF MODAL FUNCTIONALITY-----------------

    // const relimitOrderButton = userlimitOrder ? (
    //     <Link className={styles.relimitOrder_button} to={'/trade/relimitOrder'}>
    //         RelimitOrder
    //     </Link>
    // ) : null;

    const removeButtonOnClick = () => {
        setShowDropdownMenu(false);
        openRemoveModal();
    };

    const detailsButtonOnClick = () => {
        setShowDropdownMenu(false);
        openDetailsModal();
    };

    const removeButton =
        limitOrder && isOwnerActiveAccount ? (
            <button className={styles.option_button} onClick={removeButtonOnClick}>
                Remove
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
    // const editButton = userlimitOrder ? (
    //     <Link className={styles.option_button} to={'/trade/edit'}>
    //         Edit
    //     </Link>
    // ) : null;

    const ordersMenu = (
        <div className={styles.actions_menu}>
            {/* {relimitOrderButton}
            {editButton} */}
            {removeButton}
            {detailsButton}
            {copyButton}
        </div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {/* {editButton} */}
            {removeButton}
            {detailsButton}
            {copyButton}
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
        <>
            {ordersMenu}
            {dropdownOrdersMenu}
            {modalOrNull}
            {snackbarContent}
        </>
    );
}
