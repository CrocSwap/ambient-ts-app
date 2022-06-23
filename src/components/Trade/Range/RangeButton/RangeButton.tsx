import styles from './RangeButton.module.css';
// import { useState } from 'react';
import Button from '../../../Global/Button/Button';

interface IRangeButtonProps {
    onClickFn: () => void;
    rangeAllowed: boolean;
    rangeButtonErrorMessage: string;
}

export default function RangeButton(props: IRangeButtonProps) {
    // const [allowedButton] = useState<boolean>(props.isAmountEntered);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={props.rangeAllowed ? 'Open Confirmation' : props.rangeButtonErrorMessage}
                // action={() => console.log('clicked')}
                action={props.onClickFn}
                disabled={!props.rangeAllowed}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
