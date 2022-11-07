import styles from './ChatPanel.module.css';
import { motion } from 'framer-motion';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import IncomingMessage from './MessagePanel/Inbox/IncomingMessage';
import Room from './MessagePanel/Room/Room';
import { RiCloseFill } from 'react-icons/ri';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import useSocket, { receiveUsername, recieveMessageByRoomRoute } from './Service/useSocket';
import axios from 'axios';
import { Message } from './Model/MessageModel';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { targetData } from '../../utils/state/tradeDataSlice';
import { useMoralis } from 'react-moralis';
import ChatButton from '../../App/components/Chat/ChatButton/ChatButton';
import { MdClose, MdOpenInFull } from 'react-icons/md';
import { Link } from 'react-router-dom';
import useChatApi from './Service/ChatApi';

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
    limitTick: number;
    advancedLowTick: number;
    advancedHighTick: number;
    simpleRangeWidth: number;
    slippageTolerance: number;
    activeChartPeriod: number;
    targetData: targetData[];
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
    const [room, setRoom] = useState('Global');
    const [showChatPanel, setShowChatPanel] = useState(true);
    const [selected, setSelected] = useState('');
    const { user, account, enableWeb3, isWeb3Enabled, isAuthenticated } = useMoralis();
    const [currentUser, setCurrentUser] = useState('');
    const [name, setName] = useState('');

    const wrapperStyleFull = styles.chat_wrapper_full;
    const wrapperStyle = props.chatStatus ? styles.chat_wrapper_active : styles.chat_wrapper;

    useEffect(() => {
        props.isFullScreen ? setShowChatPanel(true) : null;
    }, [props.isFullScreen]);

    const [scrollBottomControl, setScrollBottomControl] = useState(true);

    const { messages, getMsg } = useSocket(room);

    const { getID, getNameOrWallet } = useChatApi();

    useEffect(() => {
        // 👇️ scroll to bottom every time messages change
        messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        getMsg();
    }, [room]);

    useEffect(() => {
        getMsg();
    }, []);

    useEffect(() => {
        getID().then((result: any) => {
            setCurrentUser(result.userData._id);
            console.log(currentUser);
            setName(result.userData.ensName);
        });
    }, [props.chatStatus]);

    useEffect(() => {
        getID().then((result: any) => {
            setCurrentUser(result.userData._id);
            console.log(currentUser);
            setName(result.userData.ensName);
        });
    }, []);

    function handleCloseChatPanel() {
        props.setChatStatus(false);
    }

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
        <div className={styles.modal_header}>
            <h2 className={styles.modal_title}>Chat</h2>
            {props.isFullScreen ? (
                <></>
            ) : (
                <Link target='_blank' to='/app/chat'>
                    <MdOpenInFull size={18} className={styles.open_full_button} />
                </Link>
            )}

            {props.isFullScreen ? (
                <></>
            ) : (
                <RiCloseFill
                    size={27}
                    className={styles.close_button}
                    onClick={() => handleCloseChatPanel()}
                />
            )}
        </div>
    );

    function getName(item: any) {
        if (item.ensName === 'defaultValue') {
            return item.walletID;
        } else {
            return item.ensName;
        }
    }

    const messageList = (
        <>
            {messages &&
                messages.map((item) => (
                    <div key={item._id} style={{ width: '90%', marginBottom: 4 }}>
                        {item.sender === currentUser && currentUser !== undefined ? (
                            <>
                                <DividerDark changeColor addMarginTop addMarginBottom />
                                <SentMessagePanel message={item} />
                            </>
                        ) : (
                            <IncomingMessage message={item} name={getName(item)} />
                        )}
                    </div>
                ))}
        </>
    );

    return (
        <>
            {props.isFullScreen ? (
                <></>
            ) : (
                <ChatButton chatStatus={props.chatStatus} setChatStatus={props.setChatStatus} />
            )}

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
                    <div className={styles.main_body}></div>
                    <div
                        className={`
                            ${props.isFullScreen ? wrapperStyleFull : styles.modal_body}
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
                                currentUser={currentUser}
                                message={messages[0]}
                                room={
                                    room === 'Current Pool'
                                        ? currentPool.baseToken.symbol +
                                          currentPool.quoteToken.symbol
                                        : room
                                }
                                ensName={name}
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
