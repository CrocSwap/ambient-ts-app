import styles from './ChatPanel.module.css';
import { motion } from 'framer-motion';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import IncomingMessage from './MessagePanel/Inbox/IncomingMessage';
import Room from './MessagePanel/Room/Room';
import { RiCloseFill } from 'react-icons/ri';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { receiveUsername, recieveMessageByRoomRoute } from './Service/chatApi';
import axios from 'axios';
import { Message } from './Model/MessageModel';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { targetData } from '../../utils/state/tradeDataSlice';
import { useMoralis } from 'react-moralis';
import { id } from 'ethers/lib/utils';
import { io } from 'socket.io-client';

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
    const [messages, setMessages] = useState<Message[]>([]);
    const [room, setRoom] = useState('Global');
    const [showChatPanel, setShowChatPanel] = useState(true);
    const [selected, setSelected] = useState('');
    const { user, account, enableWeb3, isWeb3Enabled, isAuthenticated } = useMoralis();
    const [currentUser, setCurrentUser] = useState('');

    useEffect(() => {
        props.isFullScreen ? setShowChatPanel(true) : null;
    }, [props.isFullScreen]);

    const [scrollBottomControl, setScrollBottomControl] = useState(true);

    useEffect(() => {
        const result = getID();
        result.then((res) => {
            setCurrentUser(res._id);
        });
    }, []);

    async function getID() {
        const response = await fetch('http://localhost:5000/api/auth/getUserByAccount/' + account, {
            method: 'GET',
        });
        const data = await response.json();
        if (data.status === 'OK') {
            return data;
        } else {
            console.log(data);
        }
    }

    const socket = io('http://localhost:5000');

    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected ' + socket.id);
        });

        return () => {
            // socket.disconnect();
            console.log('Disconnected' + socket.id);
            socket.off('connect');
            //     // socket.off('disconnect');
        };
    }, []);

    /*  useEffect(() => {
        _socket.on('msg-recieve', (mostRecentMessages) => {
            setMessages([...mostRecentMessages].reverse());
            // if (scrollBottomControl) {
            scrollToBottom();
            // }
        });
    }, []); */

    //  const [socket] =useState<any>(io('http://localhost:5001'));

    async function getMsg() {
        await socket.on('msg-recieve', (data: any) => {
            console.error('data', data);
            setMessages(() => [messages, ...data]);
        });
    }
    useEffect(() => {
        getMsg();
        /*  return () => {
            socket.disconnect();
          } */
    }, [socket]);

    useEffect(() => {
        // 👇️ scroll to bottom every time messages change
        messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        socket.emit('join_room', {
            room:
                room === 'Current Pool'
                    ? currentPool.baseToken.symbol + currentPool.quoteToken.symbol
                    : room,
        });
        return () => {
            socket.off('join_room');
        };
    }, [room, currentPool, props.chatStatus]);

    useEffect(() => {
        socket.emit('bye', {
            room,
        });
    }, [props.chatStatus]);

    function handleCloseChatPanel() {
        props.setChatStatus(false);
    }

    const getMentionedMessage = async () => {
        const myArray = messages[0].message.split('@');
        const word = myArray[1];
        // const mentionedMessage = await axios.get(receiveUsername+'/'+word
    };

    const scrollTop = () => {
        messageEnd.current?.scrollTo(
            messageEnd.current?.scrollHeight,
            messageEnd.current?.scrollHeight,
        );
    };

    const scrollToBottom = () => {
        messageEnd.current?.scrollTo(
            messageEnd.current?.scrollHeight,
            messageEnd.current?.scrollHeight,
        );
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
    }, [props.chatStatus, room, messages]);

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

    // const [isFinish, setIsFinish] = useState(false);

    // useEffect(() => {
    //     setTimeout(async()=>{
    //        await setIsFinish(true);
    //         scrollToBottom();
    //     },1000);
    // }, []);

    const messageList = (
        <>
            {messages.map((item) => (
                <div key={item._id} style={{ width: '90%', marginBottom: 4 }}>
                    {item.sender === currentUser && currentUser !== undefined ? (
                        <>
                            <DividerDark changeColor addMarginTop addMarginBottom />
                            <SentMessagePanel message={item} />
                        </>
                    ) : (
                        <IncomingMessage message={item} />
                    )}
                </div>
            ))}
        </>
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

                            <div
                                ref={messageEnd}
                                className={styles.scrollable_div}
                                onScroll={handleScroll}
                                id='chatmessage'
                            >
                                {messageList}
                            </div>
                            <MessageInput
                                socket={socket}
                                message={messages[0]}
                                room={
                                    room === 'Current Pool'
                                        ? currentPool.baseToken.symbol +
                                          currentPool.quoteToken.symbol
                                        : room
                                }
                            />
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
