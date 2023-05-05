import styles from './ChatPanel.module.css';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import Room from './MessagePanel/Room/Room';
import { RiArrowDownSLine } from 'react-icons/ri';
import { useContext, useEffect, useRef, useState } from 'react';
import useSocket from './Service/useSocket';
import { PoolIF, TokenIF } from '../../utils/interfaces/exports';
import { useParams } from 'react-router-dom';
import useChatApi from './Service/ChatApi';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { BsChatLeftFill } from 'react-icons/bs';
import { useAccount, useEnsName } from 'wagmi';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import FullChat from './FullChat/FullChat';
import trimString from '../../utils/functions/trimString';
import NotFound from '../../pages/NotFound/NotFound';
import { topPoolIF } from '../../App/hooks/useTopPools';
import ExpandChatIcon from '../../assets/images/icons/expand.svg';
import { AppStateContext } from '../../contexts/AppStateContext';

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
    limitTick: number | undefined;
    advancedLowTick: number;
    advancedHighTick: number;
    slippageTolerance: number;
}

interface propsIF {
    onClose: () => void;
    currentPool: currentPoolInfo;
    isFullScreen: boolean;
    fullScreen?: boolean;
    userImageData: string[];
    appPage?: boolean;
    username?: string | null;
    topPools: topPoolIF[];
}

