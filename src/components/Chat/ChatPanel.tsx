import styles from './ChatPanel.module.css';
import { motion } from 'framer-motion';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import Room from './MessagePanel/Room/Room';
import { RiCloseFill, RiArrowDownSLine } from 'react-icons/ri';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import useSocket from './Service/useSocket';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { targetData } from '../../utils/state/tradeDataSlice';
import ChatButton from '../../App/components/Chat/ChatButton/ChatButton';
import { MdOpenInFull } from 'react-icons/md';
import { Link, useParams } from 'react-router-dom';
import useChatApi from './Service/ChatApi';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { BsChatLeftFill } from 'react-icons/bs';
import { useAccount } from 'wagmi';
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
    isFullScreen: boolean;
    setChatStatus: Dispatch<SetStateAction<boolean>>;
    fullScreen?: boolean;
    userImageData: string[];
}

export default function ChatPanel(props: ChatProps) {
    const { favePools, currentPool } = props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageEnd = useRef<any>(null);
    const [room, setRoom] = useState('Global');
    const { address } = useAccount();
    const [currentUser, setCurrentUser] = useState<string | undefined>(undefined);
    const [name, setName] = useState('');
    const [scrollDirection, setScrollDirection] = useState(String);
    const wrapperStyleFull = styles.chat_wrapper_full;
    const [notification, setNotification] = useState(0);

    const { messages, getMsg, lastMessage, messageUser } = useSocket(room);

    const { getID } = useChatApi();
    const userData = useAppSelector((state) => state.userData);
    const isUserLoggedIn = userData.isLoggedIn;
    const resolvedAddress = userData.resolvedAddress;

    const secondaryImageData = userData.secondaryImageData || '';

    const { address: addressFromParams } = useParams();

    const connectedAccountActive =
        !addressFromParams || resolvedAddress?.toLowerCase() === address?.toLowerCase();

    useEffect(() => {
        if (scrollDirection === 'Scroll Up') {
            if (messageUser !== currentUser) {
                if (
                    lastMessage?.mentionedName.slice(1) === name ||
                    lastMessage?.mentionedName.slice(1) === address
                ) {
                    setNotification((notification) => notification + 1);
                }
            } else if (messageUser === currentUser) {
                const timer = setTimeout(() => {
                    messageEnd.current?.scrollTo(
                        messageEnd.current?.scrollHeight,
                        messageEnd.current?.scrollHeight,
                    );
                }, 100);

                setNotification(0);
                return () => clearTimeout(timer);
            }
        } else {
            messageEnd.current?.scrollTo(
                messageEnd.current?.scrollHeight,
                messageEnd.current?.scrollHeight,
            );
        }
    }, [lastMessage]);

    useEffect(() => {
        if (address) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getID().then((result: any) => {
                setCurrentUser(result.userData._id);
                setName(
                    result.userData.ensName == 'defaultValue'
                        ? result.userData.walletID
                        : result.userData.ensName,
                );
            });
        }
    }, [address, props.chatStatus, props.isFullScreen]);

    useEffect(() => {
        if (address) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getID().then((result: any) => {
                setCurrentUser(result.userData._id);
                setName(
                    result.userData.ensName == 'defaultValue'
                        ? result.userData.walletID
                        : result.userData.ensName,
                );
            });

            getMsg();
        }
    }, [address]);

    useEffect(() => {
        isCurrentUser();
    }, [isUserLoggedIn]);

    useEffect(() => {
        scrollToBottom();
        setNotification(0);

        getMsg();
    }, [room]);

    // function handleCloseChatPanel() {
    //     props.setChatStatus(false);
    // }

    const scrollToBottomButton = async () => {
        messageEnd.current?.scrollTo(
            messageEnd.current?.scrollHeight,
            messageEnd.current?.scrollHeight,
        );
    };

    const scrollToBottom = async () => {
        const timer = setTimeout(() => {
            messageEnd.current?.scrollTo(
                messageEnd.current?.scrollHeight,
                messageEnd.current?.scrollHeight,
            );
        }, 1000);
        return () => clearTimeout(timer);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleScroll = (e: any) => {
        if (e.target.scrollTop === 0 || e.target.scrollTop === 1) {
            setNotification(0);
            setScrollDirection('Scroll Down');
        } else {
            setScrollDirection('Scroll Up');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleWheel = (e: any) => {
        if (
            e.nativeEvent.wheelDelta > 0 &&
            messageEnd.current?.scrollHeight !== messageEnd.current?.scrollHeight
        ) {
            setScrollDirection('Scroll Up');
        }
    };

    const header = (
        <div className={styles.modal_header}>
            <h2 className={styles.modal_title}>Chat</h2>
            {props.isFullScreen ? (
                <></>
            ) : (
                <Link target='_blank' to='/app/chat'>
                    <MdOpenInFull
                        size={18}
                        className={styles.open_full_button}
                        onClick={() => props.setChatStatus(true)}
                    />
                </Link>
            )}
            {props.isFullScreen ? (
                <></>
            ) : (
                <RiCloseFill
                    size={27}
                    className={styles.close_button}
                    onClick={() => props.setChatStatus(false)}
                />
            )}
        </div>
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function isCurrentUser() {
        if (!address) {
            return setCurrentUser(undefined);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getID().then((result: any) => {
                setCurrentUser(result.userData._id);
                setName(
                    result.userData.ensName == 'defaultValue'
                        ? result.userData.walletID
                        : result.userData.ensName,
                );
            });
            return currentUser;
        }
    }

    const messageList = (
        <>
            {messages &&
                messages.map((item) => (
                    <div key={item._id} style={{ width: '90%', marginBottom: 4 }}>
                        <SentMessagePanel
                            message={item}
                            name={name}
                            isCurrentUser={item.sender === currentUser}
                            currentUser={currentUser}
                            userImageData={
                                connectedAccountActive ? props.userImageData : secondaryImageData
                            }
                            resolvedAddress={resolvedAddress}
                            connectedAccountActive={address}
                        />
                        <hr></hr>
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
                    transition={{ duration: 0.3 }}
                    className={`
                    ${styles.main_body}
                    `}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={(e: any) => e.stopPropagation()}
                >
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
                                isFullScreen={props.isFullScreen}
                                room={room}
                            />

                            <div style={{ width: '90%' }}>
                                <DividerDark changeColor addMarginTop addMarginBottom />
                            </div>

                            <div
                                ref={messageEnd}
                                className={styles.scrollable_div}
                                onScroll={handleScroll}
                                onWheel={handleWheel}
                                id='chatmessage'
                            >
                                {messageList}
                            </div>
                            <div className={styles.chat_notification}>
                                {notification > 0 && scrollDirection === 'Scroll Up' ? (
                                    <div className={styles.chat_notification}>
                                        <span onClick={() => scrollToBottomButton()}>
                                            <BsChatLeftFill size={25} color='#7371fc' />
                                            <span className={styles.text}>{notification}</span>
                                        </span>
                                        <RiArrowDownSLine
                                            role='button'
                                            size={27}
                                            color='#7371fc'
                                            onClick={() => scrollToBottomButton()}
                                        />
                                    </div>
                                ) : scrollDirection === 'Scroll Up' && notification <= 0 ? (
                                    <RiArrowDownSLine
                                        size={27}
                                        color='#7371fc'
                                        onClick={() => scrollToBottomButton()}
                                    />
                                ) : (
                                    ''
                                )}
                            </div>

                            <MessageInput
                                currentUser={currentUser as string}
                                message={messages[0]}
                                room={
                                    room === 'Current Pool'
                                        ? currentPool.baseToken.symbol +
                                          currentPool.quoteToken.symbol
                                        : room
                                }
                                ensName={name}
                            />
                            <div id='thelastmessage'></div>
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
