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
}
export default function MessageItem(props: MessageItemPropsIF) {
    const messageYes = 'The sky is blue. Grass is green? a. Do you know the color of the Cloud';

    const sentences = props.message.split(/[?]/);

    const [answerBlur, setAnswerBlur] = useState(true);

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

    return (
        <div
            className={`${styles.message_item_container} ${
                !props.isUser && styles.example_right_side
            }`}
        >
            <h2 className={styles.name}>{props.isUser ? props.name : 'Ambi'}</h2>

            <div className={styles.message_content}>
                {props.isUser ? (
                    <div className={styles.avatar} />
                ) : (
                    <img src={ambientLogo} alt='ambient' />
                )}

                <div className={styles.message_text}>
                    {props.aiMessageIsAJoke ? jokeContent : props.message}
                </div>
            </div>
            <div className={styles.time}>{props.time}</div>
        </div>
    );
}
