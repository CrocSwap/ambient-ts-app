// START: Import React and Dongles
import { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import JSX Functional Components
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';
import RangeDetailsHeader from '../../../../RangeDetails/RangeDetailsHeader/RangeDetailsHeader';
import Modal from '../../../../Global/Modal/Modal';

// START: Import Local Files
import styles from './TableMenuComponents.module.css';
import { useModal } from '../../../../Global/Modal/useModal';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';

// interface for React functional component props
interface OrdersMenuIF {
    userPosition: boolean | undefined;
}

// React functional component
export default function OrdersMenu(props: OrdersMenuIF) {
    const { userPosition } = props;
    const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const [isModalOpen, openModal, closeModal] = useModal();
    const [currentModal, setCurrentModal] = useState<string>('edit');

    const [openMenuTooltip, setOpenMenuTooltip] = useState(false);

    // ---------------------MODAL FUNCTIONALITY----------------
    let modalContent: ReactNode;

    let modalTitle;

    function openRemoveModal() {
        setCurrentModal('remove');
        openModal();
    }

    function openDetailsModal() {
        setCurrentModal('details');
        openModal();
    }

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

    switch (currentModal) {
        case 'remove':
            // modalContent = <RemoveRange {...removeRangeProps} />;
            modalContent = 'Remove';
            modalTitle = 'Remove Position';
            break;

        case 'details':
            // modalContent = <RangeDetails {...removeRangeProps} />;
            modalContent = 'details';
            modalTitle = <RangeDetailsHeader />;
            break;
    }

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    // ------------------  END OF MODAL FUNCTIONALITY-----------------

    const repositionButton = userPosition ? (
        <Link className={styles.reposition_button} to={'/trade/reposition'}>
            Reposition
        </Link>
    ) : null;

    const removeButton = userPosition ? (
        <button className={styles.option_button} onClick={openRemoveModal}>
            Remove
        </button>
    ) : null;
    const copyButton = userPosition ? (
        <button className={styles.option_button} onClick={handleCopyAddress}>
            Clone
        </button>
    ) : null;
    const detailsButton = (
        <button className={styles.option_button} onClick={openDetailsModal}>
            Details
        </button>
    );
    const editButton = userPosition ? (
        <Link className={styles.option_button} to={'/trade/edit'}>
            Edit
        </Link>
    ) : null;

    const ordersMenu = (
        <div className={styles.actions_menu}>
            {repositionButton}
            {editButton}
            {removeButton}
            {detailsButton}
            {copyButton}
        </div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {editButton}
            {removeButton}
            {detailsButton}
            {copyButton}
        </div>
    );

    const dropdownOrdersMenu = (
        <div className={styles.dropdown_menu}>
            <DefaultTooltip
                open={openMenuTooltip}
                onOpen={() => setOpenMenuTooltip(true)}
                onClose={() => setOpenMenuTooltip(false)}
                interactive
                placement='left'
                title={menuContent}
            >
                <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => setOpenMenuTooltip(!openMenuTooltip)}
                >
                    <FiMoreHorizontal size={20} />
                </div>
            </DefaultTooltip>
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
