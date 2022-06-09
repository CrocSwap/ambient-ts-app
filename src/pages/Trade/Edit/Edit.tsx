import EditHeader from '../../../components/Trade/Edit/EditHeader/EditHeader';
import styles from './Edit.module.css';
import { useParams } from 'react-router-dom';
import CurrencyDisplayContainer from '../../../components/Trade/Edit/CurrencyDisplayContainer/CurrencyDisplayContainer';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import EditPriceInfo from '../../../components/Trade/Edit/EditPriceInfo/EditPriceInfo';
import EditButton from '../../../components/Trade/Edit/EditButton/EditButton';
import Divider from '../../../components/Global/Divider/Divider';
import Modal from '../../../components/Global/Modal/Modal';
import ConfirmEditModal from '../../../components/Trade/Edit/ConfirmEditModal/ConfirmEditModal';
import { useModal } from '../../../components/Global/Modal/useModal';
// interface EditProps {
//     children: React.ReactNode;
// }

export default function Edit() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const { positionHash } = useParams();
    console.log(positionHash);

    const confirmEditModal = isModalOpen ? (
        <Modal onClose={closeModal} title='Edit Position'>
            <ConfirmEditModal onClose={closeModal} />
        </Modal>
    ) : null;
    return (
        <div className={styles.editContainer}>
            <EditHeader positionHash={positionHash} />
            <div className={styles.edit_content}>
                <CurrencyDisplayContainer />
                <Divider />
                <MinMaxPrice />
                <EditPriceInfo />
                <EditButton onClickFn={openModal} />
            </div>
            {confirmEditModal}
        </div>
    );
}
