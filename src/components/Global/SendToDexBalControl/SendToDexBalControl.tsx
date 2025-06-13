import { Dispatch, SetStateAction, useContext, useId } from 'react';
// import{ useLocation } from 'react-router-dom';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { FlexContainer } from '../../../styled/Common';
import { ExplanationButton } from '../../Form/Icons/Icons.styles';
import Toggle from '../../Form/Toggle';
import Tooltip from '../Tooltip/Tooltip';
import styles from './SendToDexBalControl.module.css';

interface propsIF {
    tempSaveToDex: boolean;
    setTempSaveToDex: Dispatch<SetStateAction<boolean>>;
    displayInSettings?: boolean;
    disabled?: boolean;
}

export default function SaveToDexBalanceModalControl(props: propsIF) {
    const {
        tempSaveToDex,
        setTempSaveToDex,
        displayInSettings,
        disabled = false,
    } = props;
    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    // const { pathname } = useLocation();

    const compKey = useId();

    // const moduleName = pathname.includes('swap')
    //     ? 'Swaps'
    //     : pathname.includes('market')
    //     ? 'Swaps'
    //     : pathname.includes('pool')
    //     ? 'Pool Orders'
    //     : pathname.includes('reposition')
    //     ? 'Repositions'
    //     : pathname.includes('limit')
    //     ? 'Limit Orders'
    //     : 'unhandled';

    const toggleAriaLabel = `${
        tempSaveToDex ? 'disable save' : 'save'
    } to exchange balance for future trading at lower gas costs`;

    return (
        <div className={styles.main_container}>
            {displayInSettings ? (
                <FlexContainer alignItems='center' gap={8}>
                    <p tabIndex={0}>{'Send to exchange balance'}</p>
                    <ExplanationButton
                        onClick={() =>
                            openGlobalPopup(
                                <div>
                                    Deposited collateral can be traded later at
                                    lower gas costs and withdrawn at any time.
                                </div>,
                                'Exchange Balance',
                                'right',
                            )
                        }
                        aria-label='Open range width explanation popup.'
                    >
                        <AiOutlineInfoCircle color='var(--text2)' />
                    </ExplanationButton>
                </FlexContainer>
            ) : (
                <p tabIndex={0}>Send to exchange balance</p>
            )}
            <Tooltip
                content={
                    disabled
                        ? 'This toggle is disabled because MEV-Protection is enabled.'
                        : undefined
                }
                position='left'
            >
                <Toggle
                    key={compKey}
                    isOn={tempSaveToDex}
                    disabled={disabled}
                    handleToggle={() => setTempSaveToDex(!tempSaveToDex)}
                    id='disabled_confirmation_modal_toggle'
                    aria-label={toggleAriaLabel}
                />
            </Tooltip>
        </div>
    );
}
