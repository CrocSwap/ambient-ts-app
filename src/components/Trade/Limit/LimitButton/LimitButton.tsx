// START: Import React and Dongles
import { useState } from 'react';

// START: Import React Functional Components
import Button from '../../../Global/Button/Button';

// START: Import Local Files
import styles from './LimitButton.module.css';

// central react functional component
export default function LimitButton() {
    const [allowedButton] = useState<boolean>(false);

    return (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Limit' : 'Enter an amount'}
                // action={() => console.log('clicked')}
                action={() => console.log('clicked')}
                disabled={allowedButton}
            />
        </div>
    );
}
