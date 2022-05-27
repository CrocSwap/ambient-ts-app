import styles from './WithdrawButton.module.css';
import { useState } from 'react';
import Button from '../../../../Global/Button/Button';

export default function WithdrawButton() {
    const [allowedButton] = useState<boolean>(false);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Withdraw' : 'Enter an amount'}
                // action={() => console.log('clicked')}
                action={() => console.log('depositing...')}
                disabled={!allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
