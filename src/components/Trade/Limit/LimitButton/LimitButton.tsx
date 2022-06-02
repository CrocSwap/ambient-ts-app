// START: Import React and Dongles
import { useState } from 'react';

// START: Import React Functional Components
import Button from '../../../Global/Button/Button';

// START: Import Local Files
import styles from './LimitButton.module.css';

// central react functional component
export default function LimitButton() {
    const [allowedButton] = useState<boolean>(false);

    // TODO:  @Junior do we need the top-level `<div>` here or can it be eliminated
    // TODO:  ... as an unnecessary wrapper?

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
