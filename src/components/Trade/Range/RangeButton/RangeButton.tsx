import styles from './RangeButton.module.css';
import Button from '../../../Global/Button/Button';

interface propsIF {
    onClickFn: () => void;
    rangeAllowed: boolean;
    rangeButtonErrorMessage: string;
    isBypassConfirmEnabled: boolean;
    isAmbient: boolean;
    isAdd: boolean;
}

export default function RangeButton(props: propsIF) {
    const {
        isBypassConfirmEnabled,
        isAmbient,
        isAdd,
        rangeButtonErrorMessage,
        onClickFn,
        rangeAllowed,
    } = props;

    return (
        <div className={styles.button_container}>
            <Button
                title={
                    rangeAllowed
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
                }
                action={onClickFn}
                disabled={!rangeAllowed}
                flat={true}
            />
        </div>
    );
}
