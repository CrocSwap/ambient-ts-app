import { useEffect, useState } from 'react';
import { BsSlashSquare, BsEmojiSmileFill } from 'react-icons/bs';
import { Message } from '../../Model/MessageModel';
import Picker from 'emoji-picker-react';
import {
    // host,
    sendMessageRoute,
    socket,
} from '../../Service/chatApi';
import styles from './MessageInput.module.css';
import axios from 'axios';

interface MessageInputProps {
    message: Message;
    handleEmojiPickerHideShow: any;
    handleEmojiClick: any;
    room: string;
    showEmojiPicker: boolean;
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
            message: msg,
            roomInfo: props.room,
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onChangeMessage = (e: any) => {
        setMessage(e.target.value);
    };

    return (
        <div className={styles.input_box}>
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
            <BsEmojiSmileFill onClick={props.handleEmojiPickerHideShow} />
            {props.showEmojiPicker && <Picker onEmojiClick={props.handleEmojiClick} />}
        </div>
    );
}
