import styles from './ChatPanel.module.css';
import { motion } from 'framer-motion';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import IncomingMessage from './MessagePanel/Inbox/IncomingMessage';
import Room from './MessagePanel/Room/Room';
import { RiCloseFill } from 'react-icons/ri';
import { useEffect, useRef, useState } from 'react';
import { recieveMessageRoute, socket } from './Service/chatApi';
import axios from 'axios';
import { Message } from './Model/MessageModel';
import { PoolIF } from '../../utils/interfaces/PoolIF';

interface ChatProps {
    chatStatus: boolean;
    onClose: () => void;
    favePools: PoolIF[];
}

export default function ChatPanel(props: ChatProps) {
    const { favePools } = props;
    const messageEnd = useRef<HTMLInputElement | null>(null);
    const _socket = socket;
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        console.log({ favePools });
    }, [favePools]);

    // const messages = [
    //   {  message: 'dasd' ,
    //     users: ['',''],
    //     sender:'5'},
    //     {  message: 'dasd' ,
    //     users: ['',''],
    //     sender:'6'}
    // ]

    const currentUser = '62f24f3ff40188d467c532e8';

    useEffect(() => {
        _socket.on('msg-recieve', (data) => {
            console.error('dataaa', data);
        });
        getMsg();
        scrollToBottom();
    }, [props.chatStatus, messages]);

    const getMsg = async () => {
        const response = await axios.get(recieveMessageRoute);
        setMessages(response.data);
    };

    const scrollToBottom = () => {
        messageEnd.current?.scrollTo({ top: messageEnd.current?.scrollHeight });
    };

    useEffect(() => {
        scrollToBottom();
    }, [props.chatStatus]);

    const header = (
        <header className={styles.modal_header}>
            <h2 className={styles.modal_title}>Chat</h2>
            <RiCloseFill size={27} className={styles.close_button} onClick={props.onClose} />
        </header>
    );

    return (
        <>
            {props.chatStatus ? (
                //  <div className={styles.outside_modal}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`
                            ${styles.modal_body}
                        `}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.chat_body}>
                        {header}
                        <Room />
                        <div style={{ width: '90%' }}>
                            <DividerDark changeColor addMarginTop addMarginBottom />
                        </div>

                        <MessageInput message={messages[0]} />

                        <div className={styles.scrollable_div} ref={messageEnd}>
                            {/* 
                            {messages.map((item:Message) => {
                              <div style={{ width: '90%' }}>
                                </div>                            })} */}
                            {messages.map((item) => (
                                <div key={item.sender} style={{ width: '90%', marginBottom: 4 }}>
                                    {item.sender === currentUser ? (
                                        <>
                                            <DividerDark changeColor addMarginTop addMarginBottom />
                                            <SentMessagePanel message={item} />
                                        </>
                                    ) : (
                                        <IncomingMessage message={item} />
                                    )}
                                </div>
                            ))}
                            {/* <div style={{ width: '90%' }}>
                                <DividerDark changeColor addMarginTop addMarginBottom />
                                <SentMessagePanel message='message blah blah blah blah blah blah blah blah blah blah' />
                            </div>
                            <div style={{ width: '90%' }}>
                                <IncomingMessage message='message blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah' />
                            </div>

                            <div style={{ width: '90%' }}>
                                <DividerDark changeColor addMarginTop addMarginBottom />
                                <SentMessagePanel message='message blah blah blah blah blah blah blah blah blah blah' />
                            </div>

                            <div style={{ width: '90%' }}>
                                <DividerDark changeColor addMarginTop addMarginBottom />
                                <SentMessagePanel message='message blah blah blah blah blah blah blah blah blah blah' />
                            </div>

                            <div style={{ width: '90%' }}>
                                <IncomingMessage message='message' />
                            </div>

                            <div style={{ width: '90%' }}>
                                <DividerDark changeColor addMarginTop addMarginBottom />
                                <SentMessagePanel message='message blah blah blah blah blah blah blah blah blah blah' />
                            </div> */}
                        </div>
                    </div>
                </motion.div>
            ) : (
                // </div>
                <></>
            )}
        </>
    );
}
