// START: Import React and Dongles
import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiSettings5Line } from 'react-icons/ri';
import { VscClose } from 'react-icons/vsc';

// START: Import JSX Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';
import Modal from '../../../../components/Global/Modal/Modal';

// START: Import Local Files
import styles from './RepositionHeader.module.css';
import trimString from '../../../../utils/functions/trimString';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { useRepoExitPath } from './useRepoExitPath';
import { setAdvancedMode } from '../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { RangeContext } from '../../../../contexts/RangeContext';

interface propsIF {
    positionHash: string;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    resetTxHash: () => void;
}

function RepositionHeader(props: propsIF) {
    const { setRangeWidthPercentage, positionHash, resetTxHash } = props;

    const { setSimpleRangeWidth } = useContext(RangeContext);
    const { bypassConfirmRepo, repoSlippage } = useContext(
        UserPreferenceContext,
    );

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // navpath for when user clicks the exit button
    const exitPath = useRepoExitPath();

    const [isModalOpen, openModal, closeModal] = useModal();

    return (
        <ContentHeader>
            <div
                onClick={() => openModal()}
                style={{ cursor: 'pointer', marginLeft: '5px' }}
            >
                <RiSettings5Line />
            </div>
            <div className={styles.title}>
                Reposition: {trimString(positionHash, 6, 4, '…')}
            </div>
            {isModalOpen && (
                <Modal
                    noHeader
                    title='modal'
                    onClose={closeModal}
                    centeredTitle
                >
                    <TransactionSettings
                        module='Reposition'
                        slippage={repoSlippage}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirmRepo}
                    />
                </Modal>
            )}
            <div
                onClick={() => {
                    dispatch(setAdvancedMode(false));
                    setRangeWidthPercentage(10);
                    setSimpleRangeWidth(10);
                    navigate(exitPath, { replace: true });
                    resetTxHash();
                }}
                style={{ cursor: 'pointer', marginRight: '10px' }}
            >
                <VscClose size={30} />
            </div>
        </ContentHeader>
    );
}

export default memo(RepositionHeader);
