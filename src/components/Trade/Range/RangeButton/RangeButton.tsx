import styles from './RangeButton.module.css';
import Button from '../../../Global/Button/Button';
import { useContext } from 'react';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';

interface propsIF {
    onClickFn: () => void;
    rangeAllowed: boolean;
    rangeButtonErrorMessage: string;
    isAmbient: boolean;
    isAdd: boolean;
    areBothAckd: boolean;
}

export default function RangeButton(props: propsIF) {
    const {
        isAmbient,
        isAdd,
        rangeButtonErrorMessage,
        onClickFn,
        rangeAllowed,
        areBothAckd,
    } = props;

    const { bypassConfirmRange } = useContext(UserPreferenceContext);

    return (
        <div className={styles.button_container}>
            <Button
                title={
                    areBothAckd
                        ? rangeAllowed
                            ? bypassConfirmRange.isEnabled
                                ? isAdd
                                    ? `Add to ${
                                          isAmbient ? 'Ambient' : 'Range'
                                      } Position`
                                    : `Create ${
                                          isAmbient ? 'Ambient' : 'Range'
                                      } Position`
                                : 'Open Confirmation'
                            : rangeButtonErrorMessage
                        : 'Acknowledge'
                }
                action={onClickFn}
                disabled={!rangeAllowed && areBothAckd}
                flat={true}
            />
        </div>
    );
}
