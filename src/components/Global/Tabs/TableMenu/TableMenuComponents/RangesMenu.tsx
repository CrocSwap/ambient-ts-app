import DropdownMenu from '../../../DropdownMenu/DropdownMenu';
import DropdownMenuContainer from '../../../DropdownMenu/DropdownMenuContainer/DropdownMenuContainer';
import DropdownMenuItem from '../../../DropdownMenu/DropdownMenuItem/DropdownMenuItem';
import { FiMoreHorizontal } from 'react-icons/fi';
import styles from './TableMenuComponents.module.css';
import { useModal } from '../../../../Global/Modal/useModal';
import Modal from '../../../../Global/Modal/Modal';
import { useState } from 'react';
import RangeDetailsHeader from '../../../../RangeDetails/RangeDetailsHeader/RangeDetailsHeader';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';

import { Link } from 'react-router-dom';
export default function RangesMenu() {
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
    function openHarvestModal() {
        setCurrentModal('harvest');
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
        case 'harvest':
            // modalContent = <RangeDetails {...removeRangeProps} />;
            modalContent = 'harvest';
            modalTitle = 'Harvest';
            break;
    }

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    const removeButton = <button onClick={openRemoveModal}>Remove</button>;
    const copyButton = <button onClick={handleCopyAddress}>Copy</button>;
    const detailsButton = <button onClick={openDetailsModal}>Details</button>;
    const harvestButton = <button onClick={openHarvestModal}>Harvest</button>;
    const editButton = <Link to={'/trade/edit'}>Edit</Link>;

    const rangesMenu = (
        <div className={styles.actions_menu}>
            {editButton}
            {harvestButton}
            {removeButton}
            {detailsButton}
            {copyButton}
        </div>
    );

    const dropdownRangesMenu = (
        <div className={styles.dropdown_menu}>
            <DropdownMenu title={<FiMoreHorizontal size={20} />}>
                <DropdownMenuContainer>
                    <DropdownMenuItem>{editButton}</DropdownMenuItem>
                    <DropdownMenuItem>{harvestButton}</DropdownMenuItem>
                    <DropdownMenuItem>{removeButton}</DropdownMenuItem>
                    <DropdownMenuItem>{detailsButton}</DropdownMenuItem>
                    <DropdownMenuItem>{copyButton}</DropdownMenuItem>
                </DropdownMenuContainer>
            </DropdownMenu>
        </div>
    );
    return (
        <>
            {rangesMenu}
            {dropdownRangesMenu}
            {modalOrNull}
            {snackbarContent}
        </>
    );
}
