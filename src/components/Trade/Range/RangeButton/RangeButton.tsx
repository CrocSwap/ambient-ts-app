import styles from './RangeButton.module.css';
import Button from '../../../Global/Button/Button';

interface propsIF {
    onClickFn: () => void;
    rangeAllowed: boolean;
    rangeButtonErrorMessage: string;
    isBypassConfirmEnabled: boolean;
    isAmbient: boolean;
    isAdd: boolean;
    areBothAckd: boolean;
}

export default function RangeButton(props: propsIF) {
    const {
        isBypassConfirmEnabled,
        isAmbient,
        isAdd,
        rangeButtonErrorMessage,
        onClickFn,
        rangeAllowed,
        areBothAckd,
    } = props;

    return (
        <div className={styles.button_container}>
            <Button
                title={
                    areBothAckd
                        ? rangeAllowed
                            ? isBypassConfirmEnabled
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
