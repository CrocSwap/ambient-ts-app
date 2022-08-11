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
interface RangesMenu {
    userPosition: boolean | undefined;
    // todoFromJr: Assign the correct types to these data -Jr
    // eslint-disable-next-line
    rangeDetailsProps: any;
    // eslint-disable-next-line
    positionData: any;
    posHash: string;
}
import { Link } from 'react-router-dom';
import RemoveRange from '../../../../RemoveRange/RemoveRange';
import RangeDetails from '../../../../RangeDetails/RangeDetails';
export default function RangesMenu(props: RangesMenu) {
    const currentLocation = location.pathname;
    const { isAmbient, isPositionInRange } = props.rangeDetailsProps;
    const { posHash, positionData } = props;
    const { userPosition, rangeDetailsProps } = props;
    // eslint-disable-next-line
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
        copy(posHash);
        setOpenSnackbar(true);
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {posHash} copied
        </SnackbarComponent>
    );
    // -----------------END OF SNACKBAR----------------

    switch (currentModal) {
        case 'remove':
            modalContent = <RemoveRange {...rangeDetailsProps} />;
            modalTitle = 'Remove Position';
            break;

        case 'details':
            // modalContent = <RangeDetails {...removeRangeProps} />;
            modalContent = <RangeDetails {...rangeDetailsProps} />;
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

    const repositionButton =
        userPosition && !isPositionInRange ? (
            <Link className={styles.reposition_button} to={'/trade/reposition'}>
                Reposition
            </Link>
        ) : null;

    const removeButton = userPosition ? (
        <button className={styles.option_button} onClick={openRemoveModal}>
            Remove
        </button>
    ) : null;
    const copyButton =
        userPosition && isPositionInRange ? (
            <button className={styles.option_button} onClick={handleCopyAddress}>
                Copy
            </button>
        ) : null;

    const detailsButton = (
        <button className={styles.option_button} onClick={openDetailsModal}>
            Details
        </button>
    );
    const harvestButton =
        !isAmbient && userPosition ? (
            <button className={styles.option_button} onClick={openHarvestModal}>
                Harvest
            </button>
        ) : null;

    const editButton = userPosition ? (
        <Link
            className={styles.option_button}
            to={`/trade/edit/${posHash}`}
            state={positionData}
            replace={currentLocation.startsWith('/trade/edit')}
        >
            Edit
        </Link>
    ) : null;

    const rangesMenu = (
        <div className={styles.actions_menu}>
            {repositionButton}
            {editButton}
            {harvestButton}
            {removeButton}
            {detailsButton}
            {copyButton}
        </div>
    );

    // console.log(posHash);

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
