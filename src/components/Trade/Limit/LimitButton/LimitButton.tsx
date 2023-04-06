import Button from '../../../Global/Button/Button';
import styles from './LimitButton.module.css';

interface propsIF {
    onClickFn: () => void;
    limitAllowed: boolean;
    limitButtonErrorMessage: string;
    isBypassConfirmEnabled: boolean;
}

export default function LimitButton(props: propsIF) {
    const {
        onClickFn,
        limitAllowed,
        limitButtonErrorMessage,
        isBypassConfirmEnabled,
    } = props;

    // TODO:  @Junior do we need the top-level `<div>` here or can it be eliminated
    // TODO:  ... as an unnecessary wrapper?

    return (
        <div className={styles.button_container}>
            <Button
                title={
                    limitAllowed
                        ? isBypassConfirmEnabled
                            ? 'Send Limit'
                            : 'Open Confirmation'
                        : limitButtonErrorMessage
                }
                action={onClickFn}
                disabled={!limitAllowed}
                flat
            />
        </div>
    );
}
