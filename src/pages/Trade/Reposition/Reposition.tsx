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
import { useLocation, Link } from 'react-router-dom';

export default function Reposition() {
    const location = useLocation();

    const currentLocation = location.pathname;
    const [isModalOpen, openModal, closeModal] = useModal();

    const confirmRepositionModal = isModalOpen ? (
        <Modal onClose={closeModal} title=' Confirm Reposition'>
            <ConfirmRepositionModal onClose={closeModal} />
        </Modal>
    ) : null;

    const repositionAddToggle = (
        <div className={styles.reposition_toggle_container}>
            <Link
                to='/trade/reposition'
                className={
                    currentLocation.includes('reposition')
                        ? styles.active_button_toggle
                        : styles.non_active_button_toggle
                }
            >
                Reposition
            </Link>
            <Link
                to='/trade/add'
                className={
                    currentLocation.includes('add')
                        ? styles.active_button_toggle
                        : styles.non_active_button_toggle
                }
            >
                Add
            </Link>
        </div>
    );

    return (
        <div className={styles.repositionContainer}>
            <RepositionHeader />

            <div className={styles.reposition_content}>
                {repositionAddToggle}
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
