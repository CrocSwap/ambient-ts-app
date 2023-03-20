import styles from './RangeButton.module.css';
// import { useState } from 'react';
import Button from '../../../Global/Button/Button';

interface IRangeButtonProps {
    onClickFn: () => void;
    rangeAllowed: boolean;
    rangeButtonErrorMessage: string;
    bypassConfirm: boolean;
    isAmbient: boolean;
    isAdd: boolean;
}

export default function RangeButton(props: IRangeButtonProps) {
    const { bypassConfirm, isAmbient, isAdd } = props;
    // const [allowedButton] = useState<boolean>(props.isAmountEntered);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={
                    props.rangeAllowed
                        ? bypassConfirm
                            ? isAdd
                                ? `Add to ${isAmbient ? 'Ambient' : 'Range'} Position`
                                : `Create ${isAmbient ? 'Ambient' : 'Range'} Position`
                            : 'Open Confirmation'
                        : props.rangeButtonErrorMessage
                }
                // action={() => console.log('clicked')}
                action={props.onClickFn}
                disabled={!props.rangeAllowed}
                flat={true}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
