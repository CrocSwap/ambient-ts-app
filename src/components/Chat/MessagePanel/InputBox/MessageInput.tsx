import {
    useEffect,
    //  useRef,
    useState,
} from 'react';
import { BsSlashSquare, BsEmojiSmileFill } from 'react-icons/bs';
import { FiSmile } from 'react-icons/fi';
import { Message } from '../../Model/MessageModel';
import Picker from 'emoji-picker-react';
import { IoMdSend } from 'react-icons/io';
import {
    // host,
    sendMessageRoute,
    socket,
} from '../../Service/chatApi';
import styles from './MessageInput.module.css';
import axios from 'axios';
import { setFlagsFromString } from 'v8';

// import { io } from 'socket.io-client';

interface MessageInputProps {
    message: Message;
}

export default function MessageInput(props: MessageInputProps) {
    const _socket = socket;

    useEffect(() => {
        _socket.connect();
        // _socket.on('msg-recieve', (data) => {
        // //   setMessageReceived(data.message)
        // })
        // _socket.disconnect();
    }, [_socket]);

    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiClick = (event: any, emoji: any) => {
        let msg = message;
        msg += emoji.emoji;
        setMessage(msg);
    };

    const handleEmojiPickerHideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            handleSendMsg(e.target.value);
            setMessage('');
        }
    };

    const handleSendMsg = async (msg: string) => {
        _socket.emit('send-msg', msg);

        await axios.post(sendMessageRoute, {
            from: '62f24f3ff40188d467c532e8',
            to: '62fa389c897f9778e2eb863f',
            roomInfo: 'Global',
            message: msg,
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onChangeMessage = (e: any) => {
        setMessage(e.target.value);
    };

    return (
        <div className={styles.input_box}>
            <div className={styles.input}>
                <input
                    type='text'
                    id='box'
                    placeholder='Please log in to chat.'
                    className={styles.input_text}
                    onKeyDown={_handleKeyDown}
                    value={message}
                    onChange={onChangeMessage}
                />
                <BsSlashSquare />
                <BsEmojiSmileFill onClick={handleEmojiPickerHideShow} />
            </div>
            <div className={styles.emojiPicker}>
                {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
            </div>
        </div>
    );
}
