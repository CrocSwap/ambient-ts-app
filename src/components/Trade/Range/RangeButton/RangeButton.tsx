import styles from './RangeButton.module.css';
import { useState } from 'react';
import Button from '../../../Global/Button/Button';

interface IRangeButtonProps {
    onClickFn: () => void;
    isAmountEntered: boolean;
}

export default function RangeButton(props: IRangeButtonProps) {
    const [allowedButton] = useState<boolean>(props.isAmountEntered);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Send to Metamask' : 'Enter an amount'}
                // action={() => console.log('clicked')}
                action={props.onClickFn}
                disabled={!allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
