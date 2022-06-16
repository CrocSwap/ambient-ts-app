import styles from './TokenListCard.module.css';
import { useState } from 'react';
import { MdOutlineSettings } from 'react-icons/md';
import Toggle from '../../Global/Toggle/Toggle';

export default function TokenListCard() {
    const listIsActive = false;
    const [isChecked, setIsChecked] = useState(listIsActive);

    const cardBackground = isChecked ? 'red' : '#363535';

    function handleToggleAction() {
        // handleAlert()
        setIsChecked(!isChecked);
    }

    return (
        <div className={styles.token_list_card_container}>
            <div
                className={styles.token_list_card_content}
                style={{ backgroundColor: cardBackground }}
            >
                <div className={styles.left_content}>
                    <img
                        src='https://cdn2.iconfinder.com/data/icons/animals-nature-2/50/1F40A-crocodile-512.png'
                        alt='token list icon'
                        width='40px'
                    />
                    <div className={styles.token_list_card_name}>
                        <span> CrocSwap Interface</span>
                        <div className={styles.token_count}>{21} tokens</div>
                    </div>
                </div>
                <div className={styles.right_content}>
                    <Toggle
                        isOn={isChecked}
                        handleToggle={handleToggleAction}
                        buttonColor={isChecked ? 'blue' : '#565a69'}
                        Width={50}
                        id='ambientId'
                        onColor={isChecked ? 'black' : '#212429'}
                    />
                </div>
            </div>
        </div>
    );
}
