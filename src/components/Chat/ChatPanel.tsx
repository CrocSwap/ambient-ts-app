import styles from './ChatPanel.module.css';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import Room from './MessagePanel/Room/Room';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import useChatSocket from './Service/useChatSocket';
import { PoolIF } from '../../utils/interfaces/exports';
import useChatApi from './Service/ChatApi';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { BsChatLeftFill } from 'react-icons/bs';
import { useAccount, useEnsName } from 'wagmi';
import { IoIosArrowUp, IoIosArrowDown, IoIosClose } from 'react-icons/io';
import FullChat from './FullChat/FullChat';
import trimString from '../../utils/functions/trimString';
import NotFound from '../../pages/NotFound/NotFound';
import { AppStateContext } from '../../contexts/AppStateContext';
import { Message } from './Model/MessageModel';

interface propsIF {
    isFullScreen: boolean;
    appPage?: boolean;
}

function ChatPanel(props: propsIF) {
    const { isFullScreen } = props;
    const {
        chat: {
            isEnabled: isChatEnabled,
            isOpen: isChatOpen,
            setIsOpen: setIsChatOpen,
        },
        subscriptions: { isEnabled: isSubscriptionsEnabled },
    } = useContext(AppStateContext);

    const currentPool = useAppSelector((state) => state.tradeData);

    if (!isChatEnabled) return <NotFound />;

    // eslint-disable-next-line
    const messageEnd = useRef<any>(null);
    const [favoritePoolsArray, setFavoritePoolsArray] = useState<PoolIF[]>([]);
    const [room, setRoom] = useState('Global');
    const [moderator, setModerator] = useState(false);
    const [isCurrentPool, setIsCurrentPool] = useState(false);
    const [showCurrentPoolButton, setShowCurrentPoolButton] = useState(true);
    const [userCurrentPool, setUserCurrentPool] = useState(
        currentPool.baseToken.symbol + ' / ' + currentPool.quoteToken.symbol,
    );
    const [showPopUp, setShowPopUp] = useState(false);
    const [popUpText, setPopUpText] = useState('false');
    const { address } = useAccount();
    const { data: ens } = useEnsName({ address });
    const [ensName, setEnsName] = useState('');
    const [currentUser, setCurrentUser] = useState<string | undefined>(
        undefined,
    );
    const [scrollDirection, setScrollDirection] = useState(String);
    const [notification, setNotification] = useState(0);
    const [isMessageDeleted, setIsMessageDeleted] = useState(false);
    const [showPreviousMessagesButton, setShowPreviousMessagesButton] =
        useState(false);
    const [isScrollToBottomButtonPressed, setIsScrollToBottomButtonPressed] =
        useState(true);

    const [isReplyButtonPressed, setIsReplyButtonPressed] = useState(false);
    const [replyMessageContent, setReplyMessageContent] = useState<
        Message | undefined
    >();

    const [page, setPage] = useState(0);
    const {
        messages,
        getMsg,
        lastMessage,
        messageUser,
        sendMsg,
        deleteMsgFromList,
        users,
        getMsgWithRest2,
    } = useChatSocket(room, isSubscriptionsEnabled, isChatOpen, address, ens);

    const { getID, updateUser, updateMessageUser } = useChatApi();

    const userData = useAppSelector((state) => state.userData);
    const isUserLoggedIn = userData.isLoggedIn;
    const resolvedAddress = userData.resolvedAddress;

    function isLink(url: string) {
        const urlPattern =
            /^(https|http|ftp|ftps?:\/\/)?([a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,7})(:[0-9]{1,5})?(\/.*)?$/gm;
        return urlPattern.test(url);
    }

    const blockPattern = /\b\w+\.(?:com|org|net|co|io|edu|gov|mil|ac)\b.*$/;

    function filterMessage(message: string) {
        return blockPattern.test(message);
    }

    function formatURL(url: string) {
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
            return url;
        }
        return url;
    }

    const crocodileLabsLinks = [
        'https://twitter.com/',
        'https://docs.ambient.finance/',
        'https://ambient.finance/',
    ];

    function isLinkInCrocodileLabsLinks(word: string) {
        return crocodileLabsLinks.some((link) => word.includes(link));
    }

    function isLinkInCrocodileLabsLinksForInput(word: string) {
        return crocodileLabsLinks.some((link) => {
            try {
                const url = new URL(link);
                const domain = url.hostname;
                return word.includes(domain);
            } catch (error) {
                console.error('Invalid URL:', link);
                return false;
            }
        });
    }

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

    function closePopUp() {
        setShowPopUp(false);
    }

    const [mentPanelActive, setMentPanelActive] = useState(false);
    const [mentPanelQueryStr, setMentPanelQueryStr] = useState('');

    const messageInputListener = (value: string) => {
        if (value.indexOf('@') !== -1) {
            setMentPanelActive(true);
            setMentPanelQueryStr(value.split('@')[1]);
        } else {
            if (mentPanelActive) setMentPanelActive(false);
        }
    };

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
                    (lastMessage?.mentionedName === address &&
                        address !== undefined)
                ) {
                    setNotification((notification) => notification + 1);
                }
            } else if (messageUser === currentUser) {
                setIsScrollToBottomButtonPressed(true);
                scrollToBottomButton();

                setNotification(0);
            }
        } else {
            scrollToBottomButton();
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
                    // this flow moved to backend due to triggering more than one
                    // whole of initial data fetching process will be refactored
                    // saveUser(address, ensName).then((result: any) => {
                    //     setCurrentUser(result.userData._id);
                    //     return result;
                    // });
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
        setShowPreviousMessagesButton(false);
        setPage(0);
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
        messageEnd.current?.scrollTo(0, messageEnd.current?.scrollHeight);
        setTimeout(() => {
            setIsScrollToBottomButtonPressed(true);
            messageEnd.current?.scrollTo(0, messageEnd.current?.scrollHeight);
        }, 101);
        setScrollDirection('Scroll Down');
    };

    const getPreviousMessages = async () => {
        const nextPage = page + 1;
        setPage(nextPage);

        const data = await getMsgWithRest2(room, nextPage);
        if (data.length === 0) {
            setShowPreviousMessagesButton(false);
        } else {
            const scrollContainer = messageEnd.current; // Referring to the scrollable container
            const scrollPositionBefore = scrollContainer.scrollTop;
            const scrollPositionAfter = scrollContainer.scrollHeight / 4;
            scrollContainer.scrollTo(
                0,
                scrollPositionAfter - scrollPositionBefore,
            );
        }

        // Scroll to the middle of the container
    };

    const scrollToBottom = async () => {
        const timer = setTimeout(() => {
            messageEnd.current?.scrollTo(0, messageEnd.current?.scrollHeight);
        }, 1000);
        setScrollDirection('Scroll Down');
        return () => clearTimeout(timer);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleScroll = (e: any) => {
        if (
            e.target.scrollHeight - e.target.scrollTop ===
            e.target.clientHeight
        ) {
            setNotification(0);
            setIsScrollToBottomButtonPressed(false);
            setScrollDirection('Scroll Down');
        } else {
            setScrollDirection('Scroll Up');
        }
        if (
            e.target.scrollTop === 0 &&
            e.target.clientHeight !== e.target.scrollHeight
        ) {
            setShowPreviousMessagesButton(true);
        } else {
            setShowPreviousMessagesButton(false);
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
                    // <<div
                    //     className={styles.open_full_button}
                    //     onClick={() =>
                    //         window.open('/chat/' + convertCurreny(room))
                    //     }
                    //     aria-label='Open chat in full screen'
                    // >
                    //     <img
                    //         src={ExpandChatIcon}
                    //         alt='Open chat in full screen'
                    //     />
                    // </div>>
                    <></>
                )}
                {isFullScreen || !isChatOpen ? (
                    <></>
                ) : (
                    <IoIosArrowDown
                        size={22}
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
            id='chatmessage'
        >
            {messages &&
                messages.map((item, i) => (
                    <SentMessagePanel
                        key={i}
                        isUserLoggedIn={isUserLoggedIn as boolean}
                        message={item}
                        ensName={ensName}
                        isCurrentUser={item.sender === currentUser}
                        currentUser={currentUser}
                        resolvedAddress={resolvedAddress}
                        connectedAccountActive={address}
                        moderator={moderator}
                        room={room}
                        isMessageDeleted={isMessageDeleted}
                        setIsMessageDeleted={setIsMessageDeleted}
                        nextMessage={
                            i === messages.length - 1 ? null : messages[i + 1]
                        }
                        previousMessage={i === 0 ? null : messages[i - 1]}
                        deleteMsgFromList={deleteMsgFromList}
                        isLinkInCrocodileLabsLinks={isLinkInCrocodileLabsLinks}
                        formatURL={formatURL}
                        isLinkInCrocodileLabsLinksForInput={
                            isLinkInCrocodileLabsLinksForInput
                        }
                        showPopUp={showPopUp}
                        setShowPopUp={setShowPopUp}
                        popUpText={popUpText}
                        setPopUpText={setPopUpText}
                        isReplyButtonPressed={isReplyButtonPressed}
                        setIsReplyButtonPressed={setIsReplyButtonPressed}
                        replyMessageContent={replyMessageContent}
                        setReplyMessageContent={setReplyMessageContent}
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

    const sendingLink = (
        <div className={styles.pop_up}>
            <p>{popUpText}</p>
            <div className={styles.close_button}>
                <IoIosClose
                    onClick={() => closePopUp()}
                    size={20}
                    role='button'
                    tabIndex={0}
                    aria-label='Close information box.'
                />
            </div>
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
            sendMsg={sendMsg}
            inputListener={messageInputListener}
            users={users}
            isLinkInCrocodileLabsLinks={isLinkInCrocodileLabsLinks}
            isLink={isLink}
            showPopUp={showPopUp}
            setShowPopUp={setShowPopUp}
            filterMessage={filterMessage}
            formatURL={formatURL}
            isLinkInCrocodileLabsLinksForInput={
                isLinkInCrocodileLabsLinksForInput
            }
            popUpText={popUpText}
            setPopUpText={setPopUpText}
            isReplyButtonPressed={isReplyButtonPressed}
            setIsReplyButtonPressed={setIsReplyButtonPressed}
            replyMessageContent={replyMessageContent}
            setReplyMessageContent={setReplyMessageContent}
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
                    />

                    <DividerDark changeColor addMarginTop addMarginBottom />
                    <div className={styles.scroll_up}>
                        {showPreviousMessagesButton ? (
                            <RiArrowUpSLine
                                role='button'
                                size={27}
                                color='#7371fc'
                                onClick={() => getPreviousMessages()}
                                tabIndex={0}
                                aria-label='Read previous messages'
                                style={{ cursor: 'pointer' }}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                    {messageList}
                    {showPopUp ? sendingLink : ''}
                    {chatNotification}

                    {messageInput}
                    {/* {mentionAutoComplete} */}
                    <div id='thelastmessage' />
                </div>
            </div>
        </div>
    );
}

export default memo(ChatPanel);
