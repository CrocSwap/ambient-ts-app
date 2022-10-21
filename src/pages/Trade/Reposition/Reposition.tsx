import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import RepositionButton from '../../../components/Trade/Reposition/Repositionbutton/RepositionButton';
import RepositionDenominationSwitch from '../../../components/Trade/Reposition/RepositionDenominationSwitch/RepositionDenominationSwitch';
import RepositionHeader from '../../../components/Trade/Reposition/RepositionHeader/RepositionHeader';
import RepositionPriceInfo from '../../../components/Trade/Reposition/RepositionPriceInfo/RepositionPriceInfo';
import RepositionRangeWidth from '../../../components/Trade/Reposition/RepositionRangeWidth/RepositionRangeWidth';
import styles from './Reposition.module.css';
import { useModal } from '../../../components/Global/Modal/useModal';
// import { useState, useEffect } from 'react';
import Modal from '../../../components/Global/Modal/Modal';
import ConfirmRepositionModal from '../../../components/Trade/Reposition/ConfirmRepositionModal/ConfirmRepositionModal';

export default function Reposition() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const confirmRepositionModal = isModalOpen ? (
        <Modal onClose={closeModal} title=' Confirm Reposition'>
            <ConfirmRepositionModal onClose={closeModal} />
        </Modal>
    ) : null;

    return (
        <div className={styles.repositionContainer}>
            <RepositionHeader />

            <div className={styles.reposition_content}>
                <RepositionDenominationSwitch />
                <DividerDark />
                <RepositionRangeWidth />
                <RepositionPriceInfo />
                <RepositionButton onClickFn={openModal} />
            </div>
            {confirmRepositionModal}
        </div>
    );
}
