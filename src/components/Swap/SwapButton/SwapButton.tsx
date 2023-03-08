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
    const { bypassConfirm, swapAllowed, swapButtonErrorMessage, isSwapConfirmationBypassEnabled } =
        props;
    // console.log({ swapAllowed });
    // console.log({ swapButtonErrorMessage });
    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={
                    isSwapConfirmationBypassEnabled
                        ? swapAllowed
                            ? 'Send Swap'
                            : swapButtonErrorMessage
                        : swapAllowed
                        ? bypassConfirm
                            ? 'Send Transaction'
                            : 'Open Confirmation'
                        : swapButtonErrorMessage
                }
                // action={() => console.log('clicked')}
                action={props.onClickFn}
                disabled={!swapAllowed}
                flat={true}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
