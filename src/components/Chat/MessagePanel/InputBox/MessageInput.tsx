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
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
import PositionBox from '../PositionBox/PositionBox';

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
        console.log(_socket.id);
    }, [_socket]);

    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { user, account, enableWeb3, isWeb3Enabled, isAuthenticated } = useMoralis();

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
            <PositionBox message={message} isInput={true} />

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
