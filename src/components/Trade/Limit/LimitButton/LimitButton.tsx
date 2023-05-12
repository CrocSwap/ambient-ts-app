import Button from '../../../Global/Button/Button';
import styles from './LimitButton.module.css';

interface propsIF {
    onClickFn: () => void;
    limitAllowed: boolean;
    limitButtonErrorMessage: string;
    isBypassConfirmEnabled: boolean;
    areBothAckd: boolean;
}

export default function LimitButton(props: propsIF) {
    const {
        onClickFn,
        limitAllowed,
        limitButtonErrorMessage,
        isBypassConfirmEnabled,
        areBothAckd,
    } = props;

    // TODO:  @Junior do we need the top-level `<div>` here or can it be eliminated
    // TODO:  ... as an unnecessary wrapper?

    return (
        <div className={styles.button_container}>
            <Button
                title={
                    areBothAckd
                        ? limitAllowed
                            ? isBypassConfirmEnabled
                                ? 'Submit Limit Order'
                                : 'Confirm'
                            : limitButtonErrorMessage
                        : 'Acknowledge'
                }
                action={onClickFn}
                disabled={!limitAllowed && areBothAckd}
                flat
            />
        </div>
    );
}
