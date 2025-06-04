import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { VscClose } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import settingsIcon from '../../../../assets/images/icons/settings.svg';

import TransactionSettingsModal from '../../../Global/TransactionSettingsModal/TransactionSettingsModal';

import { RangeContext } from '../../../../contexts/RangeContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { useModal } from '../../../Global/Modal/useModal';
import styles from './RepositionHeader.module.css';
import { useRepoExitPath } from './useRepoExitPath';

interface propsIF {
    positionHash: string;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    resetTxHash: () => void;
}

function RepositionHeader(props: propsIF) {
    const { setRangeWidthPercentage, positionHash, resetTxHash } = props;

    const {
        setSimpleRangeWidth,
        setCurrentRangeInReposition,
        setAdvancedMode,
    } = useContext(RangeContext);
    const { bypassConfirmRepo, repoSlippage, fastLaneProtection } = useContext(
        UserPreferenceContext,
    );
    const { defaultRangeWidthForActivePool } = useContext(TradeDataContext);

    const [isOpen, openModal, closeModal] = useModal();

    const navigate = useNavigate();

    // navpath for when user clicks the exit button
    const exitPath = useRepoExitPath();

    return (
        <>
            <header className={styles.main_container}>
                <img
                    className={styles.settings_icon}
                    src={settingsIcon}
                    alt='settings'
                    onClick={openModal}
                />
                <p className={styles.title}> Reposition: {positionHash}</p>
                <VscClose
                    className={styles.close_icon}
                    onClick={() => {
                        setAdvancedMode(false);
                        setRangeWidthPercentage(defaultRangeWidthForActivePool);
                        setSimpleRangeWidth(defaultRangeWidthForActivePool);
                        navigate(exitPath, { replace: true });
                        resetTxHash();
                        setCurrentRangeInReposition('');
                    }}
                />
            </header>
            {isOpen && (
                <TransactionSettingsModal
                    module='Reposition'
                    slippage={repoSlippage}
                    bypassConfirm={bypassConfirmRepo}
                    fastLaneProtection={fastLaneProtection}
                    onClose={closeModal}
                />
            )}
        </>
    );
}

export default memo(RepositionHeader);
