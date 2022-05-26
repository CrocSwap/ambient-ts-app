import RangeStatus from '../RangeStatus/RangeStatus';
import styles from './Position.module.css';
import { useModal } from '../Modal/useModal';
import Modal from '../Modal/Modal';
import { useState } from 'react';

import RemoveRange from '../../RemoveRange/RemoveRange';
export default function Position() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const [currentModal, setCurrentModal] = useState<string>('edit');

    const harvestContent = <div>I am harvest</div>;
    const editContent = <div>I am edit</div>;
    const detailsContent = <div>I am details</div>;

    // MODAL FUNCTIONALITY
    let modalContent: React.ReactNode;
    let modalTitle = 'Modal Title';

    switch (currentModal) {
        case 'remove':
            modalContent = <RemoveRange />;
            modalTitle = 'Remove Position';
            break;
        case 'edit':
            modalContent = editContent;
            modalTitle = 'Edit Position';
            break;
        case 'details':
            modalContent = detailsContent;
            modalTitle = 'Position Details';
            break;
        case 'harvest':
            modalContent = harvestContent;
            modalTitle = 'Harvest Position';
            break;
    }
    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    function openRemoveModal() {
        setCurrentModal('remove');
        openModal();
    }
    function openEditModal() {
        setCurrentModal('edit');
        openModal();
    }
    function openHarvestModal() {
        setCurrentModal('harvest');
        openModal();
    }
    function openDetailsModal() {
        setCurrentModal('details');
        openModal();
    }
    //  END OF MODAL FUNCTIONALITY

    return (
        <tr>
            <td data-column='Position ID' className={styles.position_id}>
                0xfs05...db35
            </td>
            <td data-column='Range' className={styles.position_range}>
                2100.00 3200.00
            </td>
            <td data-column='APY' className={styles.apy}>
                35.65%
            </td>
            <td data-column='Range Status'>
                <RangeStatus isInRange />
                {/* In Range */}
            </td>
            <td data-column='' className={styles.option_buttons}>
                <button className={styles.option_button} onClick={openHarvestModal}>
                    Harvest
                </button>
                <button className={styles.option_button} onClick={openEditModal}>
                    Edit
                </button>
                <button className={styles.option_button} onClick={openRemoveModal}>
                    Remove
                </button>
                <button className={styles.option_button} onClick={openDetailsModal}>
                    Details
                </button>
            </td>
            {modalOrNull}
        </tr>
    );
}
