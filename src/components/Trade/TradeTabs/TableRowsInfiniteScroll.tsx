import { Dispatch, memo, SetStateAction, useEffect, useRef, useState} from 'react';
import { RiArrowUpSLine } from 'react-icons/ri';
import { } from '../../../ambient-utils/api';
import {
    LimitOrderIF,
    PositionIF,
    TransactionIF
} from '../../../ambient-utils/types';
import { ScrollToTopButton, ScrollToTopButtonMobile } from '../../../styled/Components/TransactionTable';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { domDebug } from '../../Chat/DomDebugger/DomDebuggerUtils';
import TableRows from './TableRows';
import { TxSortType } from './useSortedTxs';
import { LimitSortType } from './useSortedLimits';
import { RangeSortType } from './useSortedPositions';

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
    tableKey?: string
    lastFetchedCount?: number
    setLastFetchedCount?: Dispatch<SetStateAction<number>>;
    moreDataLoading: boolean;
}

enum ScrollDirection {
    UP,
    DOWN,
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
    moreDataLoading
    
}: propsIF) {

    const isSmallScreen: boolean = useMediaQuery('(max-width: 768px)');

    const wrapperID = tableKey ? tableKey : '';

    // const txSpanSelectorForScrollMethod =  isSmallScreen ? `#infinite_scroll_wrapper_${wrapperID} > div > div:nth-child(1) > div:nth-child(1) > span`:
    //     `#infinite_scroll_wrapper_${wrapperID} > div > div:nth-child(2) > div > span`;
    const txSpanSelectorForScrollMethod =  `#infinite_scroll_wrapper_${wrapperID} div[data-label='hidden-id'] > span`;
    // const txSpanSelectorForBindMethod =  isSmallScreen ? 'div:nth-child(1)':
    //     'div:nth-child(2)';
    const txSpanSelectorForBindMethod =  'div[data-label="hidden-id"]';
    


    const debugMode = true;
    const[manualMode, setManualMode] = useState(false);
    const manualModeRef = useRef<boolean>();
    manualModeRef.current = manualMode;

    const [showManualScrollDown, setShowManualScrollDown] = useState(false);
    const [showManualScrollUp, setShowManualScrollUp] = useState(false);
    

    const moreDataLoadingRef = useRef<boolean>();
    moreDataLoadingRef.current = moreDataLoading;


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

    const bindWrapperEl = () => {
        if(isSmallScreen){
            return document.getElementById(`infinite_scroll_wrapper_${wrapperID}`)?.parentElement;
        }else{
            return document.getElementById(`infinite_scroll_wrapper_${wrapperID}`)?.parentElement?.parentElement?.parentElement;
        }
    }

    
    const wrapperEl = bindWrapperEl();


    const bindTableReadyState = (newState: boolean) => {
        if(newState === true){
            setTransactionTableOpacity('1');
            setIsTableReady(true);
        }
        else{
            setTransactionTableOpacity('.5');
            setIsTableReady(false);
        }
    }

  

    const scrollToTop = () => {
        setLastSeenTxID('');
        setPagesVisible([0, 1]);
        if(wrapperEl){
            wrapperEl.scrollTo({
                top: 0,
                behavior: 'instant' as ScrollBehavior,
            });

            setTimeout(() => {
                wrapperEl.scrollTo({
                    top: 0,
                    behavior: 'instant' as ScrollBehavior,
                });
            }, 100)
        }
    };
    
    const setTransactionTableOpacity = (val: string) => {
        if(wrapperEl){
            wrapperEl.style.opacity = val;
        }
    };


    const triggerAutoScroll = (
        direction: ScrollDirection,
        timeout?: number,
    ) => {
        bindTableReadyState(true);
        setAutoScroll(true);
        setAutoScrollDirection(direction);
        setTimeout(
            () => {
                setAutoScroll(false);
            },
            timeout ? timeout : 2000,
        );
        setTimeout(() => {
            bindTableReadyState(true)
        }, 300)
    };

    const lockShift = () => {
        setShiftLock(true);
        setTimeout(() => {
            setShiftLock(false);
        }, 500);
    }

    const shiftUp = (): void => {
        if(shiftLockRef.current) {
            bindTableReadyState(true);
            return;
        }
        setTimeout(() => {
            bindTableReadyState(true);
        }, 100)
        setPagesVisible((prev) => [prev[0] - 1, prev[1] - 1]);
        triggerAutoScroll(ScrollDirection.UP);
        lockShift();
    };
    
    const shiftDown = (): void => {
        if(shiftLockRef.current) {
            bindTableReadyState(true);
            return;
        }
        setTimeout(() => {
            bindTableReadyState(true);
        }, 100)
        setPagesVisible((prev) => [prev[0] + 1, prev[1] + 1]);
        triggerAutoScroll(ScrollDirection.DOWN);
        lockShift();
    };

    

    const renderDebugData = () => {

        if(debugMode){

            const renderedRows = document.querySelectorAll(txSpanSelectorForScrollMethod).length;

            return (<>
            <span style={{fontSize: '.72rem'}}>
            <div style={{padding: '.5rem 1rem', background: 'black', color: `${isTableReady ? 'rgba(0, 255,0)' : 'rgba(255, 0,0)'}`, position: 'absolute', left: '1rem', top: '1.7rem'}} onClick={() => {setManualMode(!manualModeRef.current)}}>Ready? : </div>
            <div style={{padding: '.5rem 1rem', background: 'black', color: 'rgba(0, 255,0)', opacity: manualModeRef.current ? '1':'.7', position: 'absolute', right: '3rem', top: '1rem'}} onClick={() => {setManualMode(!manualModeRef.current)}}>{manualModeRef.current ? 'Manual' : 'Auto'} Mode</div>
            <div style={{position: 'absolute',  background: 'black', color: 'rgba(0, 255,0)', left: '50%', top: '0rem'}}>Page: {pagesVisibleRef.current ? pagesVisibleRef.current[0] : ''}</div>
            <div style={{position: 'absolute',  background: 'black', color: 'rgba(0, 255,0)', left: '2rem', top: '1.2rem'}}>Rows : {renderedRows}</div>
            <div style={{left: '12rem', top: '1.2rem', color: 'rgba(255, 150,30)', position: 'absolute',  background: 'black'}}>lastSeenTX : {lastSeenTxIDRef.current}</div>
            </span>
            </>)
        }else{
            return <></>
        }
    }

    useEffect(() => {
        domDebug('sortBy', sortBy);
        scrollToTop();
    }, [sortBy, showAllData]);

    domDebug('moreDataAvailable', moreDataAvailableRef.current);

    const scrollByTxID = (txID: string, pos: ScrollPosition): void => {
        if(txID.length === 0) return;
        const txSpans = document.querySelectorAll(
            txSpanSelectorForScrollMethod
        );

        txSpans.forEach((span) => {
            if (span.textContent === txID) {

                const row = span.closest('div[data-type="infinite-scroll-row"]') as HTMLDivElement;
                if(row){
                    if (debugMode) {
                        row.style.background = pos == ScrollPosition.BOTTOM ? 'purple' : 'cyan';
                    }
                    row.scrollIntoView({
                        block: pos === ScrollPosition.BOTTOM ? 'end' : 'start',
                        behavior: 'instant' as ScrollBehavior,
                    });
                }
                // const row = span.parentElement?.parentElement as HTMLDivElement;

                // const parent = row.parentElement as HTMLDivElement;
                // if (debugMode) {
                //     parent.style.background = pos == ScrollPosition.BOTTOM ? 'purple' : 'cyan';
                // }
                // parent.scrollIntoView({
                //     block: pos === ScrollPosition.BOTTOM ? 'end' : 'start',
                //     behavior: 'instant' as ScrollBehavior,
                // });
            }
        });
    };

    const bindFirstSeenRow = (): void => {
        const rows = document.querySelectorAll(`#infinite_scroll_wrapper_${wrapperID} > div`);
        if (rows.length > 0) {
            const firstRow = rows[0] as HTMLDivElement;
            if (debugMode) {
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
        const rows = document.querySelectorAll(`#infinite_scroll_wrapper_${wrapperID} > div`);
        if (rows.length > 0) {
            // const lastRow = rows[rows.length - 1] as HTMLDivElement;
            // rows.forEach((row) => {
            //     (row as HTMLDivElement).style.backgroundColor = 'transparent';
            // });
            const lastRow = rows[rows.length - 1] as HTMLDivElement;
            if (debugMode) {
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
        if(dataPerPage && pageDataCount && pagesVisibleRef.current && pageDataCount.length > pagesVisibleRef.current[0]){
            const firstPageIndex = pagesVisibleRef.current[0];
            return pageDataCount[firstPageIndex] / dataPerPage < .5; 
        }

        return false;
    }


    const doScroll = () => {
        if (sortBy === 'time' || !autoScrollAlternateSolutionActive) {
            if (autoScrollDirection === ScrollDirection.DOWN) {
                if(pageDataCount && dataPerPage && couldFirstPageLoop()){
                    scrollByTxID(
                        lastSeenTxIDRef.current || '',
                        ScrollPosition.TOP,
                    );
                }else{
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
    }

    const scrollWithAlternateStrategy = () => { 


        if(wrapperEl){
            if(isSmallScreen){
                wrapperEl.scrollTo({
                    top: autoScrollDirection === ScrollDirection.DOWN ? 1400 : 1340,
                    behavior: 'instant' as ScrollBehavior,
                });
            }else{
                wrapperEl.scrollTo({
                    top: autoScrollDirection === ScrollDirection.DOWN ? 1912 : 1850,
                    behavior: 'instant' as ScrollBehavior,
                });
            }
        }
    };


    const firstRowIntersectAction = () => {
        const pagesVisibleVal = pagesVisibleRef.current ? pagesVisibleRef.current : pagesVisible;
        // first row is visible
        if(pagesVisibleVal[0] > 0){
            shiftUp()
        }else{
            bindTableReadyState(true);
        }
    }

    const lastRowIntersectAction = () => {
        const pagesVisibleVal = pagesVisibleRef.current ? pagesVisibleRef.current : pagesVisible;
        const extraPagesAvailableVal = extraPagesAvailableRef.current ? extraPagesAvailableRef.current : extraPagesAvailable;
        const moreDataAvailableVal = moreDataAvailableRef.current ? moreDataAvailableRef.current : moreDataAvailable
       
        bindTableReadyState(false);
        // last row is visible
        extraPagesAvailableVal + 1 > pagesVisibleVal[1]
            ? shiftDown()
            : moreDataAvailableVal
              ? addMoreData()
              : bindTableReadyState(true);
    }

    const resetLastSeen = () => {
        setLastSeenTxID('');
    }

    useEffect(() => {
        if(moreDataLoadingRef.current) return;    
        resetLastSeen();
        const observer = new IntersectionObserver(
            (entries) => {

                const entry = entries[0];


                const moreDataLoadingVal = moreDataLoadingRef.current ? moreDataLoadingRef.current : moreDataLoading;
              
                if (moreDataLoadingVal) return;
                
                if (entry.isIntersecting) {

                    if(manualModeRef.current){
                        bindLastSeenRow();                        
                        setShowManualScrollDown(true);
                    }else{
                        bindLastSeenRow();
                        lastRowIntersectAction();
                    }
                }else{
                    setShowManualScrollDown(false);
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
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
        if(moreDataAvailable == false){
            bindTableReadyState(true);
        }
    }, [moreDataAvailable])



    useEffect(() => {
        domDebug('moreDataLoading', moreDataLoading);
        domDebug('page', pagesVisible[0]);

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

              
                const moreDataLoadingVal = moreDataLoadingRef.current ? moreDataLoadingRef.current : moreDataLoading;
                
                if (moreDataLoadingVal) return;

                if (entry.isIntersecting) {
    
                    if(manualModeRef.current){
                        setShowManualScrollUp(true);
                        bindFirstSeenRow();                        
                    }else{
                        firstRowIntersectAction();
                        bindFirstSeenRow();
                    }
                    
                }else{
                    setShowManualScrollUp(false);
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
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




    const addMoreData = async() => {
        // setMoreDataLoading(true);
        fetcherFunction();
        // setMoreDataLoading(false);
        // if(changePage){
        //     setExtraPagesAvailable((prev) => prev + 1);
        //     setPagesVisible((prev) => [
        //         prev[0] + 1,
        //         prev[1] + 1,
        //     ]);
            
        //     triggerAutoScroll(ScrollDirection.DOWN);
        // }else{
        //     bindTableReadyState(true);
        // }
    }

    useEffect(() => {
        if(lastFetchedCount && lastFetchedCount > 0 && setLastFetchedCount){
            triggerAutoScroll(ScrollDirection.DOWN);
            // doScroll();
            setTimeout(() => {
                setLastFetchedCount(0);
            }, 500)
        }
    }, [lastFetchedCount])


    useEffect(() => {
        doScroll();
    }, [pagesVisible[0]])

    useEffect(() => {

        domDebug('lastSeen', lastSeenTxIDRef.current);
        domDebug('firstSeen', firstSeenTxIDRef.current);
    }, [lastSeenTxID, firstSeenTxID])

    return (
        <>
<div id={`infinite_scroll_wrapper_${wrapperID}`}>
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
                    <ScrollToTopButton onClick={scrollToTop}>Scroll to Top</ScrollToTopButton>)}
                {pagesVisible[0] > 0 && isSmallScreen && (
                    <ScrollToTopButtonMobile onClick={scrollToTop}>
<RiArrowUpSLine size={20} color='white'/>
                    </ScrollToTopButtonMobile>)}

                {showManualScrollUp && (<div style={{padding: '.5rem 1rem', background: 'magenta', position: 'absolute', zIndex: 99, right: '8rem', top: '12rem'}} onClick={firstRowIntersectAction}>Scroll Up</div>)}
                {showManualScrollDown && (<div style={{padding: '.5rem 1rem', background: 'orange', position: 'absolute', zIndex: 99, right: '8rem', top: '14rem'}} onClick={lastRowIntersectAction}>Scroll Down</div>)}
                {
                    renderDebugData()
                }

        </>
    );
}

export default memo(TableRowsInfiniteScroll);
