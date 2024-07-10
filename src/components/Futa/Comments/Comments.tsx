import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Comments.module.css';
import useCommentsWS from './useCommentsWS';
import CommentCard from './CommentCard/CommentCard';
import CommentInput from './CommentInput/CommentInput';
import { UserDataContext } from '../../../contexts/UserDataContext';
import useChatApi from '../../Chat/Service/ChatApi';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

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
    const { ticker: room } = useParams();

    const messageListRef = useRef<HTMLDivElement | null>(null);

    const fetchListener = () => {
        if (messageListRef && messageListRef.current) {
            messageListRef.current.scrollTo({
                top: messageListRef.current.scrollHeight,
                left: 0,
                behavior: 'instant' as ScrollBehavior,
            });
        }
    };

    const { messages, isLoading, sendMsg, isWsConnected } = useCommentsWS(
        room ? room + ' / ETH' : '',
        fetchListener,
        '',
    );
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
        if (
            messageListRef &&
            messageListRef.current
            // && messageListRef.current.scrollTop - messageListRef.current.scrollHeight <= autoScrollTreshold
        ) {
            const scrollTop = messageListRef.current.scrollTop;
            const scrollHeight = messageListRef.current.scrollHeight;
            const clientHeight = messageListRef.current.clientHeight;
            const scrollToBottomDist = scrollHeight - scrollTop - clientHeight;
            if (scrollToBottomDist < autoScrollTreshold) {
                scrollToBottom();
            }
        }
    }, [messages]);

    useEffect(() => {
        initialSave();
    }, [userAddress]);

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
                room + ' / ETH',
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

    // const _handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    //     console.log(e.currentTarget.scrollTop);
    // }

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
                        // onScroll={_handleScroll}
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
                    <CommentInput
                        commentInputDispatch={commentInputDispatch}
                        currentUserID={userId}
                    />
                </>
            )}
        </div>
    );
}

export default memo(Comments);
