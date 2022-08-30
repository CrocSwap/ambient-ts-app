import styles from './Chat.module.css';
import { useState, useEffect } from 'react';
import { MdClose, MdOpenInFull } from 'react-icons/md';
import { GoUnmute, GoMute } from 'react-icons/go';
import { BsEmojiSmile } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { devpun } from './devpun';

import notificationSound from '../../../assets/audio/message.wav';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import MessageItem from './MessageItem/MessageItem';
interface ChatPropsIF {
    ensName: string;
    connectedAccount: string;
    fullScreen?: boolean;
}

type MessageType = {
    message: string;
    time: string;
    isUser: boolean;
};

interface MessageItemPropsIF {
    name: string;
    message: string;
    time: string;
    idx: number;
    isUser: boolean;
}

export default function Chat(props: ChatPropsIF) {
    const [showChatBot, setShowChatBot] = useState(false);
    const [message, setMessage] = useState('');
    const [messagesArray, setMessagesArray] = useState<MessageType[]>([]);
    const [aiMessageIsAJoke, setAiMessageIsAJoke] = useState(false);
    const [soundIsMuted, setSoundIsMuted] = useState(false);

    useEffect(() => {
        props.fullScreen ? setShowChatBot(true) : null;
    }, [props.fullScreen]);

    // function MessageItem(props: MessageItemPropsIF) {

    //     const messageYes = 'The sky is blue. Grass is green? a. Do you know the color of the Cloud';

    //  const sentences = props.message.split(/[?]/);

    //      const [ answerBlur, setAnswerBlur] = useState(true)

    //      const jokeContent = (
    //          <div className={styles.joke_container}>
    //              <div className={styles.question}>{ sentences[0]}</div>
    //              <div onClick={() => setAnswerBlur(!answerBlur) } className={answerBlur ? styles.answer_blur : styles.answer}>
    //                {  sentences[1]}
    //              </div>
    //          </div>
    //      )

    //      return (
    //          <div className={`${styles.message_item_container} ${!props.isUser && styles.example_right_side }`}>

    //                  <h2 className={styles.name}>{props.isUser ? props.name : 'Ambi'}</h2>

    //              <div className={styles.message_content}>

    //                  {props.isUser ?
    //                      <div className={styles.avatar} /> :    <img src={ambientLogo} alt="ambient" />
    //                  }

    //                  <div className={styles.message_text}>{ aiMessageIsAJoke ? jokeContent :  props.message}</div>
    //              </div>
    //              <div className={styles.time}>{props.time}</div>
    //          </div>
    //      );
    //  }

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

    const [fakeMessageTyping, setFakeMessageTyping] = useState(true);

    const AiMessagesArray = [
        ` Hi there ${
            props.ensName ? props.ensName : 'friend'
        }. My name is Ambi. I am here to help guide you through our chat Interface. Try typing next in the input below and press enter`,

        'Nice! As you can see, there is sound associated with the chat system. For your convenience, you can keep it muted or unmuted by clicking the sound icon on the upper right side. Type next once you are done ',

        'Nice! Try to play around with the UI a little. If you have any suggestions for improvement, let Junior know!',

        'You are still here...I have nothing else for you at the moment but you can try entering the word "joke" to get a joke.',
    ];
    const [currentMessage, setCurrentMessage] = useState(0);
    const [aiMessage, setAiMessage] = useState(AiMessagesArray[currentMessage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFakeMessageTyping(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [showChatBot]);

    const typingAnimmation = (
        <div className={styles.loader}>
            <span></span>
            <span></span>
            <span></span>
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
                    <div onClick={() => setSoundIsMuted(!soundIsMuted)}>
                        {soundIsMuted ? <GoUnmute /> : <GoMute />}
                    </div>
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

    const randomJoke = Math.floor(Math.random() * devpun.length);
    const handleNextMessage = () => {
        setCurrentMessage((prev) => {
            if (prev === AiMessagesArray.length - 1) {
                setAiMessageIsAJoke(true);
                return 0;
            } else {
                return prev + 1;
            }
        });
    };

    const handleMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const date = new Date();
        const time = date.toLocaleTimeString();
        if (event.key === 'Enter') {
            event.preventDefault();

            messagesArray?.push({ message, time, isUser: true });

            setMessage('');
            audio.volume = 0.1;
            audio.play();
            if (message?.toLowerCase() === 'joke') {
                setAiMessageIsAJoke(true);
            }
            handleNextMessage();
            setTimeout(handleComputerResponse, 2000);
        }
        function handleComputerResponse() {
            const newMessage = {
                message: aiMessageIsAJoke
                    ? devpun[randomJoke].text
                    : AiMessagesArray[currentMessage],
                time: 'time',
                isUser: false,
            };

            const newMessageArray = [...messagesArray, newMessage];

            setMessagesArray(newMessageArray);
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
            {/* {exampleRightSideMessage} */}
            {messagesArray &&
                messagesArray.map((message, idx) => (
                    <MessageItem
                        key={idx}
                        idx={idx}
                        message={message.message}
                        time={message.time}
                        name={props.ensName ? props.ensName : props.connectedAccount}
                        isUser={message.isUser}
                        aiMessageIsAJoke={aiMessageIsAJoke}
                    />
                ))}
            {/* { showNextMessage &&  exampleRightSideMessage} */}
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
