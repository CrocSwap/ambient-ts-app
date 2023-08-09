// START: Import React and Dongles
import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import { VscClose } from 'react-icons/vsc';

// START: Import JSX Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettingsModal from '../../../Global/TransactionSettingsModal/TransactionSettingsModal';

// START: Import Local Files
import styles from './RepositionHeader.module.css';
import trimString from '../../../../utils/functions/trimString';
import { useRepoExitPath } from './useRepoExitPath';
import { setAdvancedMode } from '../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { RangeContext } from '../../../../contexts/RangeContext';
import { useModal } from '../../../Global/Modal/useModal';

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

    const [isOpen, openModal, closeModal] = useModal();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // navpath for when user clicks the exit button
    const exitPath = useRepoExitPath();

    return (
        <>
            <ContentHeader>
                <img
                    className={styles.settings_icon}
                    src={settingsIcon}
                    alt='settings'
                    onClick={openModal}
                />
                <p className={styles.title}>
                    {' '}
                    Reposition: {trimString(positionHash, 5, 4, '…')}
                </p>
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
            {isOpen && (
                <TransactionSettingsModal
                    module='Reposition'
                    slippage={repoSlippage}
                    bypassConfirm={bypassConfirmRepo}
                    onClose={closeModal}
                />
            )}
        </>
    );
}

export default memo(RepositionHeader);
