import styles from './RepositionButton.module.css';
// import { useState } from 'react';
import Button from '../../../Global/Button/Button';

// interface IRepostionButtonProps {
//     onClickFn: () => void;
//     rangeAllowed: boolean;
//     rangeButtonErrorMessage: string;
// }

export default function RepositionButton() {
    // ----------------------------TEMPORARY DATA------------------------
    const rangeAllowed = false;
    const onClickFn = () => console.log('clicked');
    const rangeButtonErrorMessage = 'Enter an amount';
    // ----------------------------TEMPORARY DATA------------------------

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={rangeAllowed ? 'Open Confirmation' : rangeButtonErrorMessage}
                // action={() => console.log('clicked')}
                action={onClickFn}
                disabled={!rangeAllowed}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
