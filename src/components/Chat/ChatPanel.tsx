import Picker, { IEmojiData } from 'emoji-picker-react';
import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { AiOutlineCheck, AiOutlineClose, AiOutlineUser } from 'react-icons/ai';
import { BsChatLeftFill } from 'react-icons/bs';
import { IoIosArrowDown, IoIosArrowUp, IoIosClose } from 'react-icons/io';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { CROCODILE_LABS_LINKS } from '../../ambient-utils/constants';
import { trimString } from '../../ambient-utils/dataLayer';
import { PoolIF } from '../../ambient-utils/types';
import { AppStateContext } from '../../contexts/AppStateContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { UserDataContext } from '../../contexts/UserDataContext';
import NotFound from '../../pages/NotFound/NotFound';
import DividerDark from '../Global/DividerDark/DividerDark';
import ChatConfirmationPanel from './ChatConfirmationPanel/ChatConfirmationPanel';
import styles from './ChatPanel.module.css';
import ChatToaster from './ChatToaster/ChatToaster';
import { LS_USER_VERIFY_TOKEN, setLS } from './ChatUtils';
import DomDebugger from './DomDebugger/DomDebugger';
import FullChat from './FullChat/FullChat';
import MessageInput from './MessagePanel/InputBox/MessageInput';
import Room from './MessagePanel/Room/Room';
import SentMessagePanel from './MessagePanel/SentMessagePanel/SentMessagePanel';
import UserSummary from './MessagePanel/UserSummary/UserSummary';
import { Message } from './Model/MessageModel';
import { UserSummaryModel } from './Model/UserSummaryModel';
import useChatApi from './Service/ChatApi';
import useChatSocket from './Service/useChatSocket';
import { domDebug } from './DomDebugger/DomDebuggerUtils';

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

    const messageEnd = useRef<HTMLDivElement>(null);
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
    const [selectedMessageforReply, setSelectedMessageForReply] = useState<
        Message | undefined
    >();

    const [page, setPage] = useState(0);
    const [mentionIndex, setMentionIndex] = useState(-1);
    // eslint-disable-next-line
    const [notConnectedUserInterval, setNotConnectedUserInterval] =
        useState<NodeJS.Timer>();

    // that block toggled when message count limit is handled --------------------------------------------

    // const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false);
    const isInputDisabled = false;

    const _cooldownVal = 12;
    // const [sendMessageCooldown, setSendMessageCooldown] =
    //     useState<number>(_cooldownVal);
    const sendMessageCooldown = _cooldownVal;
    // --------------------------------------------------------------------------------------------------

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

    // some tricky date set for old messages verification. if it is not changed by confirmation panel, some future date will be used to not verify any messages
    const [verifyOldMessagesStartDate, setVerifyOldMessagesStartDate] =
        useState(new Date(new Date().getTime() + 1000 * 60 * 60 * 100));

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
        if (e.code === 'Escape') {
            if (showPicker) {
                setShowPicker(false);
                return;
            }
            if (isReplyButtonPressed) {
                setIsReplyButtonPressed(false);
                return;
            }
            setIsChatOpen(false);
        }
    }

    function openChatPanel(e: KeyboardEvent) {
        if (e.code === 'KeyC' && e.ctrlKey && e.altKey) {
            setIsChatOpen(!isChatOpen);
        }
    }

    async function mentionHoverListener(elementTop: number, walletID: string) {
        // CHAT_FEATURES_WBO -  Feature : User Summary
        const userDetails = await getUserSummaryDetails(walletID);
        console.log(userDetails);
        setSelectedUserSummary(userDetails);
        if (!messageEnd.current) return;

        const wrapperCenterPoint =
            messageEnd.current.getBoundingClientRect().height / 2 +
            messageEnd.current.getBoundingClientRect().top;
        setUserSummaryActive(true);
        setUserSummaryVerticalPosition(
            elementTop - messageEnd.current.getBoundingClientRect().top,
        );
        if (elementTop >= wrapperCenterPoint) {
            setUserSummaryToBottom(false);
        } else {
            setUserSummaryToBottom(true);
        }
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
    const addReactionEmojiPickListener = (
        event: React.MouseEvent,
        data: IEmojiData,
    ) => {
        console.log('asdasd');
        console.log(focusedMessage);
        console.log(currentUser);
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
        return clearInterval(notConnectedUserInterval);
    }, []);

    useEffect(() => {
        if (room == undefined) {
            return;
        }

        if (notConnectedUserInterval) {
            clearInterval(notConnectedUserInterval);
        }

        if (userAddress == undefined) {
            if (isChatOpen == false) return;
            const interval = setInterval(() => {
                fetchForNotConnectedUser();
            }, 10000);
            setNotConnectedUserInterval(interval);
        }

        return clearInterval(notConnectedUserInterval);
    }, [userAddress, room, isChatOpen]);

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
        console.log(userAddress);
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

    domDebug('isModerator', isModerator ? 'true' : '-');
    domDebug('isVerified', isVerified ? 'true' : '-');
    // domDebug('address', userAddress);

    function handleCloseChatPanel() {
        setIsChatOpen(false);
    }

    const scrollToBottomButton = async () => {
        if (!messageEnd.current) return;

        messageEnd.current.scrollTo(0, messageEnd.current.scrollHeight);
        setTimeout(() => {
            if (!messageEnd.current) return;

            setIsScrollToBottomButtonPressed(true);
            messageEnd.current.scrollTo(0, messageEnd.current.scrollHeight);
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
            const scrollPositionBefore = scrollContainer
                ? scrollContainer.scrollTop
                : 1;
            const scrollPositionAfter = scrollContainer
                ? scrollContainer.scrollHeight / 4
                : 1;
            scrollContainer?.scrollTo(
                0,
                scrollPositionAfter - scrollPositionBefore,
            );
        }
    };

    const scrollToBottom = async () => {
        const timer = setTimeout(() => {
            if (!messageEnd.current) return;
            messageEnd.current.scrollTo(0, messageEnd.current.scrollHeight);
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
                    messageEnd.current &&
                    messageEnd.current.getBoundingClientRect() &&
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
                    messageEnd.current &&
                    messageEnd.current.getBoundingClientRect() &&
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
                    messageEnd.current &&
                    messageEnd.current.getBoundingClientRect() &&
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

        if (targetElement != null && messageEnd.current) {
            messageEnd.current.scrollTop =
                getChatBubbleYPos(targetElement, messageEnd.current) - 40;
        }
    };

    const handleConfirmationDialog = (
        confirmationType: number,
        startDate: Date,
    ) => {
        setConfirmationPanelContent(confirmationType);
        setVerifyOldMessagesStartDate(startDate);
        setShowVerifyOldMessagesPanel(true);
    };

    const verifyWallet = (
        verificationType: number,
        verificationDate: Date,
        // eslint-disable-next-line
        e?: React.MouseEvent<HTMLDivElement>,
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
                if (verifyOldMessagesStartDate) {
                    setTimeout(() => {
                        setShowVerifyOldMessagesPanel(false);
                        updateUnverifiedMessages(
                            verifyOldMessagesStartDate,
                            new Date(),
                        );
                    }, 1000);
                }
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
                    {isModerator && isVerified && userAddress && (
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
                    {isVerified && userAddress ? (
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
                            setSelectedMessageForReply={
                                setSelectedMessageForReply
                            }
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

            {/* WBO - Feature : User Summary */}

            <UserSummary
                // isActive={userSummaryActive}
                isActive={userSummaryActive && false}
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
            isInputDisabled={isInputDisabled}
            sendMessageCooldown={sendMessageCooldown}
            selectedMessageForReply={selectedMessageforReply}
            setSelectedMessageForReply={setSelectedMessageForReply}
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

    const contentHeight = isChatOpen ? '479px' : '30px';
    if (props.appPage)
        return (
            <>
                <FullChat
                    messageList={messageList}
                    setIsChatOpen={setIsChatOpen}
                    chatNotification={chatNotification}
                    messageInput={messageInput}
                    userName={
                        userAddress && !ens
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
                    isChatOpen={isChatOpen}
                    isVerified={isVerified}
                    isModerator={isModerator}
                    verifyWallet={verifyWallet}
                    toastrActive={toastrActive}
                    toastrActivator={setToastrActive}
                    toastrText={toastrText}
                    toastrType={toastrType}
                    showVerifyOldMessagesPanel={showVerifyOldMessagesPanel}
                    getConfirmationPanelContent={getConfirmationPanelContent}
                    activateToastr={activateToastr}
                    updateUnverifiedMessages={updateUnverifiedMessages}
                    verifyOldMessagesStartDate={verifyOldMessagesStartDate}
                    confirmationPanelContent={confirmationPanelContent}
                    setShowVerifyOldMessagesPanel={
                        setShowVerifyOldMessagesPanel
                    }
                    showPicker={showPicker}
                    setShowPicker={setShowPicker}
                    addReactionEmojiPickListener={addReactionEmojiPickListener}
                />
            </>
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
                        verifyUser('', new Date());
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
