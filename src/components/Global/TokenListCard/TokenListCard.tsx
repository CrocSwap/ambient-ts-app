import styles from './TokenListCard.module.css';
import { useState } from 'react';
import Toggle from '../../Global/Toggle/Toggle';
import { TokenListIF } from '../../../utils/interfaces/exports';

interface TokenListProps {
    list: TokenListIF;
    activeLists: [];
    listIsActive: boolean;
}

export default function TokenListCard(props: TokenListProps) {
    const { list, activeLists, listIsActive } = props;

    console.log({ activeLists });

    console.log({ list });

    const [isChecked, setIsChecked] = useState(listIsActive);

    const cardBackground = isChecked ? '#7371FC ' : '';

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
                        <span> {list?.name}</span>
                        <div className={styles.token_count}>{list?.tokens?.length} tokens</div>
                    </div>
                </div>
                <div className={styles.right_content}>
                    <Toggle
                        isOn={isChecked}
                        handleToggle={handleToggleAction}
                        // buttonColor={isChecked ? '#7371FC ' : '#565a69'}
                        Width={50}
                        id='ambientId'
                        // onColor={isChecked ? '#CDC1FF' : '#212429'}
                    />
                </div>
            </div>
        </div>
    );
}
