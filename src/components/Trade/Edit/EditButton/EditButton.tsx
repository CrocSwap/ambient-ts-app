import styles from './RangeButton.module.css';
import { useState } from 'react';
import Button from '../../../Global/Button/Button';

export default function EditButton() {
    const [allowedButton] = useState<boolean>(true);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Update Position' : 'Enter an amount'}
                // action={() => console.log('clicked')}
                action={() => console.log('position updated')}
                disabled={!allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
