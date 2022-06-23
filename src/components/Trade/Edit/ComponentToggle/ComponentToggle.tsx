import styles from './ComponentToggle.module.css';
import { useState } from 'react';

export default function ComponentToggle() {
    const [expertModeLiq, setExpertModeLiq] = useState(false);

    return (
        <div className={styles.liqtype_buttons_container}>
            <button
                className={!expertModeLiq ? styles.active_button : styles.non_active_button}
                onClick={() => setExpertModeLiq(!expertModeLiq)}
            >
                Guided Mode
            </button>
            <button
                className={expertModeLiq ? styles.active_button : styles.non_active_button}
                onClick={() => setExpertModeLiq(!expertModeLiq)}
            >
                Expert Mode
            </button>
        </div>
    );
}
