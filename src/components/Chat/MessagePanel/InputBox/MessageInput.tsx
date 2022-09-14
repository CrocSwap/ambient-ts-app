import { useMoralis } from 'react-moralis';
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
    room: string;
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
    const { user, account, enableWeb3, isWeb3Enabled, isAuthenticated } = useMoralis();
    const [positionIsActive, setPositionIsActive] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEmojiClick = (event: any, emoji: any) => {
        let msg = message;
        msg += emoji.emoji;
        setMessage(msg);
    };

    const handleEmojiPickerHideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    function handlePositionShow() {
        /* setShowPosition(!showPosition);*/
        setPositionIsActive(true);
    }

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

    const accountProps = {
        isAuthenticated: isAuthenticated,
        isWeb3Enabled: isWeb3Enabled,
    };
    return (
        <div className={styles.input_box}>
            <div className={styles.input}>
                <input
                    type='text'
                    id='box'
                    placeholder={
                        !isAuthenticated || !isWeb3Enabled
                            ? 'Please log in to chat.'
                            : 'Type to chat. Enter to submit.'
                    }
                    disabled={!isAuthenticated || !isWeb3Enabled}
                    className={styles.input_text}
                    onKeyDown={_handleKeyDown}
                    value={message}
                    onChange={onChangeMessage}
                />
                <BsSlashSquare
                    style={positionIsActive ? { color: '#5FA2FF' } : { color: '' }}
                    onClick={() => {
                        handlePositionShow();
                    }}
                />
                <BsEmojiSmileFill onClick={handleEmojiPickerHideShow} />
            </div>
            <div className={styles.emojiPicker}>
                {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
            </div>
        </div>
    );
}
