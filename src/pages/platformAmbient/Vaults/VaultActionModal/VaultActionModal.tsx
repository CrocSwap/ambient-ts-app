
import Modal from '../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../components/Global/ModalHeader/ModalHeader';

import styles from './VaultActionModal.module.css';
import VaultWithdraw from './VaultWithdraw/VaultWithdraw';

interface Props {
    onClose: () => void;
    type: 'Withdraw' | 'Deposit';
    firstToken: any;
    secondToken: any;
}
export default function VaultActionModal(props: Props) {
    const { onClose, type, firstToken, secondToken } = props;

   

    return (
        <Modal usingCustomHeader onClose={onClose}>
            <ModalHeader
                onClose={onClose}
                title={type}
                // onBackButton={() => {
                //     resetConfirmation();
                //     setShowSettings(false);
                // }}
                // showBackButton={showSettings}
            />
            <div className={styles.main_content}>
                <VaultWithdraw firstToken={firstToken} secondToken={secondToken}/>

                {/* {buttonToDisplay} */}
            </div>
        </Modal>
    );
}
