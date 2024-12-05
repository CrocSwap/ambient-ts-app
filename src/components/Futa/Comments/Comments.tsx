import React, {
    CSSProperties,
    memo,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useParams } from 'react-router-dom';
import { UserDataContext } from '../../../contexts/UserDataContext';
import DomDebugger from '../../Chat/DomDebugger/DomDebugger';
import useChatApi from '../../Chat/Service/ChatApi';
import CommentCard from './CommentCard/CommentCard';
import CommentInput from './CommentInput/CommentInput';
import styles from './Comments.module.css';
import useCommentsWS from './useCommentsWS';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AppStateContext } from '../../../contexts/AppStateContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import useOnBoundryChange from '../../../utils/hooks/useOnBoundryChange';
import {
    checkVisibilityWithBottom,
    dropFromCssClasses,
} from '../../Chat/ChatUtils';
import { domDebug } from '../../Chat/DomDebugger/DomDebuggerUtils';

type ShimmerListProps = {
    count: number;
};

const ShimmerList: React.FC<ShimmerListProps> = ({ count }) => {
    return (
        <div className={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <div className={styles.shimmer} key={index}></div>
            ))}
        </div>
    );
};

interface propsIF {
    isForTrade?: boolean;
    isSmall?: boolean;
    resizeEffectorSelector?: string;
}

