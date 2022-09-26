import styles from './ChatPanel.module.css';
import { motion } from 'framer-motion';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import IncomingMessage from './MessagePanel/Inbox/IncomingMessage';
import Room from './MessagePanel/Room/Room';
import { RiCloseFill } from 'react-icons/ri';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { receiveUsername, recieveMessageByRoomRoute, socket } from './Service/chatApi';
import axios from 'axios';
import { Message } from './Model/MessageModel';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { targetData } from '../../utils/state/tradeDataSlice';

interface currentPoolInfo {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    didUserFlipDenom: boolean;
    isDenomBase: boolean;
    advancedMode: boolean;
    isTokenAPrimary: boolean;
    primaryQuantity: string;
    isTokenAPrimaryRange: boolean;
    primaryQuantityRange: string;
    limitPrice: string;
    advancedLowTick: number;
    advancedHighTick: number;
    simpleRangeWidth: number;
    slippageTolerance: number;
    activeChartPeriod: number;
    targetData: targetData[];
    pinnedMaxPriceDisplayTruncated: number;
    pinnedMinPriceDisplayTruncated: number;
}

interface ChatProps {
    chatStatus: boolean;
    onClose: () => void;
    favePools: PoolIF[];
    currentPool: currentPoolInfo;
    isFullScreen?: boolean;
    setChatStatus: Dispatch<SetStateAction<boolean>>;
}

export default function ChatPanel(props: ChatProps) {
    const { favePools, currentPool } = props;
    const messageEnd = useRef<HTMLInputElement | null>(null);
    const _socket = socket;
    const [messages, setMessages] = useState<Message[]>([]);
    const [room, setRoom] = useState('Global');
    const [showChatPanel, setShowChatPanel] = useState(true);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        props.isFullScreen ? setShowChatPanel(true) : null;
    }, [props.isFullScreen]);

    const [scrollBottomControl, setScrollBottomControl] = useState(true);

    useEffect(() => {
        _socket.connect();
    }, [_socket]);
    const currentUser = '62f24f3ff40188d467c532e8';

    useEffect(() => {
        _socket.on('msg-recieve', (mostRecentMessages) => {
            setMessages([...mostRecentMessages]);
            if (scrollBottomControl) {
                scrollToBottom();
            }
        });
    }, [messages]);

    useEffect(() => {
        setRoomSocket();
    }, [room, currentPool, props.chatStatus]);

    const setRoomSocket = async () => {
        _socket.emit('listen', {
            room:
                room === 'Current Pool'
                    ? currentPool.baseToken.symbol + currentPool.quoteToken.symbol
                    : room,
        });
    };

    function handleCloseChatPanel() {
        console.log(props.chatStatus);
        props.setChatStatus(false);
    }

    const getMentionedMessage = async () => {
        const myArray = messages[0].message.split('@');
        const word = myArray[1];
        // const mentionedMessage = await axios.get(receiveUsername+'/'+word
    };

    const scrollToBottom = () => {
        messageEnd.current?.scrollTo(0, messageEnd.current?.scrollHeight);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleScroll = (e: any) => {
        setScrollBottomControl(
            e.target.clientHeight - 10 <
                e.target.scrollHeight - e.target.scrollTop <
                e.target.clientHeight,
        );
    };

    useEffect(() => {
        scrollToBottom();
    }, [props.chatStatus, room]);

    const header = (
        <header className={styles.modal_header}>
            <h2 className={styles.modal_title}>Chat</h2>
            <RiCloseFill
                size={27}
                className={styles.close_button}
                onClick={() => handleCloseChatPanel()}
            />
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
                    ${styles.main_body}
                    `}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={(e: any) => e.stopPropagation()}
                >
                    <div
                        className={`
                            ${styles.modal_body}
                        `}
                    >
                        <div className={styles.chat_body}>
                            {header}

                            <Room
                                favePools={favePools}
                                selectedRoom={room}
                                setRoom={setRoom}
                                currentPool={currentPool}
                            />

                            <div style={{ width: '90%' }}>
                                <DividerDark changeColor addMarginTop addMarginBottom />
                            </div>

                            <MessageInput
                                message={messages[0]}
                                room={
                                    room === 'Current Pool'
                                        ? currentPool.baseToken.symbol +
                                          currentPool.quoteToken.symbol
                                        : room
                                }
                            />

                            <div
                                className={styles.scrollable_div}
                                ref={messageEnd}
                                onScroll={handleScroll}
                            >
                                {messages.map((item) => (
                                    <div key={item._id} style={{ width: '90%', marginBottom: 4 }}>
                                        {item.sender === currentUser ? (
                                            <>
                                                <DividerDark
                                                    changeColor
                                                    addMarginTop
                                                    addMarginBottom
                                                />
                                                <SentMessagePanel message={item} />
                                            </>
                                        ) : (
                                            <IncomingMessage message={item} />
                                        )}
                                    </div>
                                ))}
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
