import styles from './Pagination.module.css';
import { useRef, useEffect, useState } from 'react';
import { BsFillArrowLeftSquareFill, BsFillArrowRightSquareFill } from 'react-icons/bs';
import { motion } from 'framer-motion';
interface PaginationPropsIF {
    postsPerPage: number;
    totalPosts: any;
    paginate: (pageNumber: number) => void;
    currentPage: number;
}
export default function Pagination(props: PaginationPropsIF) {
    console.log(props.currentPage);
    const { postsPerPage, totalPosts, paginate, currentPage } = props;
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
        pageNumbers.push(i);
    }

    const containerRef = useRef<any>();

    useEffect(() => {
        if (containerRef.current !== null) {
            containerRef.current.focus();
        }
    }, []);

    const sideScroll = (element: HTMLDivElement, speed: number, distance: number, step: number) => {
        let scrollAmount = 0;
        const slideTimer = setInterval(() => {
            element.scrollLeft += step;
            scrollAmount += Math.abs(step);
            if (scrollAmount >= distance) {
                clearInterval(slideTimer);
            }
        }, speed);
    };

    const start = (currentPage - 1) * postsPerPage + 1;
    const [end, setEnd] = useState(totalPosts);

    function handleUpdatePageShow() {
        if (postsPerPage < totalPosts) {
            setEnd(postsPerPage * currentPage);

            if (end > totalPosts) {
                setEnd(totalPosts);
            }
        }
    }

    useEffect(() => {
        handleUpdatePageShow();
    }, [currentPage, paginate]);

    const detailPageRendered = ` showing ${start} - ${end} of ${totalPosts} `;

    const totalPages = Math.ceil(totalPosts / postsPerPage);
    console.log(totalPages);

    const [expandPaginationContainer, setExpandPaginationContainer] = useState(false);
    const expandStyle = expandPaginationContainer ? styles.expand : styles.not_expanded;

    return (
        <>
            <nav className={styles.pagination_container}>
                <motion.div
                    transition={{ layout: { duration: 1.6, type: 'spring' } }}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${styles.pagination_inside_container} ${expandStyle}`}
                    onMouseLeave={() => setExpandPaginationContainer(false)}
                >
                    {expandPaginationContainer && (
                        <div
                            className={styles.scroll_button}
                            onClick={() => {
                                sideScroll(containerRef.current, 25, 100, -60);
                            }}
                        >
                            <BsFillArrowLeftSquareFill />
                        </div>
                    )}
                    <ul
                        className={styles.pagination_content}
                        onMouseEnter={() => setExpandPaginationContainer(true)}
                        ref={containerRef}
                    >
                        {pageNumbers.map((number) => (
                            <li
                                key={number}
                                className={
                                    number === currentPage ? styles.page_active : styles.page
                                }
                            >
                                <button onClick={() => paginate(number)}>{number}</button>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.dot}>...</div>
                    <div
                        onClick={() => paginate(totalPages)}
                        className={totalPages === currentPage ? styles.page_active : styles.page}
                    >
                        {totalPages > 10 && totalPages}
                    </div>
                    {expandPaginationContainer && (
                        <div
                            className={styles.scroll_button}
                            onClick={() => {
                                sideScroll(containerRef.current, 25, 100, 60);
                            }}
                        >
                            <BsFillArrowRightSquareFill />
                        </div>
                    )}
                </motion.div>
            </nav>
            <div className={styles.text_info}>{detailPageRendered}</div>
        </>
    );
}
