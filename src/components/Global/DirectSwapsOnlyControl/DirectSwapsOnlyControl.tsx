import { Dispatch, SetStateAction, useContext, useId } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { FlexContainer } from '../../../styled/Common';
import { ExplanationButton } from '../../Form/Icons/Icons.styles';
import Toggle from '../../Form/Toggle';
import styles from './DirectSwapsOnlyControl.module.css';

interface propsIF {
    tempDirectSwapsOnly: boolean;
    setTempDirectSwapsOnly: Dispatch<SetStateAction<boolean>>;
    displayInSettings?: boolean;
}

export default function DirectSwapsOnlyModalControl(props: propsIF) {
    const { tempDirectSwapsOnly, setTempDirectSwapsOnly, displayInSettings } =
        props;
    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);

    const compKey = useId();

    const toggleAriaLabel = `${
        tempDirectSwapsOnly ? 'disable save' : 'save'
    } to exchange balance for future trading at lower gas costs`;

    return (
        <div className={styles.main_container}>
            {displayInSettings ? (
                <FlexContainer alignItems='center' gap={8}>
                    <p tabIndex={0}>{'Direct swaps only'}</p>
                    <ExplanationButton
                        onClick={() =>
                            openGlobalPopup(
                                <div>
                                    Forcing direct swaps may result in reduced
                                    swap output compared to multihop swaps but
                                    with lower fees.
                                </div>,
                                'Direct swaps only',
                                'right',
                            )
                        }
                        aria-label='Open direct swaps explanation popup.'
                    >
                        <AiOutlineInfoCircle color='var(--text2)' />
                    </ExplanationButton>
                </FlexContainer>
            ) : (
                <p tabIndex={0}>Send to exchange balance</p>
            )}

            <Toggle
                key={compKey}
                isOn={tempDirectSwapsOnly}
                disabled={false}
                handleToggle={() =>
                    setTempDirectSwapsOnly(!tempDirectSwapsOnly)
                }
                id='disabled_confirmation_modal_toggle'
                aria-label={toggleAriaLabel}
            />
        </div>
    );
}
