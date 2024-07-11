import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Comments.module.css';
import useCommentsWS from './useCommentsWS';
import CommentCard from './CommentCard/CommentCard';
import CommentInput from './CommentInput/CommentInput';
import { UserDataContext } from '../../../contexts/UserDataContext';
import useChatApi from '../../Chat/Service/ChatApi';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import DomDebugger from '../../Chat/DomDebugger/DomDebugger';
// import { domDebug } from '../../Chat/DomDebugger/DomDebuggerUtils';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
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

function Comments() {
    const { ticker } = useParams();
    const room = ticker + ' / ETH';

    const messageListRef = useRef<HTMLDivElement | null>(null);

    const [page, setPage] = useState(0);
    const [showPrevButton, setShowPrevButton] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [scrollBackTarget, setScrollBackTarget] = useState('');
    const [panelScrollTop, setPanelScrollTop] = useState(0);
    const [panelScrollToBottomDist, setPanelScrollToBottomDist] = useState(0);

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
    const { userAddress, ensName } = useContext(UserDataContext);
    const { selectedNetwork } = useContext(CrocEnvContext);
    const { saveUser } = useChatApi();

    const autoScrollTreshold = 100;

    const initialSave = async () => {
        if (userAddress && userAddress.length > 0) {
            const data = await saveUser(userAddress, ensName ? ensName : '');
            setUserId(data.userData._id);
        } else {
            setUserId('');
        }
    };
    useEffect(() => {
        initialSave();
    }, []);

    useEffect(() => {
        if (scrollBackTarget.length > 0) {
            console.log(scrollBackTarget);
        }

        // handle auto scroll to bottom
        if (
            messageListRef &&
            messageListRef.current
            // && messageListRef.current.scrollTop - messageListRef.current.scrollHeight <= autoScrollTreshold
        ) {
            // const scrollTop = messageListRef.current.scrollTop;
            // const scrollHeight = messageListRef.current.scrollHeight;
            // const clientHeight = messageListRef.current.clientHeight;
            // const scrollToBottomDist = scrollHeight - scrollTop - clientHeight;
            const diff = assignPanelScrollDistances();
            if (diff < autoScrollTreshold) {
                scrollToBottom();
            }
        }
    }, [messages]);

    useEffect(() => {
        initialSave();
    }, [userAddress]);

    useEffect(() => {
        setShowPrevButton(false);
        setPage(0);
    }, [room]);

    useEffect(() => {
        assignScrollButtonVisibility();
    }, [panelScrollToBottomDist, panelScrollTop]);

    const assignScrollButtonVisibility = () => {
        setShowPrevButton(panelScrollTop < 20);
        setShowScrollToBottom(panelScrollToBottomDist > 50);
    };

    const assignPanelScrollDistances = () => {
        if (messageListRef && messageListRef.current) {
            const scrollTop = messageListRef.current.scrollTop;
            const scrollHeight = messageListRef.current.scrollHeight;
            const clientHeight = messageListRef.current.clientHeight;
            const scrollToBottomDist = scrollHeight - scrollTop - clientHeight;
            setPanelScrollToBottomDist(scrollToBottomDist);
            setPanelScrollTop(scrollTop);
            domDebug('to bottom dist', scrollToBottomDist);
            domDebug('scroll top ', scrollTop);
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
                selectedNetwork.chainId,
            );
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    };

    const fetchPrevious = async () => {
        const data = await getMsgWithRestWithPagination(room, page + 1);
        setPage(page + 1);
        if (data.length == 0) {
            setShowPrevButton(false);
        }
        setScrollBackTarget('');
    };

    const _handleScroll = () => {
        assignPanelScrollDistances();
    };

    return (
        <div className={styles.mainContainer}>
            {isLoading ? (
                <ShimmerList count={25} />
            ) : (
                <>
                    <div className={styles.connection_status}>
                        {isWsConnected ? (
                            <>
                                <div className={styles.connection_dot}></div>
                                <div
                                    className={styles.connection_dot_anim}
                                ></div>
                            </>
                        ) : (
                            <>
                                <div className={styles.loading_dots_wrapper}>
                                    <div className={styles.loading_dot}></div>
                                    <div className={styles.loading_dot}></div>
                                    <div className={styles.loading_dot}></div>
                                </div>
                            </>
                        )}
                    </div>

                    <div
                        ref={messageListRef}
                        className={`${styles.commentsWrapper} ${messages.length == 0 ? styles.no_comments_wrapper : ''} `}
                        onScroll={_handleScroll}
                    >
                        {messages.length == 0 ? (
                            <span className={styles.no_comment_section}>
                                {' '}
                                No comment for this ticker
                            </span>
                        ) : (
                            <>
                                <div className={styles.comments_content}>
                                    {messages.map((msg, index) => {
                                        return (
                                            <CommentCard
                                                key={msg._id}
                                                message={msg}
                                                previousMessage={
                                                    index > 0
                                                        ? messages[index - 1]
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

                    {showPrevButton && (
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

                    {/* </div> */}
                    <CommentInput
                        commentInputDispatch={commentInputDispatch}
                        currentUserID={userId}
                    />
                </>
            )}
            <DomDebugger />
        </div>
    );
}

export default memo(Comments);
