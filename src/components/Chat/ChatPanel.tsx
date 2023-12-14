import styles from './ChatPanel.module.css';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import DividerDark from '../Global/DividerDark/DividerDark';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import Room from './MessagePanel/Room/Room';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import useChatSocket from './Service/useChatSocket';
import { PoolIF } from '../../ambient-utils/types';
import useChatApi from './Service/ChatApi';
import { BsChatLeftFill } from 'react-icons/bs';
import { IoIosArrowUp, IoIosArrowDown, IoIosClose } from 'react-icons/io';
import FullChat from './FullChat/FullChat';
import { trimString } from '../../ambient-utils/dataLayer';
import NotFound from '../../pages/NotFound/NotFound';
import { AppStateContext } from '../../contexts/AppStateContext';
import { Message } from './Model/MessageModel';
import { AiOutlineCheck, AiOutlineClose, AiOutlineUser } from 'react-icons/ai';
import Picker from 'emoji-picker-react';
import UserSummary from './MessagePanel/UserSummary/UserSummary';
import { UserSummaryModel } from './Model/UserSummaryModel';
import ChatConfirmationPanel from './ChatConfirmationPanel/ChatConfirmationPanel';
import { UserDataContext } from '../../contexts/UserDataContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import ChatToaster from './ChatToaster/ChatToaster';
import { LS_USER_VERIFY_TOKEN, setLS } from './ChatUtils';
import { domDebug } from './DomDebugger/DomDebuggerUtils';
import DomDebugger from './DomDebugger/DomDebugger';
import { CROCODILE_LABS_LINKS } from '../../ambient-utils/constants';

interface propsIF {
    isFullScreen: boolean;
    appPage?: boolean;
}

