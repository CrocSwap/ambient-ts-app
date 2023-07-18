import styles from './ChatPanel.module.css';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import Room from './MessagePanel/Room/Room';
import { RiArrowDownSLine } from 'react-icons/ri';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import useChatSocket from './Service/useChatSocket';
import { PoolIF } from '../../utils/interfaces/exports';
import useChatApi from './Service/ChatApi';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { BsChatLeftFill } from 'react-icons/bs';
import { useAccount, useEnsName } from 'wagmi';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import FullChat from './FullChat/FullChat';
import trimString from '../../utils/functions/trimString';
import NotFound from '../../pages/NotFound/NotFound';
import { AppStateContext } from '../../contexts/AppStateContext';
import Toggle2 from '../Global/Toggle/Toggle2';
import { ethers } from 'ethers';

interface propsIF {
    isFullScreen: boolean;
    appPage?: boolean;
}

function ChatPanel(props: propsIF) {
    const [focusMentions, setFocusMentions] = useState(true);
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

    const [mentIndex, setMentIndex] = useState(-1);
    const [hasNewMention, setHasNewMention] = useState(false);
    const [messageCheckerInterval, setMessageCheckerInterval] = useState<any>();
    const [inputDisabled, setInputDisabled] = useState<boolean>(false);

    const {
        messages,
        getMsg,
        lastMessage,
        messageUser,
        sendMsg,
        deleteMsgFromList,
        users,
        notis,
        updateLikeDislike,
    } = useChatSocket(room, isSubscriptionsEnabled, isChatOpen, address, ens);

    const { getID, updateUser, updateMessageUser } = useChatApi();

    const userData = useAppSelector((state) => state.userData);
    const isUserLoggedIn = userData.isLoggedIn;
    const resolvedAddress = userData.resolvedAddress;

    function isLink(url: string) {
        const urlPattern =
            /.*(http|https):\/\/[a-z0-9]+([-.\w]*[a-z0-9])*\.([a-z]{2,5})(:[0-9]{1,5})?(\/.*)?$/i;
        return urlPattern.test(url);
    }

    const crocodileLabsLinks = [
        'https://www.crocswap.com/',
        'https://twitter.com/CrocSwap',
        'https://crocswap.medium.com/',
        'https://www.linkedin.com/company/crocodile-labs/',
        'https://github.com/CrocSwap',
        'https://discord.com/invite/CrocSwap', // etherscan , ambient.finance //remove http
        'https://www.crocswap.com/whitepaper',
    ];

    function isLinkInCrocodileLabsLinks(word: string) {
        return crocodileLabsLinks.includes(word);
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

    const [mentPanelActive, setMentPanelActive] = useState(false);
    const [mentPanelQueryStr, setMentPanelQueryStr] = useState('');
    // const mentPanelInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        const mentsInScp = messages.filter((item) => {
            return item.mentionedWalletID == address;
        });

        if (mentIndex == -1) {
            setMentIndex(mentsInScp.length - 1);
        }

        if (notis?.get(room)) {
            console.log('i got new message');
        }

        if (messages.length == 0) return;

        if (messageCheckerInterval != undefined) {
            clearInterval(messageCheckerInterval);
        }
        const checkerInterval = setInterval(() => {
            const currentTS = new Date().getTime();
            const lastMinMessages = messages.filter(
                (item) =>
                    //  (currentTS - Number(item.createdAt)) <= 1000 * 60 && item.sender == currentUser
                    currentTS - new Date(item.createdAt).getTime() <=
                        1000 * 60 && item.sender == currentUser,
            );

            // console.log('......................................')
            // console.log(lastMinMessages.length)

            if (lastMinMessages.length > 4) {
                setInputDisabled(true);
            } else {
                setInputDisabled(false);
            }
        }, 1000);

        setMessageCheckerInterval(checkerInterval);
    }, [messages]);

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

    const scrollToBottom = async () => {
        const timer = setTimeout(() => {
            messageEnd.current?.scrollTo(0, messageEnd.current?.scrollHeight);
        }, 1000);
        setScrollDirection('Scroll Down');
        return () => clearTimeout(timer);
    };

    const getChatBubbleYPos = (bubbleEl?: Element, containerEl?: Element) => {
        if (bubbleEl === undefined || containerEl === undefined) return 0;
        const elTop =
            bubbleEl?.getBoundingClientRect().top + containerEl?.scrollTop;
        return elTop - containerEl?.getBoundingClientRect().top;
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

        if (ments.length > 0) {
            let currIndex = 0;

            const mentElements = document.querySelectorAll('.mentionedMessage');

            for (let i = 0; i < mentElements.length; i++) {
                if (
                    mentElements[i].getBoundingClientRect().bottom <
                    messageEnd.current.getBoundingClientRect().bottom
                ) {
                    const attr =
                        mentElements[i].getAttribute('data-ment-index');
                    currIndex = parseInt(attr as string);
                } else {
                    break;
                }
            }
            setMentIndex(currIndex);
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

    const ments = messages.filter((item) => {
        return item.mentionedWalletID == address;
    });

    const handleMentionSkipper = (way: number) => {
        let targetElement = null;
        // down
        const mentElements = document.querySelectorAll('.mentionedMessage');
        if (way == 1) {
            for (let i = 0; i < mentElements.length; i++) {
                if (
                    mentElements[i].getBoundingClientRect().bottom >
                    messageEnd.current.getBoundingClientRect().bottom
                ) {
                    targetElement = mentElements[i];
                    break;
                }
            }
        }
        // up
        else if (way === -1) {
            for (let i = mentElements.length - 1; i >= 0; i--) {
                if (
                    mentElements[i].getBoundingClientRect().top <
                    messageEnd.current.getBoundingClientRect().top
                ) {
                    targetElement = mentElements[i];
                    break;
                }
            }
        }
        // last
        else {
            targetElement = mentElements.item(mentElements.length - 1);
        }

        if (targetElement != null) {
            messageEnd.current.scrollTop =
                getChatBubbleYPos(targetElement, messageEnd.current) - 40;
        }
    };

    const connectWallet = (e: any) => {
        e.preventDefault();
        const message = 'Your verification message';

        window.ethereum
            .request({
                method: 'personal_sign',
                params: [message, address],
            })
            .then((signedMessage: any) => {
                console.log(signedMessage);
                // The signed message is available here, which you can send to your server for verification
            })
            .catch((error: any) => {
                // Handle error
            });
    };

    const header = (
        <div
            className={styles.chat_header}
            onClick={() => setIsChatOpen(!isChatOpen)}
        >
            <h2 className={styles.chat_title}>Chat</h2>

            <div className={styles.verify_button} onClick={connectWallet}></div>
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

    let mentIndexPointer = 0;
    const messageList = (
        <div
            ref={messageEnd}
            className={styles.scrollable_div}
            onScroll={handleScroll}
            id='chatmessage'
        >
            {messages &&
                messages.map((item, i) => {
                    if (item.mentionedWalletID === address) {
                        mentIndexPointer += 1;
                    }

                    return (
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
                                i === messages.length - 1
                                    ? null
                                    : messages[i + 1]
                            }
                            previousMessage={i === 0 ? null : messages[i - 1]}
                            deleteMsgFromList={deleteMsgFromList}
                            isLinkInCrocodileLabsLinks={
                                isLinkInCrocodileLabsLinks
                            }
                            mentionIndex={
                                item.mentionedWalletID === address
                                    ? mentIndexPointer - 1
                                    : undefined
                            }
                            updateLikeDislike={updateLikeDislike}
                        />
                    );
                })}
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
            sendMsg={sendMsg}
            inputListener={messageInputListener}
            users={users}
            isLinkInCrocodileLabsLinks={isLinkInCrocodileLabsLinks}
            isLink={isLink}
            disabled={inputDisabled}
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
            className={`${styles.main_container} ${
                isChatOpen ? styles.chat_open : ''
            }`}
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
                        focusMentions={focusMentions}
                        setFocusMentions={setFocusMentions}
                        notis={notis}
                        mentCount={ments.length}
                        mentIndex={mentIndex}
                    />

                    <DividerDark changeColor addMarginTop addMarginBottom />

                    {messageList}

                    {chatNotification}

                    {messageInput}
                    {/* {mentionAutoComplete} */}
                    <div id='thelastmessage' />
                </div>
            </div>

            {ments.length > 0 && isChatOpen && focusMentions && (
                <>
                    {mentIndex > 0 && (
                        <div
                            className={styles.ment_skip_button}
                            onClick={() => {
                                handleMentionSkipper(-1);
                            }}
                        >
                            <IoIosArrowUp size={22} />
                        </div>
                    )}
                    {mentIndex < ments.length - 1 && (
                        <div
                            className={styles.ment_skip_button_down}
                            onClick={() => {
                                handleMentionSkipper(1);
                            }}
                        >
                            <IoIosArrowDown size={22} />
                        </div>
                    )}
                    {mentIndex < ments.length - 1 && (
                        <div
                            className={styles.ment_skip_button_last}
                            onClick={() => {
                                handleMentionSkipper(2);
                            }}
                        >
                            <IoIosArrowDown size={22} />
                            Last Mention
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default memo(ChatPanel);
