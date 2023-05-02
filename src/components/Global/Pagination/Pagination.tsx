import styles from './Pagination.module.css';
import { useRef, useEffect, useState, useMemo } from 'react';
import { IoMdArrowDropleft, IoMdArrowDropright } from 'react-icons/io';
import { motion } from 'framer-motion';
interface PaginationPropsIF {
    itemsPerPage: number;
    totalItems: number;
    paginate: (pageNumber: number) => void;
    currentPage: number;
}
export default function Pagination(props: PaginationPropsIF) {
    const { itemsPerPage, totalItems, paginate, currentPage } = props;

    const pageNumbers = useMemo(() => {
        const nums = [];
        for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
            nums.push(i);
        }
        return nums;
    }, [itemsPerPage, totalItems]);

    // eslint-disable-next-line
    const containerRef = useRef<any>();

    useEffect(() => {
        if (containerRef.current !== null) {
            containerRef.current.focus();
        }
    }, []);

    const sideScroll = (
        element: HTMLDivElement,
        speed: number,
        distance: number,
        step: number,
    ) => {
        let scrollAmount = 0;
        const slideTimer = setInterval(() => {
            element.scrollLeft += step;
            scrollAmount += Math.abs(step);
            if (scrollAmount >= distance) {
                clearInterval(slideTimer);
            }
        }, speed);
    };

    const start = (currentPage - 1) * itemsPerPage + 1;
    const [end, setEnd] = useState(totalItems);

    function handleUpdatePageShow() {
        if (itemsPerPage >= totalItems) {
            setEnd(totalItems);
            return;
        }

        switch (totalItems % itemsPerPage) {
            case 0:
                setEnd(itemsPerPage * currentPage);
                break;
            default:
                setEnd(Math.min(itemsPerPage * currentPage, totalItems));
                break;
        }
    }

    const memoizedHandleUpdatePageShow = useMemo(
        () => handleUpdatePageShow,
        [currentPage, itemsPerPage, totalItems],
    );

    useEffect(() => {
        memoizedHandleUpdatePageShow();
    }, [currentPage, itemsPerPage, totalItems, memoizedHandleUpdatePageShow]);

    const detailPageRendered = ` showing ${start} - ${end} of ${totalItems} `;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const [expandPaginationContainer] = useState(true);
    const expandStyle = expandPaginationContainer
        ? styles.expand
        : styles.not_expanded;

    const handleButtonClick = (newPage: number, scrollStep: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            sideScroll(containerRef.current, 25, 100, scrollStep);
            paginate(newPage);
        }
    };

    const handleLeftButtonClick = () => {
        handleButtonClick(currentPage - 1, -60);
    };

    const handleRightButtonClick = () => {
        handleButtonClick(currentPage + 1, 60);
    };

    const handleNumberClick = (page: number) => {
        paginate(page);
    };
    const rightButton = (
        <div
            className={styles.scroll_button}
            onClick={() => handleRightButtonClick()}
        >
            <IoMdArrowDropright size={30} />
        </div>
    );

    const leftButton = (
        <div
            className={styles.scroll_button}
            onClick={() => handleLeftButtonClick()}
        >
            <IoMdArrowDropleft size={30} />
        </div>
    );

    return (
        <>
            <nav className={styles.pagination_container}>
                <motion.div
                    transition={{ layout: { duration: 1.6, type: 'spring' } }}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${styles.pagination_inside_container} ${expandStyle}`}
                >
                    {currentPage > 1 && leftButton}
                    <div
                        className={styles.pagination_content}
                        ref={containerRef}
                    >
                        {pageNumbers.map((number) => (
                            <li
                                key={number}
                                className={
                                    number === currentPage
                                        ? styles.page_active
                                        : styles.page
                                }
                            >
                                <button
                                    onClick={() => handleNumberClick(number)}
                                >
                                    {number}
                                </button>
                            </li>
                        ))}
                    </div>
                    {currentPage !== totalPages && rightButton}
                </motion.div>
            </nav>
            <div className={styles.text_info}>{detailPageRendered}</div>
        </>
    );
}
