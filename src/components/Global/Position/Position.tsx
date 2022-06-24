import RangeStatus from '../RangeStatus/RangeStatus';
import styles from './Position.module.css';
import { useModal } from '../Modal/useModal';
import Modal from '../Modal/Modal';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PositionIF } from '../../../utils/interfaces/PositionIF';

import RemoveRange from '../../RemoveRange/RemoveRange';
import RangeDetails from '../../RangeDetails/RangeDetails';
import RangeDetailsHeader from '../../RangeDetails/RangeDetailsHeader/RangeDetailsHeader';
import truncateAddress from '../../../utils/truncateAddress';

interface PositionProps {
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    position: PositionIF;
}
export default function Position(props: PositionProps) {
    // const navigate = useNavigate();
    const { position } = props;

    const { portfolio } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const [currentModal, setCurrentModal] = useState<string>('edit');

    const harvestContent = <div>I am harvest</div>;
    const editContent = <div>I am edit</div>;

    // MODAL FUNCTIONALITY
    let modalContent: React.ReactNode;
    let modalTitle;

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
            modalContent = <RangeDetails />;
            modalTitle = <RangeDetailsHeader />;
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

    function openHarvestModal() {
        setCurrentModal('harvest');
        openModal();
    }
    function openDetailsModal() {
        setCurrentModal('details');
        openModal();
    }
    //  END OF MODAL FUNCTIONALITY

    const tokenImages = (
        <>
            <td data-column='tokens' className={styles.tokens}>
                <img
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                    alt='token'
                    width='30px'
                />
                <img
                    src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
                    alt='token'
                    width='30px'
                />
            </td>
        </>
    );
    const positionId = truncateAddress(position.id, 18);

    const positionData = {
        position: position,
    };

    return (
        <tr>
            {portfolio && tokenImages}
            <td data-column='Position ID' className={styles.position_id}>
                {positionId}
            </td>
            {position.ambient == false && (
                <td data-column='Range' className={styles.position_range}>
                    2100.00 3200.00
                </td>
            )}

            {position.ambient == true && (
                <td
                    data-column='Range'
                    className={`${styles.position_range} ${styles.ambient_text}`}
                >
                    ambient
                </td>
            )}
            <td data-column='APY' className={styles.apy}>
                35.65%
            </td>
            <td data-column='Range Status'>
                <RangeStatus isInRange isAmbient />
                {/* In Range */}
            </td>
            <td data-column='' className={styles.option_buttons}>
                <button className={styles.option_button} onClick={openHarvestModal}>
                    Harvest
                </button>
                <button className={styles.option_button}>
                    <Link to={`/trade/edit/${positionId}`} state={positionData}>
                        Edit
                    </Link>
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
