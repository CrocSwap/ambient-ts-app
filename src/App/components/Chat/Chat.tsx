import styles from './Chat.module.css';
import { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { BsEmojiSmile } from 'react-icons/bs';
// interface ChatPropsIF {

// }

export default function Chat() {
    const [showChatBot, setShowChatBot] = useState(true);

    const chatButton = (
        <div
            className={`${styles.chat_button} ${showChatBot && styles.active}`}
            onClick={() => setShowChatBot(!showChatBot)}
        >
            <svg className={styles.chat_bubble} width='30' height='30' viewBox='0 0 100 100'>
                <g className={styles.bubble}>
                    <path
                        className={`${styles.line} ${styles.line1}`}
                        d='M 30.7873,85.113394 30.7873,46.556405 C 30.7873,41.101961
            36.826342,35.342 40.898074,35.342 H 59.113981 C 63.73287,35.342
            69.29995,40.103201 69.29995,46.784744'
                    />
                    <path
                        className={`${styles.line} ${styles.line2}`}
                        d='M 13.461999,65.039335 H 58.028684 C
              63.483128,65.039335
              69.243089,59.000293 69.243089,54.928561 V 45.605853 C
              69.243089,40.986964 65.02087,35.419884 58.339327,35.419884'
                    />
                </g>
                <circle
                    className={`${styles.circle} ${styles.circle1}`}
                    r='1.9'
                    cy='50.7'
                    cx='42.5'
                />
                <circle
                    className={`${styles.circle} ${styles.circle2}`}
                    cx='49.9'
                    cy='50.7'
                    r='1.9'
                />
                <circle
                    className={`${styles.circle} ${styles.circle3}`}
                    r='1.9'
                    cy='50.7'
                    cx='57.3'
                />
            </svg>
        </div>
    );

    const chatHeader = (
        <div className={styles.chat_header}>
            <h3>Chat</h3>
            <div onClick={() => setShowChatBot(false)}>
                <MdClose size={20} color='#bdbdbd' />
            </div>
        </div>
    );

    const chatInput = (
        <div className={styles.input_container}>
            <input type='text' placeholder='Enter message' />
            <div className={styles.input_right}>
                <BsEmojiSmile size={16} color='#555555' />
            </div>
        </div>
    );

    const wrapperStyle = showChatBot ? styles.chat_wrapper_active : styles.chat_wrapper;

    return (
        <div className={styles.chat}>
            <div className={styles.chat_container}>
                {chatButton}
                <div className={wrapperStyle}>
                    {chatHeader}
                    {chatInput}
                </div>
            </div>
        </div>
    );
}
