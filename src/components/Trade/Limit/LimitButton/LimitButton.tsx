import { memo } from 'react';
import Button from '../../../Global/Button/Button';

interface propsIF {
    onClickFn: () => void;
    limitAllowed: boolean;
    limitButtonErrorMessage: string;
    isBypassConfirmEnabled: boolean;
    areBothAckd: boolean;
}

function LimitButton(props: propsIF) {
    const {
        onClickFn,
        limitAllowed,
        limitButtonErrorMessage,
        isBypassConfirmEnabled,
        areBothAckd,
    } = props;

    return (
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
    );
}

export default memo(LimitButton);
