// START: Import React and Dongles
// import { useState } from 'react';

// START: Import React Functional Components
import Button from '../../../Global/Button/Button';

// START: Import Local Files
import styles from './LimitButton.module.css';

// central react functional component

interface ILimitButtonProps {
    onClickFn: () => void;
    limitAllowed: boolean;
    limitButtonErrorMessage: string;
    bypassConfirm: boolean;
}

export default function LimitButton(props: ILimitButtonProps) {
    const { bypassConfirm } = props;
    // TODO:  @Junior do we need the top-level `<div>` here or can it be eliminated
    // TODO:  ... as an unnecessary wrapper?

    return (
        <div className={styles.button_container}>
            <Button
                title={
                    props.limitAllowed
                        ? bypassConfirm
                            ? 'Send Limit'
                            : 'Open Confirmation'
                        : props.limitButtonErrorMessage
                }
                // action={() => console.log('clicked')}
                action={props.onClickFn}
                disabled={!props.limitAllowed}
                flat={true}
            />
        </div>
    );
}
