// START: Import React Functional Components
import Button from '../../../Global/Button/Button';

// START: Import Local Files
import styles from './LimitButton.module.css';
import { skipConfirmIF } from '../../../../App/hooks/useSkipConfirm';

interface propsIF {
    onClickFn: () => void;
    limitAllowed: boolean;
    limitButtonErrorMessage: string;
    bypassConfirmLimit: skipConfirmIF;
}

export default function LimitButton(props: propsIF) {
    const {
        onClickFn,
        limitAllowed,
        limitButtonErrorMessage,
        bypassConfirmLimit,
    } = props;

    // TODO:  @Junior do we need the top-level `<div>` here or can it be eliminated
    // TODO:  ... as an unnecessary wrapper?

    return (
        <div className={styles.button_container}>
            <Button
                title={
                    limitAllowed
                        ? bypassConfirmLimit.isEnabled
                            ? 'Send Limit'
                            : 'Open Confirmation'
                        : limitButtonErrorMessage
                }
                action={onClickFn}
                disabled={!limitAllowed}
                flat={true}
            />
        </div>
    );
}
