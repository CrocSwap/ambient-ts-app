import styles from './ChatPanel.module.css';
import { motion } from 'framer-motion';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import IncomingMessage from './MessagePanel/Inbox/IncomingMessage';
import Room from './MessagePanel/Room/Room';
import { RiCloseFill } from 'react-icons/ri';
import { useEffect, useRef } from 'react';

interface ChatProps {
    chatStatus: boolean;
    onClose: () => void;
}

export default function ChatPanel(props: ChatProps) {
    const messageEnd = useRef<HTMLInputElement | null>(null);

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

                        <MessageInput />

                        <div className={styles.scrollable_div} ref={messageEnd}>
                            <div style={{ width: '90%' }}>
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
                            </div>
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