function Comments(props: propsIF) {
    const { activeNetwork } = useContext(AppStateContext);
    const { baseToken, quoteToken, isDenomBase } = useContext(TradeDataContext);
    const { ticker } = useParams();

    const getRoom = () => {
        if (props.isForTrade) {
            const tokenA = isDenomBase ? baseToken : quoteToken;
            const tokenB = isDenomBase ? quoteToken : baseToken;

            return tokenA.symbol + ' / ' + tokenB.symbol;
        } else {
            return ticker + ' / ETH';
        }
    };
    const room = getRoom();

    const messageListRef = useRef<HTMLDivElement | null>(null);

    const [page, setPage] = useState(0);
    const [fetchedAllPages, setFetchedAllPages] = useState(false);
    const [showPrevButton, setShowPrevButton] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [scrollBackTarget, setScrollBackTarget] = useState('');
    const [panelScrollTop, setPanelScrollTop] = useState(0);
    const [panelScrollToBottomDist, setPanelScrollToBottomDist] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [panelMaxHeight, setPanelMaxHeight] = useState(0);

    const fetchListener = () => {
        if (messageListRef && messageListRef.current) {
            messageListRef.current.scrollTo({
                top: messageListRef.current.scrollHeight,
                left: 0,
                behavior: 'instant' as ScrollBehavior,
            });
        }
    };
    const {
        messages,
        isLoading,
        sendMsg,
        isWsConnected,
        getMsgWithRestWithPagination,
    } = useCommentsWS(room ? room : '', fetchListener, '');
    const [userId, setUserId] = useState('');
    const { userAddress, ensName, isUserConnected } =
        useContext(UserDataContext);
    const { saveUser } = useChatApi();
    const [fetchedMessageCount, setFetchedMessageCount] = useState(0);

    const autoScrollTreshold = 100;

    const initialSave = async () => {
        if (userAddress && userAddress.length > 0) {
            const data = await saveUser(userAddress, ensName ? ensName : '');
            setUserId(data.userData._id);
        } else {
            setUserId('');
        }
    };

    const bindMaxHeight = () => {
        if (props.resizeEffectorSelector) {
            const tradeWrapper = document.getElementById(
                props.resizeEffectorSelector,
            );
            if (tradeWrapper) {
                const tradeSectionHeight =
                    tradeWrapper.getBoundingClientRect().height;
                domDebug('screen height', window.screen.height);
                domDebug('trader section height', tradeSectionHeight);
                setPanelMaxHeight(window.innerHeight - tradeSectionHeight - 90);
            }
        }
    };

    useOnBoundryChange(
        props.resizeEffectorSelector ? props.resizeEffectorSelector : '',
        200,
        () => {
            bindMaxHeight();
        },
    );

    const initialResizing = () => {
        if (props.isSmall) {
            bindMaxHeight();
        }
        if (window) {
            window.addEventListener('resize', () => {
                bindMaxHeight();
            });
        }
    };

    const getMainContainerStyle = () => {
        const ret: CSSProperties = {};

        if (panelMaxHeight) {
            ret.maxHeight = panelMaxHeight + 'px';
        }

        return ret;
    };

    useEffect(() => {
        initialSave();
        initialResizing();
    }, []);

    useEffect(() => {
        // handle auto scroll to bottom
        if (messageListRef && messageListRef.current) {
            const diff = assignPanelScrollDistances();
            if (diff < autoScrollTreshold) {
                scrollToBottom();
            }
        }
        setTimeout(() => {
            handleUnreadMessages();
        }, 500);
    }, [messages]);

    useEffect(() => {
        initialSave();
    }, [userAddress]);

    useEffect(() => {
        setShowPrevButton(false);
        setPage(0);
        setFetchedAllPages(false);
        setFetchedMessageCount(0);
        setUnreadMessageCount(0);
    }, [room]);

    useEffect(() => {
        domDebug('fetchedMsgCount', fetchedMessageCount);
    }, [fetchedMessageCount]);

    useEffect(() => {
        assignScrollButtonVisibility();
    }, [panelScrollToBottomDist, panelScrollTop]);

    const assignScrollButtonVisibility = () => {
        setShowScrollToBottom(panelScrollToBottomDist > 50);
        setShowPrevButton(panelScrollTop < 20 && panelScrollToBottomDist > 50);
    };

    const calculateScrollTarget = (messageId: string) => {
        if (
            messageListRef &&
            messageListRef.current &&
            messageId &&
            messageId.length > 0
        ) {
            const msgEl = document.querySelector(
                '.commentBubble[data-message-id="' + messageId + '"]',
            );
            if (msgEl) {
                const msgElOffsetTop = (msgEl as HTMLElement).offsetTop;
                const target = msgElOffsetTop;

                return target;
            }
            return messageListRef.current.scrollHeight;
        }
        return 0;
    };

    const scrollToMessage = (messageId: string, instant: boolean) => {
        const scrollTopPadding = -100;
        const msgEl = document.querySelector(
            '.commentBubble[data-message-id="' + messageId + '"]',
        );
        if (msgEl && messageListRef.current) {
            // messageListWrapper.current.scrollTop = messageListWrapper.current.scrollHeight - msgElOffsetTop + msgElHeight - messageListWrapper.current.getBoundingClientRect().height;
            setTimeout(() => {
                const target = calculateScrollTarget(messageId);
                if (messageListRef && messageListRef.current) {
                    if (instant) {
                        messageListRef.current.scrollTo({
                            top: target + scrollTopPadding,
                            left: 0,
                            behavior: 'instant' as ScrollBehavior,
                        });
                    } else {
                        messageListRef.current.scrollTop =
                            target + scrollTopPadding;
                    }
                }
            }, 100);
        }
    };

    const assignLastSeenMessage = () => {
        if (messageListRef && messageListRef.current) {
            const rect = messageListRef.current.getBoundingClientRect();
            const bubbles = document.querySelectorAll('.commentBubble');
            for (let i = 0; i < bubbles.length; i++) {
                const el = bubbles[i];
                if (el.getBoundingClientRect().top > rect.top) {
                    const msgId = el.getAttribute('data-message-id');
                    setScrollBackTarget(msgId ? msgId : '');
                    break;
                }
            }
        }
    };

    const assignPanelScrollDistances = () => {
        if (messageListRef && messageListRef.current) {
            const scrollTop = messageListRef.current.scrollTop;
            const scrollHeight = messageListRef.current.scrollHeight;
            const clientHeight = messageListRef.current.clientHeight;
            const scrollToBottomDist = scrollHeight - scrollTop - clientHeight;
            setPanelScrollToBottomDist(scrollToBottomDist);
            setPanelScrollTop(scrollTop);
        }

        return panelScrollToBottomDist;
    };

    const scrollToBottom = () => {
        if (messageListRef && messageListRef.current) {
            messageListRef.current.scrollTop =
                messageListRef.current.scrollHeight;
        }
    };

    const commentInputDispatch = (msg: string) => {
        if (room && userAddress && msg.length > 0) {
            sendMsg(
                userId,
                msg,
                room,
                ensName ? ensName : '',
                userAddress,
                null,
                null,
                activeNetwork.chainId,
            );
            setTimeout(() => {
                scrollToBottom();
            }, 200);
        }
    };

    const fetchPrevious = async () => {
        setFetchedMessageCount(messages.length);
        const data = await getMsgWithRestWithPagination(room, page + 1);
        setPage(page + 1);
        if (data.length == 0) {
            setShowPrevButton(false);
            setFetchedAllPages(true);
        }
        scrollToMessage(scrollBackTarget, true);
        setScrollBackTarget('');
    };

    const handleUnreadMessages = () => {
        setTimeout(() => {
            document.querySelectorAll('.unreadComment').forEach((el) => {
                if (
                    checkVisibilityWithBottom(
                        el as HTMLElement,
                        messageListRef.current,
                    )
                ) {
                    setTimeout(() => {
                        dropFromCssClasses(el as HTMLElement, 'unread');
                        setUnreadMessageCount(
                            document.querySelectorAll('.unreadComment').length,
                        );
                    }, 1000);
                }
            });

            setTimeout(() => {
                setUnreadMessageCount(
                    document.querySelectorAll('.unreadComment').length,
                );
            }, 500);
        }, 1000);
    };

    const goToUnreadMessages = () => {
        const unreadComments = document.querySelectorAll('.unreadComment');
        if (unreadComments.length > 0) {
            const firstUnread = unreadComments[0];
            scrollToMessage(
                (firstUnread as HTMLElement).getAttribute(
                    'data-message-id',
                ) as string,
                false,
            );
        }

        handleUnreadMessages();
    };

    const _handleScroll = () => {
        assignPanelScrollDistances();
        assignLastSeenMessage();
        handleUnreadMessages();
    };

    return (
        <>
            <div
                className={`${styles.comments_outer} ${props.isSmall ? styles.small : ' '}`}
            >
                {userAddress &&
                    userAddress.length > 0 &&
                    !props.isSmall &&
                    !props.isForTrade && (
                        <div className={styles.connection_status}>
                            {isWsConnected ? (
                                <>
                                    <div
                                        className={styles.connection_dot}
                                    ></div>
                                    <div
                                        className={styles.connection_dot_anim}
                                    ></div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className={styles.loading_dots_wrapper}
                                    >
                                        <div
                                            className={styles.loading_dot}
                                        ></div>
                                        <div
                                            className={styles.loading_dot}
                                        ></div>
                                        <div
                                            className={styles.loading_dot}
                                        ></div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                <div
                    id='futa_comments_wrapper'
                    className={`${styles.mainContainer} ${props.isSmall ? styles.small : ' '}  ${props.isForTrade ? styles.tradePage : ' '}`}
                    style={getMainContainerStyle()}
                >
                    {isLoading ? (
                        <ShimmerList count={25} />
                    ) : (
                        <>
                            <div
                                ref={messageListRef}
                                className={`${styles.commentsWrapper} ${messages.length == 0 ? styles.no_comments_wrapper : ''} `}
                                onScroll={_handleScroll}
                            >
                                {messages.length == 0 ? (
                                    <span className={styles.no_comment_section}>
                                        {isUserConnected
                                            ? `Start the ${props.isForTrade ? getRoom() : ticker} comment thread below`
                                            : `Connect your wallet to comment on ${props.isForTrade ? getRoom() : ticker}`}
                                    </span>
                                ) : (
                                    <>
                                        <div
                                            className={styles.comments_content}
                                        >
                                            {fetchedAllPages && (
                                                <div
                                                    className={
                                                        styles.all_fetched
                                                    }
                                                >
                                                    {' '}
                                                    All comments fetched.
                                                </div>
                                            )}
                                            {messages.map((msg, index) => {
                                                return (
                                                    <CommentCard
                                                        key={msg._id}
                                                        style={{
                                                            animationDelay: `${(messages.length - index - fetchedMessageCount) * 0.015}s`,
                                                        }}
                                                        message={msg}
                                                        previousMessage={
                                                            index > 0
                                                                ? messages[
                                                                      index - 1
                                                                  ]
                                                                : undefined
                                                        }
                                                        currentUserID={userId}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {showPrevButton && !fetchedAllPages && (
                                <IoIosArrowUp
                                    title='Get Previous Messages'
                                    className={`${styles.floating_scroll_btn} ${styles.show_previous_comments_btn}`}
                                    onClick={fetchPrevious}
                                />
                            )}

                            {showScrollToBottom && (
                                <IoIosArrowDown
                                    title='Scroll to Bottom'
                                    className={`${styles.floating_scroll_btn} ${styles.scroll_to_bottom_btn}`}
                                    onClick={scrollToBottom}
                                />
                            )}

                            {unreadMessageCount > 0 &&
                                panelScrollToBottomDist > 50 && (
                                    <div
                                        className={styles.unread_messages_info}
                                        onClick={goToUnreadMessages}
                                    >
                                        {' '}
                                        {unreadMessageCount} new message
                                        {unreadMessageCount > 1 ? 's' : ''}
                                    </div>
                                )}
                            <CommentInput
                                commentInputDispatch={commentInputDispatch}
                                currentUserID={userId}
                            />
                        </>
                    )}
                    <DomDebugger />
                </div>
            </div>
        </>
    );
}

export default memo(Comments);