export default function ChatPanel(props: propsIF) {
    const { isFullScreen, currentPool, topPools } = props;
    const {
        chat: {
            isEnabled: isChatEnabled,
            isOpen: isChatOpen,
            setIsOpen: setIsChatOpen,
        },
        subscriptions: { isEnabled: isSubscriptionsEnabled },
    } = useContext(AppStateContext);

    if (!isChatEnabled) return <NotFound />;

    // eslint-disable-next-line
    const messageEnd = useRef<any>(null);
    const [favoritePoolsArray, setFavoritePoolsArray] = useState<PoolIF[]>([]);
    const [room, setRoom] = useState('Global');
    const [moderator, setModerator] = useState(false);
    const [isCurrentPool, setIsCurrentPool] = useState(false);
    const [showCurrentPoolButton, setShowCurrentPoolButton] = useState(true);
    const [userCurrentPool, setUserCurrentPool] = useState('ETH / USDC');
    const { address } = useAccount();
    const { data: ens } = useEnsName({ address });
    const [ensName, setEnsName] = useState('');
    const [currentUser, setCurrentUser] = useState<string | undefined>(
        undefined,
    );
    const [scrollDirection, setScrollDirection] = useState(String);
    const [notification, setNotification] = useState(0);
    const [isMessageDeleted, setIsMessageDeleted] = useState(false);
    const [isScrollToBottomButtonPressed, setIsScrollToBottomButtonPressed] =
        useState(true);

    const { messages, getMsg, lastMessage, messageUser } = useSocket(
        room,
        isSubscriptionsEnabled,
        isChatOpen,
    );

    const { getID, updateUser, updateMessageUser, saveUser } = useChatApi();

    const userData = useAppSelector((state) => state.userData);
    const isUserLoggedIn = userData.isLoggedIn;
    const resolvedAddress = userData.resolvedAddress;

    const secondaryImageData = userData.secondaryImageData || '';

    const { address: addressFromParams } = useParams();

    const connectedAccountActive =
        !addressFromParams ||
        resolvedAddress?.toLowerCase() === address?.toLowerCase();

    // eslint-disable-next-line
    function closeOnEscapeKeyDown(e: any) {
        if ((e.charCode || e.keyCode) === 27) setIsChatOpen(false);
    }

    // eslint-disable-next-line
    function openChatPanel(e: any) {
        if (e.keyCode === 67 && e.ctrlKey && e.altKey) {
            setIsChatOpen(!isChatOpen);
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
                setIsScrollToBottomButtonPressed(true);
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
                    result.userData.isModerator === true
                        ? setModerator(true)
                        : setModerator(false);
                    setCurrentUser(result.userData._id);
                    setUserCurrentPool(result.userData.userCurrentPool);
                    if (result.userData.ensName !== ensName) {
                        updateUser(
                            currentUser as string,
                            ensName,
                            userCurrentPool,
                        ).then(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (result: any) => {
                                if (result.status === 'OK') {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    updateMessageUser(
                                        currentUser as string,
                                        ensName,
                                    ).then(
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        (result: any) => {
                                            return result;
                                        },
                                    );
                                }
                            },
                        );
                    }
                }
            });
        } else {
            setCurrentUser(undefined);
        }
    }, [ens, address, isChatOpen, isFullScreen, setUserCurrentPool]);

    useEffect(() => {
        setIsScrollToBottomButtonPressed(false);
        scrollToBottom();
        setNotification(0);
        getMsg();
    }, [room, isChatOpen === false]);

    useEffect(() => {
        if (isMessageDeleted === true) {
            getMsg();
            window.scrollTo(0, 0);
        }
    }, [isMessageDeleted]);

    useEffect(() => {
        setIsScrollToBottomButtonPressed(false);
        scrollToBottom();
        setNotification(0);
    }, [isChatOpen]);

    function handleCloseChatPanel() {
        setIsChatOpen(false);
    }

    const scrollToBottomButton = async () => {
        setIsScrollToBottomButtonPressed(true);
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
            setIsScrollToBottomButtonPressed(false);
            setScrollDirection('Scroll Down');
        } else {
            setScrollDirection('Scroll Up');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleWheel = (e: any) => {
        if (
            e.nativeEvent.wheelDelta > 0 &&
            messageEnd.current?.scrollHeight !==
                messageEnd.current?.scrollHeight
        ) {
            setScrollDirection('Scroll Up');
            setIsScrollToBottomButtonPressed(false);
        }
        if (0 <= messageEnd.current?.scrollTop) {
            setScrollDirection('Scroll Down');
        }
    };

    const convertCurreny = (currencyPair: string) => {
        if (currencyPair === 'Global') {
            return 'global';
        } else {
            const [currencyA, currencyB] = currencyPair.split('/');
            const lowercaseA = currencyA.trim().toLowerCase();
            const lowercaseB = currencyB.trim().toLowerCase();
            return `${lowercaseA}&${lowercaseB}`;
        }
    };

    const header = (
        <div
            className={styles.chat_header}
            onClick={() => setIsChatOpen(!isChatOpen)}
        >
            <h2 className={styles.chat_title}>Chat</h2>
            <section style={{ paddingRight: '10px' }}>
                {isFullScreen || !isChatOpen ? (
                    <></>
                ) : (
                    <div
                        className={styles.open_full_button}
                        onClick={() =>
                            window.open('/chat/' + convertCurreny(room))
                        }
                        aria-label='Open chat in full screen'
                    >
                        <img
                            src={ExpandChatIcon}
                            alt='Open chat in full screen'
                        />
                    </div>
                )}
                {isFullScreen || !isChatOpen ? (
                    <></>
                ) : (
                    <IoIosArrowDown
                        size={22}
                        className={styles.close_button}
                        onClick={() => handleCloseChatPanel()}
                        role='button'
                        tabIndex={0}
                        aria-label='hide chat button'
                    />
                )}
                {!isChatOpen && (
                    <IoIosArrowUp
                        size={22}
                        role='button'
                        tabIndex={0}
                        aria-label='Open chat button'
                    />
                )}
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
                messages.map((item, i) => (
                    <SentMessagePanel
                        isUserLoggedIn={isUserLoggedIn as boolean}
                        message={item}
                        ensName={ensName}
                        isCurrentUser={item.sender === currentUser}
                        currentUser={currentUser}
                        userImageData={
                            connectedAccountActive
                                ? props.userImageData
                                : secondaryImageData
                        }
                        resolvedAddress={resolvedAddress}
                        connectedAccountActive={address}
                        moderator={moderator}
                        room={room}
                        isMessageDeleted={isMessageDeleted}
                        setIsMessageDeleted={setIsMessageDeleted}
                        previousMessage={
                            i === messages.length - 1 ? null : messages[i + 1]
                        }
                        nextMessage={i === 0 ? null : messages[i - 1]}
                        key={item._id}
                    />
                ))}
        </div>
    );

    const chatNotification = (
        <div className={styles.chat_notification}>
            {notification > 0 &&
            scrollDirection === 'Scroll Up' &&
            !isScrollToBottomButtonPressed ? (
                isFullScreen ? (
                    <div className={styles.chat_notification}>
                        <span
                            style={{ marginTop: '-18px', cursor: 'pointer' }}
                            onClick={() => scrollToBottomButton()}
                        >
                            <BsChatLeftFill
                                size={25}
                                color='#7371fc'
                                style={{ cursor: 'pointer' }}
                            />
                            <span className={styles.text}>{notification}</span>
                        </span>
                        <span style={{ marginTop: '-18px', cursor: 'pointer' }}>
                            <RiArrowDownSLine
                                role='button'
                                size={27}
                                color='#7371fc'
                                onClick={() => scrollToBottomButton()}
                                tabIndex={0}
                                aria-label='Scroll to bottom button'
                                style={{ cursor: 'pointer' }}
                            />
                        </span>
                    </div>
                ) : (
                    <div className={styles.chat_notification}>
                        <span onClick={() => scrollToBottomButton()}>
                            <BsChatLeftFill
                                size={25}
                                color='#7371fc'
                                style={{ cursor: 'pointer' }}
                            />
                            <span className={styles.text}>{notification}</span>
                        </span>
                        <span>
                            <RiArrowDownSLine
                                role='button'
                                size={27}
                                color='#7371fc'
                                onClick={() => scrollToBottomButton()}
                                tabIndex={0}
                                aria-label='Scroll to bottom button'
                                style={{ cursor: 'pointer' }}
                            />
                        </span>
                    </div>
                )
            ) : scrollDirection === 'Scroll Up' &&
              notification <= 0 &&
              !isScrollToBottomButtonPressed ? (
                isFullScreen ? (
                    <span style={{ marginTop: '-18px', cursor: 'pointer' }}>
                        <RiArrowDownSLine
                            role='button'
                            size={27}
                            color='#7371fc'
                            onClick={() => scrollToBottomButton()}
                            tabIndex={0}
                            aria-label='Scroll to bottom button'
                            style={{ cursor: 'pointer' }}
                        />
                    </span>
                ) : (
                    <span>
                        <RiArrowDownSLine
                            role='button'
                            size={27}
                            color='#7371fc'
                            onClick={() => scrollToBottomButton()}
                            tabIndex={0}
                            aria-label='Scroll to bottom button'
                            style={{ cursor: 'pointer' }}
                        />
                    </span>
                )
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
                    ? currentPool.baseToken.symbol +
                      ' / ' +
                      currentPool.quoteToken.symbol
                    : room
            }
            ensName={ensName}
            appPage={props.appPage}
        />
    );

    const contentHeight = isChatOpen ? '479px' : '30px';
    if (props.appPage)
        return (
            <FullChat
                messageList={messageList}
                setIsChatOpen={setIsChatOpen}
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
                userCurrentPool={userCurrentPool}
                favoritePoolsArray={favoritePoolsArray}
                setFavoritePoolsArray={setFavoritePoolsArray}
                topPools={topPools}
            />
        );

    return (
        <div
            className={styles.main_container}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={(e: any) => e.stopPropagation()}
        >
            <div
                className={styles.modal_body}
                style={{ height: contentHeight, width: '100%' }}
            >
                <div className={styles.chat_body}>
                    {header}

                    <Room
                        selectedRoom={room}
                        setRoom={setRoom}
                        currentPool={currentPool}
                        isFullScreen={isFullScreen}
                        room={room}
                        setIsCurrentPool={setIsCurrentPool}
                        isCurrentPool={isCurrentPool}
                        showCurrentPoolButton={showCurrentPoolButton}
                        setShowCurrentPoolButton={setShowCurrentPoolButton}
                        userCurrentPool={userCurrentPool}
                        setUserCurrentPool={setUserCurrentPool}
                        currentUser={currentUser}
                        ensName={ensName}
                        setFavoritePoolsArray={setFavoritePoolsArray}
                        favoritePoolsArray={favoritePoolsArray}
                        topPools={topPools}
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
