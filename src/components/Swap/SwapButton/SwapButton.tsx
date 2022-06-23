import styles from './SwapButton.module.css';
// import { useState } from 'react';
import Button from '../../Global/Button/Button';

interface ISwapButtonProps {
    onClickFn: () => void;
    swapAllowed: boolean;
    swapButtonErrorMessage: string;
}

export default function SwapButton(props: ISwapButtonProps) {
    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={props.swapAllowed ? 'Open Confirmation' : props.swapButtonErrorMessage}
                // action={() => console.log('clicked')}
                action={props.onClickFn}
                disabled={!props.swapAllowed}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
