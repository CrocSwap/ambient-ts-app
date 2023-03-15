import { useRepoExitPath } from './useRepoExitPath';
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { RiSettings5Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import trimString from '../../../../utils/functions/trimString';
import styles from './RepositionHeader.module.css';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { VscClose } from 'react-icons/vsc';
import { SlippageMethodsIF } from '../../../../App/hooks/useSlippage';
import { setAdvancedMode } from '../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { Dispatch, SetStateAction } from 'react';

interface propsIF {
    positionHash: string;
    repoSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
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
        toggleBypassConfirm,
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
                Reposition: {trimString(positionHash, 4, 4, '…')}
            </div>

            {isModalOpen && (
                <Modal noHeader title='modal' onClose={closeModal}>
                    <TransactionSettings
                        module='Reposition'
                        toggleFor='repo'
                        slippage={repoSlippage}
                        isPairStable={isPairStable}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirm}
                        toggleBypassConfirm={toggleBypassConfirm}
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
