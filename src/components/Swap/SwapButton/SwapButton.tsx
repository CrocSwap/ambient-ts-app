import styles from './SwapButton.module.css';
import { useState } from 'react';
import Button from '../../Global/Button/Button';

export default function SwapButton() {
    const [allowedButton] = useState<boolean>(false);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Swap' : 'Enter an amount'}
                action={() => console.log('clicked')}
                disabled={allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