function ChatPanel(props: propsIF) {
    const [isFocusMentions, setIsFocusMentions] = useState(true);
    const { isFullScreen } = props;
    const {
        chat: {
            isEnabled: isChatEnabled,
            isOpen: isChatOpen,
            setIsOpen: setIsChatOpen,
        },
        subscriptions: { isEnabled: isSubscriptionsEnabled },
    } = useContext(AppStateContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    if (!isChatEnabled) return <NotFound />;

    // eslint-disable-next-line
    const messageEnd = useRef<any>(null);
    const [favoritePools, setFavoritePools] = useState<PoolIF[]>([]);
    const [room, setRoom] = useState('Global');
    const [isModerator, setIsModerator] = useState(false);
    const [isCurrentPool, setIsCurrentPool] = useState(false);
    const [showCurrentPoolButton, setShowCurrentPoolButton] = useState(true);
    const [userCurrentPool, setUserCurrentPool] = useState('ETH / USDC');
    const [isDeleteMessageButtonPressed, setIsDeleteMessageButtonPressed] =
        useState(false);
    const [showPopUp, setShowPopUp] = useState(false);
    const [popUpText, setPopUpText] = useState('');
    const { userAddress, ensName: ens } = useContext(UserDataContext);
    const [ensName, setEnsName] = useState('');
    const [currentUser, setCurrentUser] = useState<string | undefined>(
        undefined,
    );
    const [scrollDirection, setScrollDirection] = useState(String);
    const [notificationCount, setNotificationCount] = useState(0);
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
    const [mentionIndex, setMentionIndex] = useState(-1);
    // eslint-disable-next-line
    const [notConnectedUserInterval, setNotConnectedUserInterval] =
        useState<any>();
    const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false);
    const _cooldownVal = 12;
    const [sendMessageCooldown, setSendMessageCooldown] =
        useState<number>(_cooldownVal);

    // CHAT_FEATURE_STATES - Feature : User Summary
    const [userSummaryToBottom, setUserSummaryToBottom] = useState(false);
    const [userSummaryVerticalPosition, setUserSummaryVerticalPosition] =
        useState(0);
    const [userSummaryActive, setUserSummaryActive] = useState(false);
    const [selectedUserSummary, setSelectedUserSummary] =
        useState<UserSummaryModel>();

    const [showVerifyOldMessagesPanel, setShowVerifyOldMessagesPanel] =
        useState(false);

    const [confirmationPanelContent, setConfirmationPanelContent] = useState(0);

    const [verifyOldMessagesStartDate, setVerifyOldMessagesStartDate] =
        useState(new Date());

    const [toastrActive, setToastrActive] = useState(false);
    const [toastrType, setToastrType] = useState<
        'success' | 'error' | 'warning' | 'info'
    >('info');
    const [toastrText, setToastrText] = useState('');

    const verifyBtnRef = useRef<HTMLDivElement>(null);

    const activateToastr = (
        message: string,
        type: 'success' | 'error' | 'warning' | 'info',
    ) => {
        setToastrActive(true);
        setToastrText(message);
        setToastrType(type);
    };

    const {
        messages,
        getMsg,
        lastMessage,
        messageUser,
        sendMsg,
        users,
        getMsgWithRestWithPagination,
        notifications,
        updateLikeDislike,
        socketRef,
        isVerified,
        verifyUser,
        userMap,
        updateUserCache,
        getAllMessages,
        setMessages,
        addReaction,
        deleteMsgFromList,
        fetchForNotConnectedUser,
        getUserSummaryDetails,
        updateUnverifiedMessages,
    } = useChatSocket(
        room,
        isSubscriptionsEnabled,
        isChatOpen,
        activateToastr,
        userAddress,
        ens,
        currentUser,
    );

    const { getID, updateUser, updateMessageUser } = useChatApi();

    const [focusedMessage, setFocusedMessage] = useState<Message | undefined>();
    const [showPicker, setShowPicker] = useState(false);
    const { isUserConnected, resolvedAddressFromContext } =
        useContext(UserDataContext);

    const defaultEnsName = 'defaultValue';

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

    function isLinkInCrocodileLabsLinks(word: string) {
        return CROCODILE_LABS_LINKS.some((link) => word.includes(link));
    }

    function isLinkInCrocodileLabsLinksForInput(word: string) {
        return CROCODILE_LABS_LINKS.some((link) => {
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

    function closeOnEscapeKeyDown(e: KeyboardEvent) {
        if (e.code === 'Escape') setIsChatOpen(false);
    }

    function openChatPanel(e: KeyboardEvent) {
        if (e.code === 'KeyC' && e.ctrlKey && e.altKey) {
            setIsChatOpen(!isChatOpen);
        }
    }

    async function mentionHoverListener(elementTop: number, walletID: string) {
        // CHAT_FEATURES_WBO -  Feature : User Summary
        // const userDetails = await getUserSummaryDetails(walletID);
        // console.log(userDetails);
        // setSelectedUserSummary(userDetails);
        // const wrapperCenterPoint =
        //     messageEnd.current?.getBoundingClientRect().height / 2 +
        //     messageEnd.current?.getBoundingClientRect().top;
        // setUserSummaryActive(true);
        // setUserSummaryVerticalPosition(
        //     elementTop - messageEnd.current?.getBoundingClientRect().top,
        // );
        // if (elementTop >= wrapperCenterPoint) {
        //     setUserSummaryToBottom(false);
        // } else {
        //     setUserSummaryToBottom(true);
        // }
    }

    function summaryMouseLeaveListener() {
        setUserSummaryActive(false);
    }

    function closePopUp() {
        setShowPopUp(false);
    }

    const [isMentionPanelActive, setIsMentionPanelActive] = useState(false);
    // eslint-disable-next-line
    const [mentionPanelQuery, setMentionPanelQuery] = useState('');

    const messageInputListener = (value: string) => {
        if (value.indexOf('@') !== -1) {
            setIsMentionPanelActive(true);
            setMentionPanelQuery(value.split('@')[1]);
        } else {
            if (isMentionPanelActive) setIsMentionPanelActive(false);
        }
    };

    const reactionBtnListener = (focusedMessage?: Message) => {
        setFocusedMessage(focusedMessage);
        setShowPicker(true);
    };

    const addReactionEmojiPickListener = (event: any, data: any) => {
        if (focusedMessage && currentUser) {
            addReaction(focusedMessage._id, currentUser, data.emoji);
            setShowPicker(false);
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
        // console.log('first assignment')
        // let interval;
        // if (userAddress == undefined && notConnectedUserInterval == undefined) {
        //     interval = setInterval(() => {
        //         fetchForNotConnectedUser();
        //     }, 10000);
        //     if (notConnectedUserInterval)
        //         clearInterval(notConnectedUserInterval);

        //     setNotConnectedUserInterval(interval);
        // }else if(notConnectedUserInterval){
        //     clearInterval(notConnectedUserInterval);
        // }

        return clearInterval(notConnectedUserInterval);
    }, []);

    useEffect(() => {
        console.log(userAddress, room);
        console.log('....................................');
        console.log('room changed', room);

        if (room == undefined) return;

        if (notConnectedUserInterval) {
            console.log('clearing current interval');
            clearInterval(notConnectedUserInterval);
        }

        if (userAddress == undefined) {
            console.log('Creating new interval for ', room);
            const interval = setInterval(() => {
                console.log(
                    '--------- that interval asssigned on use effect, user address or room change',
                    room,
                );
                fetchForNotConnectedUser();
            }, 10000);
            setNotConnectedUserInterval(interval);
        }

        return clearInterval(notConnectedUserInterval);
    }, [userAddress, room]);

    useEffect(() => {
        if (scrollDirection === 'Scroll Up') {
            if (messageUser !== currentUser) {
                if (
                    lastMessage?.mentionedName === ensName ||
                    (lastMessage?.mentionedName === userAddress &&
                        userAddress !== undefined)
                ) {
                    setNotificationCount(
                        (notificationCount) => notificationCount + 1,
                    );
                }
            } else if (messageUser === currentUser) {
                setIsScrollToBottomButtonPressed(true);
                scrollToBottomButton();

                setNotificationCount(0);
            }
        } else {
            scrollToBottomButton();
        }
    }, [lastMessage]);

    useEffect(() => {
        setScrollDirection('Scroll Down');
        if (userAddress) {
            if (ens === null || ens === undefined) {
                setEnsName(defaultEnsName);
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
                        ? setIsModerator(true)
                        : setIsModerator(false);
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
    }, [ens, userAddress, isChatOpen, isFullScreen, setUserCurrentPool]);

    useEffect(() => {
        setIsScrollToBottomButtonPressed(false);
        scrollToBottom();
        setNotificationCount(0);
        getMsg();
        setShowPreviousMessagesButton(false);
        setPage(0);
    }, [room, isChatOpen === false]);

    // useEffect(() => {
    //     if (isMessageDeleted) {
    //         setIsMessageDeleted(false);
    //         getMsg();
    //         window.scrollTo(0, 0);
    //     }
    // }, [isMessageDeleted]);

    useEffect(() => {
        setIsScrollToBottomButtonPressed(false);
        scrollToBottom();
        setNotificationCount(0);
    }, [isChatOpen]);

    useEffect(() => {
        const mentionsInScope = messages.filter((item) => {
            return item.mentionedWalletID == userAddress;
        });

        if (mentionIndex == -1) {
            setMentionIndex(mentionsInScope.length - 1);
        }

        if (messages.length == 0) return;
    }, [messages, setMessages]);

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

        const data =
            room === 'Admins'
                ? await getAllMessages(nextPage)
                : await getMsgWithRestWithPagination(room, nextPage);
        if (data.length === 0 || data.length < 20) {
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
    };

    const scrollToBottom = async () => {
        const timer = setTimeout(() => {
            messageEnd.current?.scrollTo(0, messageEnd.current?.scrollHeight);
        }, 1000);
        setScrollDirection('Scroll Down');
        return () => clearTimeout(timer);
    };

    const getChatBubbleYPos = (bubbleEl?: Element, containerEl?: Element) => {
        if (bubbleEl === undefined || containerEl === undefined) return 0; // what is it?
        const elTop =
            bubbleEl?.getBoundingClientRect().top + containerEl?.scrollTop;
        return elTop - containerEl?.getBoundingClientRect().top;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleScroll = (e: any) => {
        const tolerance = 0.6;

        if (
            e.target.scrollTop + e.target.clientHeight + tolerance >=
            e.target.scrollHeight
        ) {
            setNotificationCount(0);
            setIsScrollToBottomButtonPressed(false);
            setScrollDirection('Scroll Down');
        } else {
            if (
                e.target.scrollTop === 0 &&
                e.target.clientHeight !== e.target.scrollHeight &&
                messages.length >= 20
            ) {
                setShowPreviousMessagesButton(true);
            } else {
                setShowPreviousMessagesButton(false);
            }
            setScrollDirection('Scroll Up');
        }

        if (mentions.length > 0) {
            let currentIndex = 0;

            const mentionElements =
                document.querySelectorAll('.mentionedMessage');

            for (let i = 0; i < mentionElements.length; i++) {
                if (
                    mentionElements[i].getBoundingClientRect().bottom <
                    messageEnd.current.getBoundingClientRect().bottom
                ) {
                    const attribute =
                        mentionElements[i].getAttribute('data-ment-index');
                    currentIndex = parseInt(attribute as string);
                } else {
                    break;
                }
            }
            setMentionIndex(currentIndex);
        }
    };

    const mentions = messages.filter((item) => {
        return (
            item.mentionedWalletID == userAddress && userAddress !== undefined
        );
    });

    const handleMentionSkipper = (way: number) => {
        let targetElement = null;
        // down
        const mentionElements = document.querySelectorAll('.mentionedMessage');
        if (way == 1) {
            for (let i = 0; i < mentionElements.length; i++) {
                if (
                    mentionElements[i].getBoundingClientRect().bottom >
                    messageEnd.current.getBoundingClientRect().bottom
                ) {
                    targetElement = mentionElements[i];
                    break;
                }
            }
        }
        // up
        else if (way === -1) {
            for (let i = mentionElements.length - 1; i >= 0; i--) {
                if (
                    mentionElements[i].getBoundingClientRect().top <
                    messageEnd.current.getBoundingClientRect().top
                ) {
                    targetElement = mentionElements[i];
                    break;
                }
            }
        }
        // last
        else {
            targetElement = mentionElements.item(mentionElements.length - 1);
        }

        if (targetElement != null) {
            messageEnd.current.scrollTop =
                getChatBubbleYPos(targetElement, messageEnd.current) - 40;
        }
    };

    const handleConfirmationDialog = (
        confirmationType: number,
        startDate: Date,
        endDate?: Date,
    ) => {
        setConfirmationPanelContent(confirmationType);
        setVerifyOldMessagesStartDate(startDate);
        setShowVerifyOldMessagesPanel(true);
    };

    const verifyWallet = (
        verificationType: number,
        verificationDate: Date,
        // eslint-disable-next-line
        e?: any,
    ) => {
        if (e) e.stopPropagation();

        if (isUserConnected == false)
            activateToastr('Please connect your wallet first.', 'warning');

        const message =
            'Your wallet will be verified for chat. Please sign it for verification.';
        let verifyDate = new Date();

        if (verificationType === 0) {
            if (isVerified) return;
        } else {
            verifyDate = verificationDate;
        }

        window.ethereum
            .request({
                method: 'personal_sign',
                params: [message, userAddress, ''],
                // params: [message, '0x7D0CDcC61914001A5b9bF81063A2834119539911', ''],
            })
            // eslint-disable-next-line
            .then((signedMessage: any) => {
                verifyUser(signedMessage, verifyDate);
                setLS(LS_USER_VERIFY_TOKEN, signedMessage, userAddress);
                setTimeout(() => {
                    updateUserCache();
                    activateToastr('Your wallet is verified!', 'success');
                }, 300);
            })
            // eslint-disable-next-line
            .catch((error: any) => {
                // Handle error
            });
    };

    const header = (
        <div
            className={styles.chat_header}
            onClick={() => setIsChatOpen(!isChatOpen)}
        >
            <h2 className={styles.chat_title}>Trollbox</h2>

            {isChatOpen && (
                <div
                    ref={verifyBtnRef}
                    className={`${styles.verify_button} ${
                        isVerified ? styles.verified : ''
                    } `}
                    onClick={(e) => verifyWallet(0, new Date(), e)}
                >
                    {isModerator && isVerified && (
                        <AiOutlineUser
                            className={
                                styles.verify_button_icon +
                                ' ' +
                                styles.verify_button_mod_icon
                            }
                            color='var(--other-green)'
                            size={14}
                        ></AiOutlineUser>
                    )}
                    {isVerified ? (
                        <>
                            <AiOutlineCheck
                                className={styles.verify_button_icon}
                                color='var(--other-green)'
                                size={10}
                            />
                        </>
                    ) : (
                        <>
                            <AiOutlineClose
                                className={styles.verify_button_icon}
                                size={10}
                            />
                            <span> Not Verified</span>
                        </>
                    )}
                </div>
            )}

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

    let mentionIxdexPointer = 0;
    const messageList = (
        <div
            ref={messageEnd}
            className={styles.scrollable_div}
            onScroll={handleScroll}
            id='chatmessage'
        >
            {messages &&
                messages.map((item, i) => {
                    if (item.mentionedWalletID === userAddress) {
                        mentionIxdexPointer += 1;
                    }
                    return (
                        <SentMessagePanel
                            key={i}
                            isUserLoggedIn={isUserConnected as boolean}
                            message={item}
                            ensName={ensName}
                            isCurrentUser={item.sender === currentUser}
                            currentUser={currentUser}
                            resolvedAddress={resolvedAddressFromContext}
                            connectedAccountActive={userAddress}
                            room={room}
                            isModerator={isModerator}
                            isMessageDeleted={isMessageDeleted}
                            setIsMessageDeleted={setIsMessageDeleted}
                            nextMessage={
                                i === messages.length - 1
                                    ? null
                                    : messages[i + 1]
                            }
                            previousMessage={i === 0 ? null : messages[i - 1]}
                            isLinkInCrocodileLabsLinks={
                                isLinkInCrocodileLabsLinks
                            }
                            mentionIndex={
                                item.mentionedWalletID === userAddress
                                    ? mentionIxdexPointer - 1
                                    : undefined
                            }
                            updateLikeDislike={updateLikeDislike}
                            socketRef={socketRef}
                            userMap={userMap}
                            verifyWallet={verifyWallet}
                            isUserVerified={isVerified}
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
                            isSubscriptionsEnabled={isSubscriptionsEnabled}
                            isChatOpen={isChatOpen}
                            address={userAddress}
                            isDeleted={item.isDeleted}
                            deletedMessageText={item.deletedMessageText}
                            addReactionListener={reactionBtnListener}
                            isDeleteMessageButtonPressed={
                                isDeleteMessageButtonPressed
                            }
                            setIsDeleteMessageButtonPressed={
                                setIsDeleteMessageButtonPressed
                            }
                            deleteMsgFromList={deleteMsgFromList}
                            addReaction={addReaction}
                            mentionHoverListener={mentionHoverListener}
                            mentionMouseLeftListener={() => {
                                setUserSummaryActive(false);
                            }}
                            handleConfirmationDialog={handleConfirmationDialog}
                        />
                    );
                })}
            <UserSummary
                isActive={userSummaryActive}
                toBottom={userSummaryToBottom}
                user={selectedUserSummary}
                mouseLeaveListener={summaryMouseLeaveListener}
                mouseEnterListener={() => {
                    setUserSummaryActive(true);
                }}
                verticalPosition={userSummaryVerticalPosition}
            />
        </div>
    );

    const chatNotification = (
        <div className={styles.chat_notification}>
            {notificationCount > 0 &&
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
                            <span className={styles.text}>
                                {notificationCount}
                            </span>
                        </span>
                        <span style={{ marginTop: '-18px', cursor: 'pointer' }}>
                            <RiArrowDownSLine
                                role='button'
                                size={27}
                                color='#7371fc'
                                onClick={() => scrollToBottomButton()}
                                tabIndex={0}
                                aria-label='Scroll to bottom'
                                style={{ cursor: 'pointer' }}
                                title={'Scroll To Bottom'}
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
                            <span className={styles.text}>
                                {notificationCount}
                            </span>
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
                                title={'Scroll To Bottom'}
                            />
                        </span>
                    </div>
                )
            ) : scrollDirection === 'Scroll Up' &&
              notificationCount <= 0 &&
              !isScrollToBottomButtonPressed ? (
                isFullScreen ? (
                    <span style={{ marginTop: '-18px', cursor: 'pointer' }}>
                        <RiArrowDownSLine
                            role='button'
                            size={27}
                            color='#7371fc'
                            onClick={() => scrollToBottomButton()}
                            tabIndex={0}
                            aria-label='Scroll to bottom'
                            style={{ cursor: 'pointer' }}
                            title={'Scroll To Bottom'}
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
                            aria-label='Scroll to bottom'
                            style={{ cursor: 'pointer' }}
                            title={'Scroll To Bottom'}
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
                    ? baseToken.symbol + ' / ' + quoteToken.symbol
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
            isInputDisabled={isInputDisabled}
            sendMessageCooldown={sendMessageCooldown}
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
                        ? trimString(userAddress as string, 6, 0, '…')
                        : (ens as string)
                }
                setRoom={setRoom}
                setIsCurrentPool={setIsCurrentPool}
                showCurrentPoolButton={showCurrentPoolButton}
                setShowCurrentPoolButton={setShowCurrentPoolButton}
                userCurrentPool={userCurrentPool}
                favoritePools={favoritePools}
                setFavoritePools={setFavoritePools}
            />
        );

    const getConfirmationPanelContent = () => {
        switch (confirmationPanelContent) {
            case 1:
                return 'Your old messages that sent from this browser will be verified, do you confirm?';

            case 2:
                return 'These messages may not sent from this browser. Do you want to verify?';

            default:
                return '';
        }
    };

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
                        setFavoritePools={setFavoritePools}
                        favoritePools={favoritePools}
                        setIsFocusMentions={setIsFocusMentions}
                        notifications={notifications}
                        mentCount={mentions.length}
                        mentionIndex={mentionIndex}
                        isModerator={isModerator}
                        isFocusMentions={isFocusMentions}
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
                                aria-label='Show previous messages'
                                style={{ cursor: 'pointer' }}
                                title='Show previous messages'
                            />
                        ) : (
                            ''
                        )}
                    </div>
                    {messageList}

                    {showPopUp ? sendingLink : ''}
                    {chatNotification}

                    {isChatOpen && showPicker && (
                        <div
                            id='chatReactionWrapper'
                            className={styles.reaction_picker_wrapper}
                        >
                            <div
                                className={styles.reaction_picker_close}
                                onClick={() => {
                                    setShowPicker(false);
                                }}
                            >
                                {' '}
                                X{' '}
                            </div>
                            <Picker
                                onEmojiClick={addReactionEmojiPickListener}
                                pickerStyle={{ width: '100%' }}
                                disableSkinTonePicker={true}
                            />
                        </div>
                    )}

                    {messageInput}
                    {/* {mentionAutoComplete} */}
                    <div id='thelastmessage' />
                </div>
            </div>

            {mentions.length > 0 && isChatOpen && isFocusMentions && (
                <>
                    {mentionIndex > 0 && (
                        <div
                            className={styles.ment_skip_button}
                            onClick={() => {
                                handleMentionSkipper(-1);
                            }}
                        >
                            <IoIosArrowUp size={22} />
                        </div>
                    )}
                    {mentionIndex < mentions.length - 1 && (
                        <div
                            className={styles.ment_skip_button_down}
                            onClick={() => {
                                handleMentionSkipper(1);
                            }}
                        >
                            <IoIosArrowDown size={22} />
                        </div>
                    )}
                    {mentionIndex < mentions.length - 1 && (
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

            <ChatConfirmationPanel
                isActive={showVerifyOldMessagesPanel && isChatOpen}
                title='Verify Old Messages'
                content={getConfirmationPanelContent()}
                cancelListener={() => {
                    setShowVerifyOldMessagesPanel(false);
                }}
                confirmListener={async () => {
                    if (!isVerified) {
                        verifyBtnRef.current?.classList.add(styles.flashed);
                        setTimeout(() => {
                            verifyBtnRef.current?.classList.remove(
                                styles.flashed,
                            );
                        }, 1500);
                        return activateToastr(
                            'Please verify your wallet to verify old messages.',
                            'warning',
                        );
                    }
                    await updateUnverifiedMessages(
                        verifyOldMessagesStartDate,
                        confirmationPanelContent == 2
                            ? new Date(
                                  verifyOldMessagesStartDate.getTime() +
                                      1000 * 60,
                              )
                            : undefined,
                    );
                    activateToastr(
                        'Old messages verified successfully',
                        'success',
                    );
                    setShowVerifyOldMessagesPanel(false);
                }}
            />
            <ChatToaster
                isActive={toastrActive && isChatOpen}
                activator={setToastrActive}
                text={toastrText}
                type={toastrType}
            />
            <DomDebugger />
        </div>
    );
}

export default memo(ChatPanel);
