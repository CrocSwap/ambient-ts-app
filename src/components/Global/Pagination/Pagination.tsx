import styles from './Pagination.module.css';
import { useRef, useEffect, useState } from 'react';
// import { BiDotsHorizontal } from 'react-icons/bi';
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
    const pageNumbers: number[] = [];

    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

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
        if (itemsPerPage < totalItems) {
            if (totalItems > currentPage * itemsPerPage) {
                // If there are more items to show after the current page,
                // set the end index to the last item on the current page.
                setEnd(itemsPerPage * currentPage);
            } else if (totalItems % itemsPerPage === 0) {
                // If the total number of items is a multiple of the items per page,
                // set the end index to the last item on the last page.
                setEnd(totalItems);
            } else {
                // If the total number of items is not a multiple of the items per page,
                // set the end index to the last item on the last page, which will have fewer items.
                setEnd(
                    itemsPerPage * (currentPage - 1) +
                        (totalItems % itemsPerPage),
                );
            }
        } else {
            // If there are no items to paginate, set the end index to 0.
            setEnd(0);
        }
    }

    useEffect(() => {
        handleUpdatePageShow();
    }, [currentPage, paginate]);

    const detailPageRendered = ` showing ${start} - ${end} of ${totalItems} `;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const [expandPaginationContainer] = useState(true);
    // const [expandPaginationContainer, setExpandPaginationContainer] = useState(false);
    const expandStyle = expandPaginationContainer
        ? styles.expand
        : styles.not_expanded;

    const handleLeftButtonClick = () => {
        sideScroll(containerRef.current, 25, 100, -60);
        if (currentPage > 1) {
            paginate(currentPage - 1);
        } else return;
    };
    const handlerightButtonClick = () => {
        sideScroll(containerRef.current, 25, 100, 60);
        if (currentPage < totalPages) {
            paginate(currentPage + 1);
        } else return;
    };

    const handleNumberClick = (page: number) => {
        // const rightScrollNumber = 60 * page

        // sideScroll(containerRef.current, 25, 100, rightScrollNumber);

        paginate(page);
    };
    const rightButton = (
        <div
            className={styles.scroll_button}
            onClick={() => handlerightButtonClick()}
        >
            <IoMdArrowDropright size={30} />
        </div>
    );

    const leftButton = (
        <div
            className={styles.scroll_button}
            // onClick={() => {
            //     sideScroll(containerRef.current, 25, 100, -60);
            // }}
            onClick={() => handleLeftButtonClick()}
        >
            <IoMdArrowDropleft size={30} />
        </div>
    );

    // const lastPageClick = (
    //     <div
    //         onClick={() => paginate(totalPages)}
    //         className={totalPages === currentPage ? styles.page_active : styles.page}
    //         style={{ cursor: 'pointer' }}
    //     >
    //         {totalPages > 10 && totalPages}
    //     </div>
    // );

    return (
        <>
            <nav className={styles.pagination_container}>
                <motion.div
                    transition={{ layout: { duration: 1.6, type: 'spring' } }}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${styles.pagination_inside_container} ${expandStyle}`}
                    // onMouseLeave={() => setExpandPaginationContainer(false)}
                >
                    {currentPage > 1 && leftButton}
                    <div
                        className={styles.pagination_content}
                        // onMouseEnter={() => setExpandPaginationContainer(true)}
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
