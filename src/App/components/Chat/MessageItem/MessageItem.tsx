import styles from './MessageItem.module.css';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.svg';
import { useState } from 'react';
interface MessageItemPropsIF {
    name: string;
    message: string;
    time: string;
    idx: number;
    isUser: boolean;
    aiMessageIsAJoke: boolean;
    isFullScreen?: boolean;
}
export default function MessageItem(props: MessageItemPropsIF) {
    const [typing, setTyping] = useState(true);

    const typingAnimmation = (
        <div className={styles.loader}>
            <span></span>
            <span></span>
            <span></span>
        </div>
    );

    const sentences = props.message.split(/[?]/);

    const [answerBlur, setAnswerBlur] = useState(true);

    setTimeout(() => {
        setTyping(false);
    }, 2000);

    const jokeContent = (
        <div className={styles.joke_container}>
            <div className={styles.question}>{sentences[0]}</div>
            <div
                onClick={() => setAnswerBlur(!answerBlur)}
                className={answerBlur ? styles.answer_blur : styles.answer}
            >
                {sentences[1]}
            </div>
        </div>
    );
    const messageRender = props.aiMessageIsAJoke ? jokeContent : props.message;
    return (
        <div
            className={`${styles.message_item_container} ${
                !props.isUser && styles.example_right_side
            }`}
        >
            <h2 className={styles.name}>{props.isUser ? props.name : 'Ambi'}</h2>

            <div
                className={`${styles.message_content} ${
                    props.isFullScreen && styles.full_screen_message_content
                }`}
            >
                {props.isUser ? (
                    <div className={styles.avatar} />
                ) : (
                    <img src={ambientLogo} alt='ambient' />
                )}

                <div className={styles.message_text}>
                    {!props.isUser ? (typing ? typingAnimmation : messageRender) : messageRender}
                </div>
            </div>
            <div className={styles.time}>{props.time}</div>
        </div>
    );
}
