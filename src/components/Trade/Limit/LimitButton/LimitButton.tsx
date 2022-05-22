import styles from './LimitButton.module.css';
import { useState } from 'react';
import Button from '../../../Global/Button/Button';

export default function LimitButton() {
    const [allowedButton] = useState<boolean>(false);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Limit' : 'Enter an amount'}
                // action={() => console.log('clicked')}
                action={() => console.log('clicked')}
                disabled={allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
