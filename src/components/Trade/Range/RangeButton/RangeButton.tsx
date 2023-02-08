import styles from './RangeButton.module.css';
// import { useState } from 'react';
import Button from '../../../Global/Button/Button';

interface IRangeButtonProps {
    onClickFn: () => void;
    rangeAllowed: boolean;
    rangeButtonErrorMessage: string;
    bypassConfirm: boolean;
    isAmbient: boolean;
}

export default function RangeButton(props: IRangeButtonProps) {
    const { bypassConfirm, isAmbient } = props;
    // const [allowedButton] = useState<boolean>(props.isAmountEntered);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={
                    props.rangeAllowed
                        ? bypassConfirm
                            ? `Send ${isAmbient ? 'Ambient' : 'Range'} Order`
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
