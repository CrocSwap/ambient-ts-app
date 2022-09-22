import styles from './RangeShare.module.css';
import { useState } from 'react';

import { AiOutlineShareAlt } from 'react-icons/ai';

export default function RangeShare() {
    const [showShareModal, setShowShareModal] = useState(false);

    const shareButton = (
        <div className={styles.share_button} onClick={() => setShowShareModal(!showShareModal)}>
            <AiOutlineShareAlt />
        </div>
    );
    const wrapperStyle = showShareModal ? styles.share_wrapper_active : styles.share_wrapper;

    return <div className={styles.container}>Range Share Data</div>;
}
