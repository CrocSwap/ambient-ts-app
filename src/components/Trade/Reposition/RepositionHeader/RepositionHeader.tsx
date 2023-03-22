// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
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
import { SlippageMethodsIF } from '../../../../App/hooks/useSlippage';
import { setAdvancedMode } from '../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { allSkipConfirmMethodsIF } from '../../../../App/hooks/useSkipConfirm';

interface propsIF {
    positionHash: string;
    repoSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    bypassConfirm: allSkipConfirmMethodsIF;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
}

export default function RepositionHeader(props: propsIF) {
    const {
        setRangeWidthPercentage,
        positionHash,
        repoSlippage,
        isPairStable,
        bypassConfirm,
        setSimpleRangeWidth,
    } = props;

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // navpath for when user clicks the exit button
    const exitPath = useRepoExitPath();

    const [isModalOpen, openModal, closeModal] = useModal();

    return (
        <ContentHeader>
            <div
                onClick={() => openModal()}
                style={{ cursor: 'pointer', marginLeft: '10px' }}
            >
                <RiSettings5Line />
            </div>
            <div className={styles.title}>
                Reposition: {trimString(positionHash, 6, 4, '…')}
            </div>

            {isModalOpen && (
                <Modal noHeader title='modal' onClose={closeModal}>
                    <TransactionSettings
                        module='Reposition'
                        toggleFor='repo'
                        slippage={repoSlippage}
                        isPairStable={isPairStable}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirm.repo}
                    />
                </Modal>
            )}
            <div
                onClick={() => {
                    dispatch(setAdvancedMode(false));
                    setRangeWidthPercentage(10);
                    setSimpleRangeWidth(10);
                    navigate(exitPath, { replace: true });
                }}
                style={{ cursor: 'pointer', marginRight: '10px' }}
            >
                <VscClose size={22} />
            </div>
        </ContentHeader>
    );
}
