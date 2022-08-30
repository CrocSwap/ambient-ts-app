import styles from './Chat.module.css';
import { useState, useEffect } from 'react';
import { MdClose, MdOpenInFull } from 'react-icons/md';
import { GoUnmute, GoMute } from 'react-icons/go';
import { BsEmojiSmile } from 'react-icons/bs';
import { Link } from 'react-router-dom';

import notificationSound from '../../../assets/audio/message.wav';
interface ChatPropsIF {
    ensName: string;
    connectedAccount: string;
    fullScreen?: boolean;
}

type MessageType = {
    message: string;
    time: string;
};

interface MessageItemPropsIF {
    name: string;
    message: string;
    time: string;
}
function MessageItem(props: MessageItemPropsIF) {
    return (
        <div className={styles.message_item_container}>
            <h2 className={styles.name}>{props.name}</h2>
            <div className={styles.message_content}>
                <div className={styles.avatar} />
                <div className={styles.message_text}>{props.message}</div>
            </div>
            <div className={styles.time}>{props.time}</div>
        </div>
    );
}

export default function Chat(props: ChatPropsIF) {
    const [showChatBot, setShowChatBot] = useState(false);
    const [message, setMessage] = useState('');
    const [messagesArray] = useState<MessageType[]>([]);
    const [soundIsMuted, setSoundIsMuted] = useState(false);

    useEffect(() => {
        props.fullScreen ? setShowChatBot(true) : null;
    }, [props.fullScreen]);

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
            {props.fullScreen ? (
                <div className={styles.chat_header_right}>
                    <h2 className={styles.name}>
                        {props.ensName ? props.ensName : props.connectedAccount}
                    </h2>
                    <div className={styles.avatar} />
                </div>
            ) : (
                <div className={styles.chat_header_right}>
                    <div onClick={() => setSoundIsMuted(!soundIsMuted)}>
                        {soundIsMuted ? <GoUnmute /> : <GoMute />}
                    </div>
                    <div onClick={() => setShowChatBot(false)}>
                        <MdClose size={20} color='#bdbdbd' />
                    </div>
                    <Link target='_blank' to='/app/chat'>
                        <MdOpenInFull size={18} />
                    </Link>
                </div>
            )}
        </div>
    );
    const audio = new Audio(notificationSound);
    audio.muted = soundIsMuted;
    const handleMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const date = new Date();
        const time = date.toLocaleTimeString();
        if (event.key === 'Enter') {
            event.preventDefault();

            messagesArray?.push({ message, time });

            setMessage('');
            audio.volume = 0.1;
            audio.play();
        }
    };

    const chatInput = (
        <div className={styles.input_container}>
            <input
                type='text'
                placeholder='Enter message'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => handleMessage(e)}
            />
            <div className={styles.input_right}>
                <BsEmojiSmile size={16} color='#555555' />
            </div>
        </div>
    );

    const messagesDisplay = (
        <div className={styles.messages_container}>
            {messagesArray &&
                messagesArray.map((message, idx) => (
                    <MessageItem
                        key={idx}
                        message={message.message}
                        time={message.time}
                        name={props.ensName ? props.ensName : props.connectedAccount}
                    />
                ))}
        </div>
    );

    const wrapperStyleFull = styles.chat_wrapper_full;
    const wrapperStyle = showChatBot ? styles.chat_wrapper_active : styles.chat_wrapper;

    return (
        <div className={styles.chat}>
            <div className={styles.chat_container}>
                {props.fullScreen ? null : chatButton}
                <div className={props.fullScreen ? wrapperStyleFull : wrapperStyle}>
                    {chatHeader}
                    {messagesDisplay}
                    {chatInput}
                </div>
            </div>
        </div>
    );
}
