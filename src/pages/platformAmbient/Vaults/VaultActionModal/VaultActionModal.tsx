import { TokenIF } from '../../../../ambient-utils/types';
import Modal from '../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../components/Global/ModalHeader/ModalHeader';

import styles from './VaultActionModal.module.css';
import VaultDeposit from './VaultDeposit/VaultDeposit';
import VaultWithdraw from './VaultWithdraw/VaultWithdraw';

interface Props {
    onClose: () => void;
    type: 'Withdraw' | 'Deposit';
    token0: TokenIF;
    token1: TokenIF;
}
export default function VaultActionModal(props: Props) {
    const { onClose, type,token0, token1 } = props;
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
                        token0={token0}
                        token1={token1}
                    />
                )}
                {type === 'Withdraw' && (
                    <VaultWithdraw
                        token0={token0}
                        token1={token1}
                    />
                )}

                {/* {buttonToDisplay} */}
            </div>
        </Modal>
    );
}
