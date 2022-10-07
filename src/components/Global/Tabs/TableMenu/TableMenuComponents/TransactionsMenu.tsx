// START: Import React and Dongles
import { useState, ReactNode, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiMoreHorizontal } from 'react-icons/fi';

// START: Import JSX Functional Components
import Modal from '../../../../Global/Modal/Modal';
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';

// START: Import Local Files
import styles from './TableMenuComponents.module.css';
import { useModal } from '../../../../Global/Modal/useModal';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { ITransaction } from '../../../../../utils/state/graphDataSlice';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';

// interface for React functional component props
interface TransactionMenuIF {
    userPosition: boolean | undefined;
    tx: ITransaction;
    blockExplorer?: string;
}

// React functional component
export default function TransactionsMenu(props: TransactionMenuIF) {
    const menuItemRef = useRef<HTMLDivElement>(null);
    const { userPosition, tx, blockExplorer } = props;

    const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [isModalOpen, openModal, closeModal] = useModal();
    const [currentModal, setCurrentModal] = useState('edit');
    // ---------------------MODAL FUNCTIONALITY----------------
    let modalContent: ReactNode;

    let modalTitle;

    function openRemoveModal() {
        setCurrentModal('remove');
        openModal();
    }

    // function openDetailsModal() {
    //     setCurrentModal('details');
    //     openModal();
    // }
    function openHarvestModal() {
        setCurrentModal('harvest');
        openModal();
    }

    // -----------------SNACKBAR----------------
    function handleCopyAddress() {
        copy('example data');
        setOpenSnackbar(true);
    }

    function handleOpenExplorer() {
        if (tx && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${tx.tx}`;
            window.open(explorerUrl);
        }
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

    // TODO:  @Junior please add a `default` to this with debugging code
    switch (currentModal) {
        case 'remove':
            modalContent = 'Remove';
            modalTitle = 'Remove Position';
            break;

        case 'details':
            modalContent = 'details';
            modalTitle = '';
            break;
        case 'harvest':
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

    const removeButton = userPosition ? (
        <button className={styles.option_button} onClick={openRemoveModal}>
            Remove
        </button>
    ) : null;

    const copyButton = (
        <button className={styles.option_button} onClick={handleCopyAddress}>
            Copy Trade
        </button>
    );
    const explorerButton = (
        <button className={styles.option_button} onClick={handleOpenExplorer}>
            Explorer
            <FiExternalLink size={15} color='white' style={{ marginLeft: '.5rem' }} />
        </button>
    );
    // const detailsButton = (
    //     <button className={styles.option_button} onClick={openDetailsModal}>
    //         Details
    //     </button>
    // );
    const harvestButton = userPosition ? (
        <button className={styles.option_button} onClick={openHarvestModal}>
            Harvest
        </button>
    ) : null;
    const editButton = userPosition ? (
        <Link className={styles.option_button} to={'/trade/edit'}>
            Edit
        </Link>
    ) : null;

    const transactionsMenu = (
        <div className={styles.actions_menu}>
            {editButton}
            {removeButton}
            {harvestButton}
            {/* {detailsButton} */}
            {explorerButton}
            {copyButton}
        </div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {editButton}
            {removeButton}
            {harvestButton}
            {/* {detailsButton} */}
            {explorerButton}
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
    const dropdownTransactionsMenu = (
        <div className={styles.dropdown_menu} ref={menuItemRef}>
            <div onClick={() => setShowDropdownMenu(!showDropdownMenu)}>
                <FiMoreHorizontal />
            </div>
            <div className={wrapperStyle}>{menuContent}</div>
        </div>
    );

    return (
        <>
            {transactionsMenu}
            {dropdownTransactionsMenu}
            {modalOrNull}
            {snackbarContent}
        </>
    );
}
