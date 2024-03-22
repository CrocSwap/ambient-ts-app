import { useId, Dispatch, SetStateAction, useContext } from 'react';
// import { useLocation } from 'react-router-dom';
import Toggle from '../../Form/Toggle';
import styles from './SendToDexBalControl.module.css';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { ExplanationButton } from '../../Form/Icons/Icons.styles';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { FlexContainer } from '../../../styled/Common';

interface propsIF {
    tempSaveToDex: boolean;
    setTempSaveToDex: Dispatch<SetStateAction<boolean>>;
    displayInSettings?: boolean;
}

export default function SaveToDexBalanceModalControl(props: propsIF) {
    const { tempSaveToDex, setTempSaveToDex, displayInSettings } = props;
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

            <Toggle
                key={compKey}
                isOn={tempSaveToDex}
                disabled={false}
                handleToggle={() => setTempSaveToDex(!tempSaveToDex)}
                id='disabled_confirmation_modal_toggle'
                aria-label={toggleAriaLabel}
            />
        </div>
    );
}
