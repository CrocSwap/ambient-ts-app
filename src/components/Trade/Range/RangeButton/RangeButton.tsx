import Button from '../../../Global/Button/Button';
import { memo, useContext } from 'react';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';

interface propsIF {
    onClickFn: () => void;
    rangeAllowed: boolean;
    rangeButtonErrorMessage: string;
    isAmbient: boolean;
    isAdd: boolean;
    areBothAckd: boolean;
}

function RangeButton(props: propsIF) {
    const {
        isAmbient,
        isAdd,
        rangeButtonErrorMessage,
        onClickFn,
        rangeAllowed,
        areBothAckd,
    } = props;

    const { bypassConfirmRange } = useContext(UserPreferenceContext);

    let title;

    switch (true) {
        case areBothAckd:
            if (rangeAllowed) {
                if (bypassConfirmRange.isEnabled) {
                    title = isAdd
                        ? `Add ${isAmbient ? 'Ambient' : ''} Liquidity`
                        : `Submit ${isAmbient ? 'Ambient' : ''} Liquidity`;
                } else {
                    title = 'Confirm';
                }
            } else {
                title = rangeButtonErrorMessage;
            }
            break;

        default:
            title = 'Acknowledge';
    }

    return (
        <Button
            title={title}
            action={onClickFn}
            disabled={!rangeAllowed && areBothAckd}
            flat={true}
        />
    );
}

export default memo(RangeButton);
