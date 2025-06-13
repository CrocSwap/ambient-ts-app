import { Dispatch, SetStateAction, useContext, useId } from 'react';
import Toggle from '../../Form/Toggle';
import styles from './FastLaneProtectionControl.module.css';
import { FlexContainer } from '../../../styled/Common';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { AppStateContext } from '../../../contexts';
import { ExplanationButton } from '../../Form/Icons/Icons.styles';

interface propsIF {
    tempEnableFastLane: boolean;
    setTempEnableFastLane: Dispatch<SetStateAction<boolean>>;
    displayInSettings?: boolean;
}

export default function FastLaneProtectionControl(props: propsIF) {
    const { tempEnableFastLane, setTempEnableFastLane, displayInSettings } =
        props;
    const compKey = useId();
    const toggleAriaLabel = `${
        tempEnableFastLane ? 'disable' : 'enable'
    } MEV protection by Fastlane`;

    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);

    return (
        <div className={styles.main_container}>
            <FlexContainer alignItems='center' gap={8}>
                <p tabIndex={0}>Enable MEV-Protection by Fastlane</p>

                <ExplanationButton
                    onClick={() =>
                        openGlobalPopup(
                            <div>
                                MEV-Protection by Fastlane helps protect your
                                transactions from Maximal Extractable Value
                                (MEV) attacks, such as front-running and
                                sandwich attacks, by routing trades through a
                                secure network.
                            </div>,
                            'MEV protection by Fastlane',
                            'right',
                        )
                    }
                    aria-label='Open range width explanation popup.'
                >
                    <AiOutlineInfoCircle color='var(--text2)' />
                </ExplanationButton>
            </FlexContainer>

            <Toggle
                key={compKey}
                isOn={tempEnableFastLane}
                disabled={false}
                handleToggle={() => setTempEnableFastLane(!tempEnableFastLane)}
                id='enable_fastlane_toggle'
                aria-label={toggleAriaLabel}
            />
        </div>
    );
}
