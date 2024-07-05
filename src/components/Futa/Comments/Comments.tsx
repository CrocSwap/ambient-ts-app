import React, { memo } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Comments.module.css';
import useCommentsWS from './useCommentsWS';
import CommentCard from './CommentCard/CommentCard';

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

    const { messages, isLoading } = useCommentsWS(room ? room : '', '');

    console.log('...........');
    console.log(messages);

    return (
        <div className={styles.mainContainer}>
            {isLoading ? (
                <ShimmerList count={25} />
            ) : (
                <div className={styles.commentsWrapper}>
                    {messages.length == 0 ? (
                        <span> No comment for this ticker</span>
                    ) : (
                        <>
                            {messages.map((msg) => {
                                return (
                                    <CommentCard key={msg._id} message={msg} />
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default memo(Comments);
