import {
    Dispatch,
    memo,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react';
import { RiArrowUpSLine } from 'react-icons/ri';
import {} from '../../../ambient-utils/api';
import {
    LimitOrderIF,
    PositionIF,
    TransactionIF,
} from '../../../ambient-utils/types';
import {
    ScrollToTopButton,
    ScrollToTopButtonMobile,
} from '../../../styled/Components/TransactionTable';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import TableRows from '../TradeTabs/TableRows';
import { LimitSortType } from '../TradeTabs/useSortedLimits';
import { RangeSortType } from '../TradeTabs/useSortedPositions';
import { TxSortType } from '../TradeTabs/useSortedTxs';
import styles from './TableRowsInfiniteScroll.module.css';

interface propsIF {
    type: 'Transaction' | 'Order' | 'Range';
    data: TransactionIF[] | LimitOrderIF[] | PositionIF[];
    tableView: 'small' | 'medium' | 'large';
    isAccountView: boolean;
    fetcherFunction: () => void;
    sortBy: TxSortType | LimitSortType | RangeSortType;
    showAllData: boolean;
    pagesVisible: [number, number];
    setPagesVisible: Dispatch<SetStateAction<[number, number]>>;
    moreDataAvailable: boolean;
    extraPagesAvailable: number;
    pageDataCount?: number[];
    dataPerPage?: number;
    tableKey?: string;
    lastFetchedCount?: number;
    setLastFetchedCount?: Dispatch<SetStateAction<number>>;
    moreDataLoading: boolean;
    componentLock?: boolean;
    scrollOnTopTresholdRatio?: number;
}

enum ScrollDirection {
    UP,
    DOWN,
}

enum InfScrollAction {
    SHIFT_UP,
    SHIFT_DOWN,
    ADD_MORE_DATA,
    SLIGHT_SCROLL,
    SUCCESS,
    FAIL,
}

enum ScrollPosition {
    TOP,
    BOTTOM,
}

function TableRowsInfiniteScroll({
    type,
    data,
    isAccountView,
    tableView,
    fetcherFunction,
    sortBy,
    showAllData,
    pagesVisible,
    setPagesVisible,
    moreDataAvailable,
    extraPagesAvailable,
    tableKey,
    pageDataCount,
    dataPerPage,
    lastFetchedCount,
    setLastFetchedCount,
    moreDataLoading,
    componentLock,
    scrollOnTopTresholdRatio,
}: propsIF) {
    const isIOS = (): boolean => {
        const userAgent = navigator.userAgent;
        return /iPad|iPhone|iPod/.test(userAgent);
    };

    // added to debug infinite scroll on monadTestnet link
    // can be removed after detecting issue
    const [debugMode, setDebugMode] = useState(false);
    const debugModeRef = useRef<boolean>();
    debugModeRef.current = debugMode;

    const [shortcutAdded, setShortcutAdded] = useState(false);

    useEffect(() => {
        document.addEventListener('keydown', (e) => {
            if (
                (e.shiftKey && e.altKey && e.key === 'j') ||
                (e.shiftKey && e.altKey && e.key === 'J')
            ) {
                setDebugMode(!debugModeRef.current);
            }
        });
        setShortcutAdded(true);
    }, [shortcutAdded == false]);

    const isSmallScreen: boolean = useMediaQuery('(max-width: 768px)');

    const wrapperID = tableKey ? tableKey : '';

    const txSpanSelectorForScrollMethod = `#infinite_scroll_wrapper_${wrapperID} div[data-label='hidden-id'] > span`;
    const txSpanSelectorForBindMethod = 'div[data-label="hidden-id"]';

    const markRows = false;
    const [manualMode, setManualMode] = useState(false);
    const manualModeRef = useRef<boolean>();
    manualModeRef.current = manualMode;

    const [showManualScrollDown, setShowManualScrollDown] = useState(false);
    const [showManualScrollUp, setShowManualScrollUp] = useState(false);

    const moreDataLoadingRef = useRef<boolean>();
    moreDataLoadingRef.current = moreDataLoading;

    const componentLockRef = useRef<boolean>();
    componentLockRef.current = componentLock;

    const lastRowRef = useRef<HTMLDivElement | null>(null);
    const firstRowRef = useRef<HTMLDivElement | null>(null);

    const [lastSeenTxID, setLastSeenTxID] = useState<string>('');
    const lastSeenTxIDRef = useRef<string>();
    lastSeenTxIDRef.current = lastSeenTxID;

    const [firstSeenTxID, setFirstSeenTxID] = useState<string>('');
    const firstSeenTxIDRef = useRef<string>();
    firstSeenTxIDRef.current = firstSeenTxID;

    const [autoScroll, setAutoScroll] = useState(false);
    const autoScrollRef = useRef<boolean>();
    autoScrollRef.current = autoScroll;

    const [autoScrollDirection, setAutoScrollDirection] = useState(
        ScrollDirection.DOWN,
    );
    const autoScrollDirectionRef = useRef<ScrollDirection>();
    autoScrollDirectionRef.current = autoScrollDirection;

    const [isTableReady, setIsTableReady] = useState(true);
    const isTableReadyRef = useRef<boolean>();
    isTableReadyRef.current = isTableReady;

    const extraPagesAvailableRef = useRef<number>();
    extraPagesAvailableRef.current = extraPagesAvailable;

    const pagesVisibleRef = useRef<[number, number]>();
    pagesVisibleRef.current = pagesVisible;

    const moreDataAvailableRef = useRef<boolean>();
    moreDataAvailableRef.current = moreDataAvailable;

    const [shiftLock, setShiftLock] = useState(false);
    const shiftLockRef = useRef<boolean>();
    shiftLockRef.current = shiftLock;

    const [reqLock, setReqLock] = useState(false);
    const reqLockRef = useRef<boolean>();
    reqLockRef.current = reqLock;

    const [actionHistory, setActionHistory] = useState('');

    const bindTmLockAutoScroll = () => {
        const baseTimeout = 2000;
        if (lastFetchedCount && lastFetchedCount > 0) {
            if (lastFetchedCount >= 30) {
                return baseTimeout;
            } else if (lastFetchedCount >= 15) {
                return baseTimeout * 0.75;
            } else {
                return baseTimeout * 0.5;
            }
        } else {
            return baseTimeout;
        }
    };

    const tmReadyState = 100;
    const tmLockShift = 500;
    const tmLockReq = 700;
    const tmLockAutoScroll = bindTmLockAutoScroll();

    const bindWrapperEl = () => {
        if (isSmallScreen) {
            return document.getElementById(
                `infinite_scroll_wrapper_${wrapperID}`,
            )?.parentElement;
        } else {
            return document.getElementById(
                `infinite_scroll_wrapper_${wrapperID}`,
            )?.parentElement?.parentElement?.parentElement;
        }
    };

    const wrapperEl = bindWrapperEl();

    const bindTableReadyState = (newState: boolean) => {
        if (newState === true) {
            setIsTableReady(true);
        } else {
            setIsTableReady(false);
        }
    };

    const scrollToTop = () => {
        setActionHistory('');
        setLastSeenTxID('');
        setPagesVisible([0, 1]);
        if (wrapperEl) {
            wrapperEl.scrollTo({
                top: 0,
                behavior: 'instant' as ScrollBehavior,
            });

            setTimeout(() => {
                wrapperEl.scrollTo({
                    top: 0,
                    behavior: 'instant' as ScrollBehavior,
                });
                doIphoneFix();
            }, tmReadyState);
        }
        lockShift();
    };

    const triggerAutoScroll = (direction: ScrollDirection) => {
        bindTableReadyState(true);
        setAutoScroll(true);
        setAutoScrollDirection(direction);
        setTimeout(() => {
            setAutoScroll(false);
        }, tmLockAutoScroll);
        setTimeout(() => {
            bindTableReadyState(true);
        }, tmReadyState);
    };

    const lockShift = () => {
        setShiftLock(true);
        setTimeout(() => {
            setShiftLock(false);
        }, tmLockShift);
    };

    const shiftUp = (): void => {
        if (shiftLockRef.current === true) {
            bindTableReadyState(true);
            return;
        }
        lockShift();
        setTimeout(() => {
            bindTableReadyState(true);
        }, tmReadyState);
        setPagesVisible((prev) => [prev[0] - 1, prev[1] - 1]);
        triggerAutoScroll(ScrollDirection.UP);
        addToActionHistory(InfScrollAction.SHIFT_UP);
    };

    const shiftDown = (): void => {
        if (shiftLockRef.current === true) {
            bindTableReadyState(true);
            return;
        }
        lockShift();
        setTimeout(() => {
            bindTableReadyState(true);
        }, tmReadyState);
        setPagesVisible((prev) => [prev[0] + 1, prev[1] + 1]);
        triggerAutoScroll(ScrollDirection.DOWN);
        addToActionHistory(InfScrollAction.SHIFT_DOWN);
    };

    const renderDebugData = () => {
        if (debugMode) {
            const renderedRows = document.querySelectorAll(
                txSpanSelectorForScrollMethod,
            ).length;

            return (
                <>
                    <span style={{ fontSize: '.72rem' }}>
                        <div
                            style={{
                                display: 'none',
                                padding: '.5rem 1rem',
                                background: 'black',
                                color: `${isTableReady ? 'rgba(0, 255,0)' : 'rgba(255, 0,0)'}`,
                                position: 'absolute',
                                left: '1rem',
                                top: '1.7rem',
                            }}
                            onClick={() => {
                                setManualMode(!manualModeRef.current);
                            }}
                        >
                            Ready? :{' '}
                        </div>
                        <div
                            style={{
                                display: 'none',
                                padding: '.5rem 1rem',
                                background: 'black',
                                color: 'rgba(0, 255,0)',
                                opacity: manualModeRef.current ? '1' : '.7',
                                position: 'absolute',
                                right: '3rem',
                                top: '0rem',
                            }}
                            onClick={() => {
                                setManualMode(!manualModeRef.current);
                            }}
                        >
                            {manualModeRef.current ? 'Manual' : 'Auto'} Mode
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                background: 'black',
                                color: 'rgba(0, 255,0)',
                                left: '1rem',
                                top: '3rem',
                            }}
                        >
                            Page:{' '}
                            {pagesVisibleRef.current
                                ? pagesVisibleRef.current[0]
                                : ''}
                        </div>
                        <div
                            style={{
                                display: 'none',
                                position: 'absolute',
                                background: 'black',
                                color: 'rgba(0, 255,0)',
                                left: '2rem',
                                top: '1.2rem',
                            }}
                        >
                            Rows : {renderedRows}
                        </div>
                        <div
                            style={{
                                left: '1rem',
                                top: '0rem',
                                color: 'rgba(255, 150,30)',
                                position: 'absolute',
                                background: 'black',
                            }}
                        >
                            {actionHistory}
                        </div>
                        <div
                            style={{
                                right: '0rem',
                                top: '1.2rem',
                                display: 'block',
                                width: '1rem',
                                height: '1rem',
                                borderRadius: '50vw',
                                position: 'absolute',
                                background:
                                    componentLock === true ? 'red' : 'green',
                            }}
                        ></div>
                        {pageDataCount && pageDataCount.length > 0 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    background: 'black',
                                    color: 'cyan',
                                    left: '1rem',
                                    top: '4.5rem',
                                }}
                            >
                                Data Counts: [
                                {pageDataCount.map((e) => e + ' ')}]
                            </div>
                        )}
                        {data.length > 0 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    background: 'black',
                                    color: 'cyan',
                                    left: '1rem',
                                    top: '6.5rem',
                                }}
                            >
                                rendered rows: {data.length}
                            </div>
                        )}
                    </span>
                </>
            );
        } else {
            return <></>;
        }
    };

    useEffect(() => {
        scrollToTop();
    }, [sortBy, showAllData]);

    const doIphoneFix = () => {
        if (isIOS()) {
            setTimeout(() => {
                if (wrapperEl) {
                    wrapperEl.scrollBy({
                        top: -2,
                        left: 0,
                        behavior: 'smooth',
                    });
                }
            }, tmReadyState);
        }
    };

    const scrollByTxID = (txID: string, pos: ScrollPosition): void => {
        if (txID.length === 0) {
            addToActionHistory(InfScrollAction.FAIL);
            return;
        }
        const txSpans = document.querySelectorAll(
            txSpanSelectorForScrollMethod,
        );

        txSpans.forEach((span) => {
            if (span.textContent === txID) {
                const row = span.closest(
                    'div[data-type="infinite-scroll-row"]',
                ) as HTMLDivElement;
                if (row) {
                    if (debugMode && markRows) {
                        row.style.background =
                            pos == ScrollPosition.BOTTOM ? 'purple' : 'cyan';
                    }
                    addToActionHistory(InfScrollAction.SUCCESS);
                    row.scrollIntoView({
                        block: pos === ScrollPosition.BOTTOM ? 'end' : 'start',
                        behavior: 'instant' as ScrollBehavior,
                    });
                    doIphoneFix();
                }
            }
        });
    };

    const bindFirstSeenRow = (): void => {
        const rows = document.querySelectorAll(
            `#infinite_scroll_wrapper_${wrapperID} > div`,
        );
        if (rows.length > 0) {
            const firstRow = rows[0] as HTMLDivElement;
            if (debugMode && markRows) {
                firstRow.style.backgroundColor = 'orange';
            }

            const txDiv = firstRow.querySelector(txSpanSelectorForBindMethod);
            if (txDiv) {
                const txText = txDiv.querySelector('span')?.textContent;
                setFirstSeenTxID(txText || '');
            }
        }
    };

    const bindLastSeenRow = (): void => {
        const rows = document.querySelectorAll(
            `#infinite_scroll_wrapper_${wrapperID} > div`,
        );
        if (rows.length > 0) {
            const lastRow = rows[rows.length - 1] as HTMLDivElement;
            if (debugMode && markRows) {
                lastRow.style.backgroundColor = 'blue';
            }

            const txDiv = lastRow.querySelector(txSpanSelectorForBindMethod);
            if (txDiv) {
                const txText = txDiv.querySelector('span')?.textContent;
                setLastSeenTxID(txText || '');
            }
        }
    };

    const autoScrollAlternateSolutionActive = true;

    const couldFirstPageLoop = () => {
        if (
            dataPerPage &&
            pageDataCount &&
            pagesVisibleRef.current &&
            pageDataCount.length > pagesVisibleRef.current[0]
        ) {
            const firstPageIndex = pagesVisibleRef.current[0];
            if (scrollOnTopTresholdRatio) {
                return (
                    pageDataCount[firstPageIndex] / dataPerPage <
                    scrollOnTopTresholdRatio
                );
            }
            return pageDataCount[firstPageIndex] / dataPerPage < 0.5;
        }

        return false;
    };

    const doScroll = () => {
        if (sortBy === 'time' || !autoScrollAlternateSolutionActive) {
            if (autoScrollDirection === ScrollDirection.DOWN) {
                if (pageDataCount && dataPerPage && couldFirstPageLoop()) {
                    scrollByTxID(
                        lastSeenTxIDRef.current || '',
                        ScrollPosition.TOP,
                    );
                } else {
                    scrollByTxID(
                        lastSeenTxIDRef.current || '',
                        ScrollPosition.BOTTOM,
                    );
                }
            } else if (autoScrollDirection === ScrollDirection.UP) {
                scrollByTxID(
                    firstSeenTxIDRef.current || '',
                    ScrollPosition.TOP,
                );
            }
        } else {
            scrollWithAlternateStrategy();
        }
        const wrapper = document.getElementById(
            `infinite_scroll_wrapper_${wrapperID}`,
        );
        if (wrapper !== null) {
            wrapper.click();
        }
    };

    const scrollWithAlternateStrategy = () => {
        if (wrapperEl) {
            if (isSmallScreen) {
                wrapperEl.scrollTo({
                    // top: autoScrollDirection === ScrollDirection.DOWN ? 1400 : 1340,
                    top: wrapperEl.children[0].scrollHeight / 2,
                    behavior: 'instant' as ScrollBehavior,
                });
            } else {
                wrapperEl.scrollTo({
                    // top: autoScrollDirection === ScrollDirection.DOWN ? 1912 : 1850,
                    top: wrapperEl.children[0].scrollHeight / 2,
                    behavior: 'instant' as ScrollBehavior,
                });
            }
            doIphoneFix();
        }
    };

    const firstRowIntersectAction = () => {
        const pagesVisibleVal = pagesVisibleRef.current
            ? pagesVisibleRef.current
            : pagesVisible;
        // first row is visible
        if (pagesVisibleVal[0] > 0) {
            shiftUp();
        } else {
            bindTableReadyState(true);
        }
    };

    const lastRowIntersectAction = () => {
        const pagesVisibleVal = pagesVisibleRef.current
            ? pagesVisibleRef.current
            : pagesVisible;
        const extraPagesAvailableVal = extraPagesAvailableRef.current
            ? extraPagesAvailableRef.current
            : extraPagesAvailable;
        const moreDataAvailableVal = moreDataAvailableRef.current
            ? moreDataAvailableRef.current
            : moreDataAvailable;

        bindTableReadyState(false);
        // last row is visible
        extraPagesAvailableVal + 1 > pagesVisibleVal[1]
            ? shiftDown()
            : moreDataAvailableVal
              ? addMoreData()
              : bindTableReadyState(true);
    };

    const resetLastSeen = () => {
        setLastSeenTxID('');
    };

    useEffect(() => {
        if (moreDataLoadingRef.current || componentLockRef.current) return;
        resetLastSeen();
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                const moreDataLoadingVal = moreDataLoadingRef.current
                    ? moreDataLoadingRef.current
                    : moreDataLoading;

                if (moreDataLoadingVal) return;

                if (entry.isIntersecting) {
                    if (manualModeRef.current) {
                        bindLastSeenRow();
                        setShowManualScrollDown(true);
                    } else {
                        bindLastSeenRow();
                        lastRowIntersectAction();
                    }
                } else {
                    setShowManualScrollDown(false);
                }
            },
            {
                threshold: 0.1,
            },
        );

        const currentElement = lastRowRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [
        lastRowRef.current,
        moreDataLoading,
        moreDataAvailable,
        extraPagesAvailable,
        // pagesVisible[1],
    ]);

    useEffect(() => {
        if (moreDataAvailable == false) {
            bindTableReadyState(true);
        }
    }, [moreDataAvailable]);

    useEffect(() => {
        bindTableReadyState(!moreDataLoadingRef.current);
    }, [moreDataLoadingRef.current]);

    const addToActionHistory = (actionType: InfScrollAction) => {
        setActionHistory((prev) => {
            let actionToken = '';

            switch (actionType) {
                case InfScrollAction.SHIFT_UP:
                    actionToken = '↑';
                    break;
                case InfScrollAction.SHIFT_DOWN:
                    actionToken = '↓';
                    break;
                case InfScrollAction.ADD_MORE_DATA:
                    actionToken = '…';
                    break;
                case InfScrollAction.SLIGHT_SCROLL:
                    actionToken = '~';
                    break;
                case InfScrollAction.SUCCESS:
                    actionToken = '✓';
                    break;
                case InfScrollAction.FAIL:
                    actionToken = '□';
                    break;
            }

            return (prev += ' ' + actionToken);
        });
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                const moreDataLoadingVal = moreDataLoadingRef.current
                    ? moreDataLoadingRef.current
                    : moreDataLoading;

                if (moreDataLoadingVal) return;

                if (entry.isIntersecting) {
                    if (manualModeRef.current) {
                        setShowManualScrollUp(true);
                        bindFirstSeenRow();
                    } else {
                        firstRowIntersectAction();
                        bindFirstSeenRow();
                    }
                } else {
                    setShowManualScrollUp(false);
                }
            },
            {
                threshold: 0.1,
            },
        );

        const currentElement = firstRowRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [firstRowRef.current, moreDataLoading, pagesVisible[0]]);

    const lockReq = () => {
        setReqLock(true);
        setTimeout(() => {
            setReqLock(false);
        }, tmLockReq);
    };

    const addMoreData = async () => {
        if (reqLockRef.current === true) return;
        lockReq();
        await fetcherFunction();
        addToActionHistory(InfScrollAction.ADD_MORE_DATA);
        lockShift();
    };

    useEffect(() => {
        if (lastFetchedCount && lastFetchedCount > 0 && setLastFetchedCount) {
            triggerAutoScroll(ScrollDirection.DOWN);
            setTimeout(() => {
                setLastFetchedCount(0);
            }, tmLockShift);
        }
    }, [lastFetchedCount]);

    useEffect(() => {
        doScroll();
    }, [pagesVisible[0]]);

    return (
        <>
            <div
                id={`infinite_scroll_wrapper_${wrapperID}`}
                style={{ position: 'relative' }}
            >
                <TableRows
                    type={type}
                    data={data}
                    fullData={data}
                    isAccountView={isAccountView}
                    tableView={tableView}
                    lastRowRef={lastRowRef}
                    firstRowRef={firstRowRef}
                />
            </div>
            {pagesVisible[0] > 0 && !isSmallScreen && (
                <ScrollToTopButton onClick={scrollToTop}>
                    Scroll to Top
                </ScrollToTopButton>
            )}
            {pagesVisible[0] > 0 && isSmallScreen && (
                <ScrollToTopButtonMobile onClick={scrollToTop}>
                    <RiArrowUpSLine size={20} color='white' />
                </ScrollToTopButtonMobile>
            )}

            {showManualScrollUp && (
                <div
                    style={{
                        padding: '.5rem 1rem',
                        background: 'magenta',
                        position: 'absolute',
                        zIndex: 99,
                        right: '8rem',
                        top: '12rem',
                    }}
                    onClick={firstRowIntersectAction}
                >
                    Scroll Up
                </div>
            )}
            {showManualScrollDown && (
                <div
                    style={{
                        padding: '.5rem 1rem',
                        background: 'orange',
                        position: 'absolute',
                        zIndex: 99,
                        right: '8rem',
                        top: '14rem',
                    }}
                    onClick={lastRowIntersectAction}
                >
                    Scroll Down
                </div>
            )}
            {renderDebugData()}
            {!isTableReadyRef.current && moreDataLoadingRef.current && (
                <div className={styles.data_fetching_panel}>
                    <div className={styles.data_fetching_bar2}></div>
                </div>
            )}
        </>
    );
}

export default memo(TableRowsInfiniteScroll);
