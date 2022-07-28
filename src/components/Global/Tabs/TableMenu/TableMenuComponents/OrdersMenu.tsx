import DropdownMenu from '../../../DropdownMenu/DropdownMenu';
import DropdownMenuContainer from '../../../DropdownMenu/DropdownMenuContainer/DropdownMenuContainer';
import DropdownMenuItem from '../../../DropdownMenu/DropdownMenuItem/DropdownMenuItem';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useModal } from '../../../../Global/Modal/useModal';
import Modal from '../../../../Global/Modal/Modal';
import styles from './TableMenuComponents.module.css';
import { useState } from 'react';
// import RemoveRange from '../../../../RemoveRange/RemoveRange';
// import RangeDetails from '../../../../RangeDetails/RangeDetails';
import RangeDetailsHeader from '../../../../RangeDetails/RangeDetailsHeader/RangeDetailsHeader';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';

import { Link } from 'react-router-dom';

interface OrdersMenu {
    userPosition: boolean | undefined;
}

export default function OrdersMenu(props: OrdersMenu) {
    const { userPosition } = props;
    const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const [isModalOpen, openModal, closeModal] = useModal();
    const [currentModal, setCurrentModal] = useState<string>('edit');

    // ---------------------MODAL FUNCTIONALITY----------------
    let modalContent: React.ReactNode;

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

    const repositionButton = (
        <Link className={styles.reposition_button} to={'/trade/reposition'}>
            Reposition
        </Link>
    );

    const removeButton = userPosition ? (
        <button className={styles.option_button} onClick={openRemoveModal}>
            Remove
        </button>
    ) : null;
    const copyButton = userPosition ? (
        <button className={styles.option_button} onClick={handleCopyAddress}>
            Copy
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

    const dropdownOrdersMenu = (
        <div className={styles.dropdown_menu}>
            <DropdownMenu title={<FiMoreHorizontal size={20} />}>
                <DropdownMenuContainer>
                    <DropdownMenuItem>{editButton}</DropdownMenuItem>
                    <DropdownMenuItem>{removeButton}</DropdownMenuItem>
                    <DropdownMenuItem>{detailsButton}</DropdownMenuItem>
                    <DropdownMenuItem>{copyButton}</DropdownMenuItem>
                </DropdownMenuContainer>
            </DropdownMenu>
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
