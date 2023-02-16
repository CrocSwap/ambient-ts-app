import styles from './SwapButton.module.css';
// import { useState } from 'react';
import Button from '../../Global/Button/Button';

interface propsIF {
    onClickFn: () => void;
    swapAllowed: boolean;
    swapButtonErrorMessage: string;
    isSwapConfirmationBypassEnabled: boolean;
    bypassConfirm: boolean;
}

export default function SwapButton(props: propsIF) {
    const { bypassConfirm } = props;
    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={
                    props.isSwapConfirmationBypassEnabled
                        ? props.swapAllowed
                            ? 'Send Swap'
                            : props.swapButtonErrorMessage
                        : props.swapAllowed
                        ? bypassConfirm
                            ? 'Send Transaction'
                            : 'Open Confirmation'
                        : props.swapButtonErrorMessage
                }
                // action={() => console.log('clicked')}
                action={props.onClickFn}
                disabled={!props.swapAllowed}
                flat={true}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
