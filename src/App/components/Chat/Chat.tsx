import styles from './Chat.module.css';
import { useState, useEffect } from 'react';
import { MdClose, MdOpenInFull } from 'react-icons/md';
import { GoUnmute, GoMute } from 'react-icons/go';
import { BsEmojiSmile } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { devpun } from './devpun';

import notificationSound from '../../../assets/audio/message.wav';
import MessageItem from './MessageItem/MessageItem';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

interface ChatPropsIF {
    ensName: string;
    connectedAccount: string;
    fullScreen?: boolean;
    favePools: any;
}

type MessageType = {
    message: string;
    time: string;
    isUser: boolean;
};

export default function Chat(props: ChatPropsIF) {
    const [showChatBot, setShowChatBot] = useState(false);
    const [message, setMessage] = useState('');
    const [messagesArray, setMessagesArray] = useState<MessageType[]>([]);
    const [aiMessageIsAJoke, setAiMessageIsAJoke] = useState(false);
    const [soundIsMuted, setSoundIsMuted] = useState(false);
    // const [chatStatus, setChatStatus] = useState(false);

    useEffect(() => {
        props.fullScreen ? setShowChatBot(true) : null;
    }, [props.fullScreen]);

    const AiMessagesArray = [
        ` Hi there ${
            props.ensName ? props.ensName : 'friend'
        }. My name is Ambi. I am here to help guide you through our chat Interface. You can always type and send "next" for the next guide`,

        'Nice! As you can see, there is sound associated with the chat system. For your convenience, you can keep it muted or unmuted by clicking the sound icon on the upper right side. Type "Next" for the next tip.',

        'There we go! Try to play around with the UI a little. If you have any suggestions for improvement, be sure let Junior and the product team know!',

        'You are still here...I have nothing else for you at the moment but you can try entering the word "joke" to get a joke.',
    ];
    const [currentMessage, setCurrentMessage] = useState(0);

    // chatheader
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
            const date = new Date();
            const time = date.toLocaleTimeString();
            const newMessage = {
                message: aiMessageIsAJoke
                    ? devpun[randomJoke].text
                    : AiMessagesArray[currentMessage],
                time: time,
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
                        isFullScreen={props.fullScreen}
                    />
                ))}
        </div>
    );

    // const [showWelcomeBack, setShowWelcomeBack] = useState(false);

    // const welcomeBack = (
    //     <div className={styles.welcome_back} onClick={() => setShowChatBot(true)}>
    //         Welcome back. Just let me know what are you looking for 🙂
    //     </div>
    // );

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setShowWelcomeBack(true);
    //     }, 10000);

    //     return () => clearTimeout(timer);
    // }, []);

    const wrapperStyleFull = styles.chat_wrapper_full;
    const wrapperStyle = showChatBot ? styles.chat_wrapper_active : styles.chat_wrapper;
    // current configurations of trade as specified by the user
    const tradeData = useAppSelector((state) => state.tradeData);
    const currentPoolInfo = tradeData;
    return (
        <div className={styles.chat}>
            <div className={styles.chat_container}>
                {/* {showWelcomeBack && !showChatBot && welcomeBack} */}

                <div className={props.fullScreen ? wrapperStyleFull : wrapperStyle}>
                    {/* {chatHeader}
                    {messagesDisplay}
                    {chatInput} */}
                </div>
            </div>
        </div>
    );
}
