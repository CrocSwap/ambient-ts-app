import styles from './ChatPanel.module.css';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import Room from './MessagePanel/Room/Room';
import { RiArrowDownSLine } from 'react-icons/ri';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import useSocket from './Service/useSocket';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { targetData } from '../../utils/state/tradeDataSlice';
import { TbTableExport } from 'react-icons/tb';
import { useParams } from 'react-router-dom';
import useChatApi from './Service/ChatApi';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { BsChatLeftFill } from 'react-icons/bs';
import { useAccount, useEnsName } from 'wagmi';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import FullChat from '../../App/components/Chat/FullChat/FullChat';
import trimString from '../../utils/functions/trimString';

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
    appPage?: boolean;
    username?: string | undefined | null;
}

export default function ChatPanel(props: ChatProps) {
    const { favePools, currentPool, setChatStatus } = props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const navigate = useNavigate();
    // eslint-disable-next-line
    const messageEnd = useRef<any>(null);
    const [room, setRoom] = useState('Global');
    const [moderator, setModerator] = useState(false);
    const [isCurrentPool, setIsCurrentPool] = useState(false);
    const [showCurrentPoolButton, setShowCurrentPoolButton] = useState(true);

    const { address } = useAccount();
    const { data: ens } = useEnsName({ address });
    const [ensName, setEnsName] = useState('');
    const [currentUser, setCurrentUser] = useState<string | undefined>(undefined);
    const [scrollDirection, setScrollDirection] = useState(String);
    const [notification, setNotification] = useState(0);

    const { messages, getMsg, lastMessage, messageUser } = useSocket(room);

    const { getID, updateUser, updateMessageUser, saveUser, deleteMessage } = useChatApi();
    const userData = useAppSelector((state) => state.userData);
    const isUserLoggedIn = userData.isLoggedIn;
    const resolvedAddress = userData.resolvedAddress;

    const secondaryImageData = userData.secondaryImageData || '';

    const { address: addressFromParams } = useParams();

    const connectedAccountActive =
        !addressFromParams || resolvedAddress?.toLowerCase() === address?.toLowerCase();

    const moderators = [
        {
            id: '63ea229604023acecd110f8f',
            name: 'Umay',
        },
        {
            id: '63e69c3404023acecd110547',
            name: 'Benjamin',
        },
    ];

    // eslint-disable-next-line
    function closeOnEscapeKeyDown(e: any) {
        if ((e.charCode || e.keyCode) === 27) setChatStatus(false);
    }

    // eslint-disable-next-line
    function openChatPanel(e: any) {
        if (e.keyCode === 67 && e.ctrlKey && e.altKey) {
            setChatStatus(!props.chatStatus);
        }
    }

    useEffect(() => {
        document.body.addEventListener('keydown', closeOnEscapeKeyDown);
        document.body.addEventListener('keydown', openChatPanel);
        return function cleanUp() {
            document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
        };
    });

    useEffect(() => {
        if (scrollDirection === 'Scroll Up') {
            if (messageUser !== currentUser) {
                if (
                    lastMessage?.mentionedName === ensName ||
                    lastMessage?.mentionedName === address
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
        setScrollDirection('Scroll Down');
        if (address) {
            if (ens === null || ens === undefined) {
                setEnsName('defaultValue');
            } else {
                setEnsName(ens);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getID().then((result: any) => {
                if (result.status === 'Not OK') {
                    // eslint-disable-next-line
                    saveUser(address, ensName).then((result: any) => {
                        setCurrentUser(result.userData._id);
                        return result;
                    });
                } else {
                    currentUser === moderators[0].id || currentUser === moderators[1].id
                        ? setModerator(true)
                        : setModerator(false);
                    setCurrentUser(result.userData._id);
                    if (result.userData.ensName !== ensName) {
                        // eslint-disable-next-line
                        updateUser(currentUser as string, ensName).then((result: any) => {
                            if (result.status === 'OK') {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                updateMessageUser(currentUser as string, ensName).then(
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (result: any) => {
                                        return result;
                                    },
                                );
                            }
                        });
                    }
                }
            });
        } else {
            setCurrentUser(undefined);
        }
    }, [address, props.chatStatus, props.isFullScreen]);

    useEffect(() => {
        scrollToBottom();
        setNotification(0);
        getMsg();
    }, [room]);

    // useEffect(() => {
    //     getMsg();
    // }, [deleteMessage]);

    function handleCloseChatPanel() {
        props.setChatStatus(false);
    }

    const scrollToBottomButton = async () => {
        messageEnd.current?.scrollTo(
            messageEnd.current?.scrollHeight,
            messageEnd.current?.scrollHeight,
        );
        setScrollDirection('Scroll Down');
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
        if (0 <= e.target.scrollTop) {
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
        if (0 <= messageEnd.current?.scrollTop) {
            setScrollDirection('Scroll Down');
        }
    };

    // const handleFullScreenRedirect = () => {
    //     navigate('/app/chat');
    //     props.setChatStatus(true);
    // };

    const header = (
        <div className={styles.chat_header} onClick={() => setChatStatus(!props.chatStatus)}>
            <h2 className={styles.chat_title}>Chat</h2>
            <section style={{ paddingRight: '10px' }}>
                {props.isFullScreen || !props.chatStatus ? (
                    <></>
                ) : (
                    <TbTableExport
                        size={18}
                        className={styles.open_full_button}
                        onClick={() => window.open('/chat')}
                    />
                )}
                {props.isFullScreen || !props.chatStatus ? (
                    <></>
                ) : (
                    <IoIosArrowDown
                        size={22}
                        className={styles.close_button}
                        onClick={() => handleCloseChatPanel()}
                    />
                )}
                {!props.chatStatus && <IoIosArrowUp size={22} />}
            </section>
        </div>
    );

    const messageList = (
        <div
            ref={messageEnd}
            className={styles.scrollable_div}
            onScroll={handleScroll}
            onWheel={handleWheel}
            id='chatmessage'
        >
            {messages &&
                messages.map((item) => (
                    <div key={item._id} style={{ width: '90%', marginBottom: 4 }}>
                        <SentMessagePanel
                            isUserLoggedIn={isUserLoggedIn as boolean}
                            message={item}
                            ensName={ensName}
                            isCurrentUser={item.sender === currentUser}
                            currentUser={currentUser}
                            userImageData={
                                connectedAccountActive ? props.userImageData : secondaryImageData
                            }
                            resolvedAddress={resolvedAddress}
                            connectedAccountActive={address}
                            moderator={moderator}
                        />
                        <hr />
                    </div>
                ))}
        </div>
    );

    const chatNotification = (
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
    );

    const messageInput = (
        <MessageInput
            currentUser={currentUser as string}
            message={messages[0]}
            room={
                room === 'Current Pool'
                    ? currentPool.baseToken.symbol + '/' + currentPool.quoteToken.symbol
                    : room
            }
            ensName={ensName}
        />
    );

    const contentHeight = props.chatStatus ? '479px' : '30px';
    if (props.appPage)
        return (
            <FullChat
                messageList={messageList}
                chatNotification={chatNotification}
                messageInput={messageInput}
                room={room}
                userName={
                    ens === null || ens === ''
                        ? trimString(address as string, 6, 0, '…')
                        : (ens as string)
                }
                setRoom={setRoom}
                setIsCurrentPool={setIsCurrentPool}
                showCurrentPoolButton={showCurrentPoolButton}
                setShowCurrentPoolButton={setShowCurrentPoolButton}
                currentPool={currentPool}
                favePools={favePools}
            />
        );

    return (
        <div
            className={styles.main_container}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={(e: any) => e.stopPropagation()}
        >
            <div className={styles.modal_body} style={{ height: contentHeight, width: '100%' }}>
                <div className={styles.chat_body}>
                    {header}

                    <Room
                        favePools={favePools}
                        selectedRoom={room}
                        setRoom={setRoom}
                        currentPool={currentPool}
                        isFullScreen={props.isFullScreen}
                        room={room}
                        setIsCurrentPool={setIsCurrentPool}
                        isCurrentPool={isCurrentPool}
                        showCurrentPoolButton={showCurrentPoolButton}
                        setShowCurrentPoolButton={setShowCurrentPoolButton}
                    />

                    <DividerDark changeColor addMarginTop addMarginBottom />

                    {messageList}

                    {chatNotification}

                    {messageInput}
                    <div id='thelastmessage' />
                </div>
            </div>
        </div>
    );
}
