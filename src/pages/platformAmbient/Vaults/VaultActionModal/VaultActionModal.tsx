import { TokenIF } from '../../../../ambient-utils/types';
import Modal from '../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../components/Global/ModalHeader/ModalHeader';

import styles from './VaultActionModal.module.css';
import VaultDeposit from './VaultDeposit/VaultDeposit';
import VaultWithdraw from './VaultWithdraw/VaultWithdraw';

interface Props {
    onClose: () => void;
    type: 'Withdraw' | 'Deposit';
    firstToken: TokenIF;
    secondToken: TokenIF;
}
export default function VaultActionModal(props: Props) {
    const { onClose, type, firstToken, secondToken } = props;
console.log({type})
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
                {type === 'Deposit' && (
                    <VaultDeposit
                        firstToken={firstToken}
                        secondToken={secondToken}
                    />
                )}
                {type === 'Withdraw' && (
                    <VaultWithdraw
                        firstToken={firstToken}
                        secondToken={secondToken}
                    />
                )}

                {/* {buttonToDisplay} */}
            </div>
        </Modal>
    );
}
