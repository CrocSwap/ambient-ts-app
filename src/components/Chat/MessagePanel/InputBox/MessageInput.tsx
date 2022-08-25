import {
    useEffect,
    //  useRef,
    useState,
} from 'react';
import { BsSlashSquare } from 'react-icons/bs';
import { FiSmile } from 'react-icons/fi';
import { Message } from '../../Model/MessageModel';
import {
    // host,
    sendMessageRoute,
    socket,
} from '../../Service/chatApi';
import styles from './MessageInput.module.css';
import axios from 'axios';
// import { io } from 'socket.io-client';

interface MessageInputProps {
    message: Message;
    room: string;
}

export default function MessageInput(props: MessageInputProps) {
    console.log({ props });
    const _socket = socket;

    useEffect(() => {
        _socket.connect();
        // _socket.on('msg-recieve', (data) => {
        // //   setMessageReceived(data.message)
        // })
        // _socket.disconnect();
    }, [_socket]);

    const [message, setMesage] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            handleSendMsg(e.target.value);
            setMesage('');
        }
    };

    const handleSendMsg = async (msg: string) => {
        _socket.emit('send-msg', msg);

        await axios.post(sendMessageRoute, {
            from: '62f24f3ff40188d467c532e8',
            to: '62fa389c897f9778e2eb863f',
            roomInfo: props.room,
            message: msg,
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onChangeMessage = (e: any) => {
        setMesage(e.target.value);
    };

    return (
        <div className={styles.input_box}>
            <input
                type='text'
                id='box'
                placeholder='Enter message...'
                className={styles.input_text}
                onKeyDown={_handleKeyDown}
                value={message}
                onChange={onChangeMessage}
            />
            <BsSlashSquare />
            <FiSmile />
        </div>
    );
}
