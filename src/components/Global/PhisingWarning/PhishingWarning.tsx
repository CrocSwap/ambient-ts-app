import styles from './PhishingWarning.module.css';
import { VscClose } from 'react-icons/vsc';
import { useState } from 'react';

export default function PhishingWarning() {
    const [showWarning, setShowWarning] = useState(true);

    if (!showWarning) return null;
    return (
        <div className={styles.container}>
            <div />
            <div className={styles.content}>
                <div className={styles.warning_container}>
                    <h3>PHISHING WARNING</h3>
                    <p>
                        please make sure you are visiting{' '}
                        <span>https://ambient-finance.netlify.app/</span>- check the URL carefully.
                    </p>
                </div>
            </div>
            <div style={{ cursor: 'pointer' }} onClick={() => setShowWarning(false)}>
                {' '}
                <VscClose size='30px' />
            </div>
        </div>
    );
}
