/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMoralis } from 'react-moralis';
import {
    receiveUsername,
    // host,
    sendMessageRoute,
    socket,
} from '../../Service/chatApi';
import axios from 'axios';
import { BsSlashSquare, BsEmojiSmileFill } from 'react-icons/bs';
import { Message } from '../../Model/MessageModel';
import Picker from 'emoji-picker-react';
import styles from './MessageInput.module.css';
import { useEffect, useState } from 'react';

interface MessageInputProps {
    message: Message;
    room: string;
}

interface PortfolioBannerPropsIF {
    ensName: string;
    activeAccount: string;
    imageData: string[];
    resolvedAddress: string;
}

export default function MessageInput(props: MessageInputProps, prop: PortfolioBannerPropsIF) {
    const _socket = socket;

    useEffect(() => {
        _socket.connect();
    }, [_socket]);

    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { user, account, enableWeb3, isWeb3Enabled, isAuthenticated } = useMoralis();
    const [positionIsActive, setPositionIsActive] = useState(false);

    const handleEmojiClick = (event: any, emoji: any) => {
        let msg = message;
        msg += emoji.emoji;
        setMessage(msg);
    };

    const handleEmojiPickerHideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const dontShowEmojiPanel = () => {
        setShowEmojiPicker(false);
    };

    function handlePositionShow() {
        /* setShowPosition(!showPosition);*/
        setPositionIsActive(!positionIsActive);
    }

    function handleMessageWithPosition() {
        setMessage(positionIsActive ? '/position 0xaBcD...1234      ' + message : '');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            handleSendMsg(e.target.value);
            setMessage('');
            dontShowEmojiPanel();
        }
    };

    const handleSendMsg = async (msg: string) => {
        _socket.emit('send-msg', {
            from: '62f24f3ff40188d467c532e8',
            to: '62fa389c897f9778e2eb863f',
            message: msg,
            roomInfo: props.room,
        });
    };

    const onChangeMessage = async (e: any) => {
        setMessage(e.target.value);
    };

    const onChangeMessageWithMention = async (e: any) => {
        const value = e.target.value;
        if (value.includes('@')) {
            let response;
            const myArray = value.split('@');
            const word = myArray[1];
            if (word.length > 0) {
                response = await axios
                    .get(receiveUsername + '/' + word)
                    .then((response) => {
                        console.log({ response });
                        setMessage(value);
                    })
                    .catch((exception) => {
                        console.log(exception);
                    });
            }
        }
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
                    className={!positionIsActive ? styles.input_text : styles.input_text_position}
                    onKeyDown={_handleKeyDown}
                    value={message}
                    onChange={onChangeMessage}
                />
                <BsSlashSquare
                    style={positionIsActive ? { color: '#5FA2FF' } : { color: '' }}
                    onClick={() => {
                        handlePositionShow();
                        handleMessageWithPosition();
                    }}
                />
                <BsEmojiSmileFill onClick={handleEmojiPickerHideShow} />
            </div>
            {showEmojiPicker && (
                <div className={styles.emojiPicker}>
                    <Picker
                        pickerStyle={{ width: '100%', height: '95%' }}
                        onEmojiClick={handleEmojiClick}
                    />
                </div>
            )}
        </div>
    );
}
