// START: Import React and Dongles
import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import { VscClose } from 'react-icons/vsc';

// START: Import JSX Components
import TransactionSettingsModal from '../../../Global/TransactionSettingsModal/TransactionSettingsModal';

// START: Import Local Files
import styles from './RepositionHeader.module.css';
import { useRepoExitPath } from './useRepoExitPath';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { RangeContext } from '../../../../contexts/RangeContext';
import { useModal } from '../../../Global/Modal/useModal';
import { TradeModuleHeaderContainer } from '../../../../styled/Components/TradeModules';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';

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
    const { bypassConfirmRepo, repoSlippage } = useContext(
        UserPreferenceContext,
    );
    const { defaultRangeWidthForActivePool } = useContext(TradeDataContext);

    const [isOpen, openModal, closeModal] = useModal();

    const navigate = useNavigate();

    // navpath for when user clicks the exit button
    const exitPath = useRepoExitPath();

    return (
        <>
            <TradeModuleHeaderContainer
                flexDirection='row'
                alignItems='center'
                justifyContent='space-between'
                fullWidth
                fontSize='header1'
                color='text2'
            >
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
            </TradeModuleHeaderContainer>
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
