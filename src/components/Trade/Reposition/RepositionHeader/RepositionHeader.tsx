// START: Import React and Dongles
import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import { VscClose } from 'react-icons/vsc';

// START: Import JSX Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
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
import TransactionSettings from '../../TradeModules/SubmitTransaction/TransactionSettings/TransactionSettings';

interface propsIF {
    positionHash: string;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    resetTxHash: () => void;
}

function RepositionHeader(props: propsIF) {
    const { setRangeWidthPercentage, positionHash, resetTxHash } = props;

    const { setSimpleRangeWidth, setCurrentRangeInReposition } =
        useContext(RangeContext);
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
            <img
                className={styles.settings_icon}
                src={settingsIcon}
                alt='settings'
                onClick={() => openModal()}
            />
            <p className={styles.title}>
                {' '}
                Reposition: {trimString(positionHash, 5, 4, '…')}
            </p>
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
            <VscClose
                className={styles.close_icon}
                onClick={() => {
                    dispatch(setAdvancedMode(false));
                    setRangeWidthPercentage(10);
                    setSimpleRangeWidth(10);
                    navigate(exitPath, { replace: true });
                    resetTxHash();
                    setCurrentRangeInReposition('');
                }}
            />
        </ContentHeader>
    );
}

export default memo(RepositionHeader);
