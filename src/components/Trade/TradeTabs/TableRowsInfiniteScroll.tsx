import { Dispatch, memo, SetStateAction, useEffect, useRef, useState } from 'react';
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

interface propsIF {
    type: 'Transaction' | 'Order' | 'Range';
    data: TransactionIF[] | LimitOrderIF[] | PositionIF[];
    tableView: 'small' | 'medium' | 'large';
    isAccountView: boolean;
    fetcherFunction: () => Promise<boolean>;
    sortBy: TxSortType | LimitSortType;
    showAllData: boolean;
    pagesVisible: [number, number];
    setPagesVisible: Dispatch<SetStateAction<[number, number]>>;
    moreDataAvailable: boolean;
    extraPagesAvailable: number;
    setExtraPagesAvailable: Dispatch<SetStateAction<number>>;
    tableKey?: string
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
    setExtraPagesAvailable,
    tableKey
    
}: propsIF) {

    const isSmallScreen: boolean = useMediaQuery('(max-width: 768px)');

    const wrapperID = tableKey ? tableKey : '';

    const txSpanSelectorForScrollMethod =  isSmallScreen ? `#infinite_scroll_wrapper_${wrapperID} > div > div:nth-child(1) > div:nth-child(1) > span`:
        `#infinite_scroll_wrapper_${wrapperID} > div > div:nth-child(2) > div > span`;
    const txSpanSelectorForBindMethod =  isSmallScreen ? 'div:nth-child(1)':
        'div:nth-child(2)';
    

    

    const [moreDataLoading, setMoreDataLoading] = useState<boolean>(false);

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

    const bindWrapperEl = () => {
        if(isSmallScreen){
            return document.getElementById(`infinite_scroll_wrapper_${wrapperID}`)?.parentElement;
        }else{
            return document.getElementById(`infinite_scroll_wrapper_${wrapperID}`)?.parentElement?.parentElement?.parentElement;
        }
    }
    
    const wrapperEl = bindWrapperEl();

    const getOverlayComponentForLoadingState = () => {


            if(isSmallScreen){
                return <div style={{
                    transition: 'all .2s ease-in-out', 
                    // position: 'absolute', top: '0', left: '0', 
                    position: 'absolute', top: '80px', left: '0', 
                    zIndex: isTableReadyRef.current ? '-1': '1',
                    backdropFilter: 'blur(10px)',
                    width: '100%',
                    height: 'calc(100% - 80px)'
                }}></div>
            }else{
                return <div style={{
                    transition: 'all .2s ease-in-out', 
                    position: 'absolute', top: '0', left: '0', 
                    zIndex: isTableReadyRef.current ? '-1': '1',
                    backdropFilter: 'blur(10px)',
                    width: '100%',
                    height: '100%'
                }}></div>
            }
    }

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
    };

    const shiftUp = (): void => {
        setPagesVisible((prev) => [prev[0] - 1, prev[1] - 1]);
        triggerAutoScroll(ScrollDirection.UP);
    };
    
    const shiftDown = (): void => {
        console.log('shift down')
        setPagesVisible((prev) => [prev[0] + 1, prev[1] + 1]);
        triggerAutoScroll(ScrollDirection.DOWN);
    };

    
    useEffect(() => {
        domDebug('sortBy', sortBy);
        scrollToTop();
    }, [sortBy, showAllData]);

    const markRows = true;

    const scrollByTxID = (txID: string, pos: ScrollPosition): void => {

        const txSpans = document.querySelectorAll(
            txSpanSelectorForScrollMethod
        );

        txSpans.forEach((span) => {
            if (span.textContent === txID) {
                const row = span.parentElement?.parentElement as HTMLDivElement;
                // row.style.backgroundColor = 'red';

                const parent = row.parentElement as HTMLDivElement;
                if (markRows) {
                    parent.style.background = 'red';
                }
                parent.scrollIntoView({
                    block: pos === ScrollPosition.BOTTOM ? 'end' : 'start',
                    behavior: 'instant' as ScrollBehavior,
                });
            }
        });
    };

    const bindFirstSeenRow = (): void => {
        const rows = document.querySelectorAll(`#infinite_scroll_wrapper_${wrapperID} > div`);
        if (rows.length > 0) {
            const firstRow = rows[0] as HTMLDivElement;
            if (markRows) {
                firstRow.style.backgroundColor = 'cyan';
            }

            const txDiv = firstRow.querySelector(txSpanSelectorForBindMethod);
            if (txDiv) {
                const txText = txDiv.querySelector('span')?.textContent;
                setFirstSeenTxID(txText || '');
                domDebug('firstSeenTxID', txText);
            }
        }
    };

    const bindLastSeenRow = (): void => {
        const rows = document.querySelectorAll(`#infinite_scroll_wrapper_${wrapperID} > div`);
        if (rows.length > 0) {
            // const lastRow = rows[rows.length - 1] as HTMLDivElement;
            rows.forEach((row) => {
                (row as HTMLDivElement).style.backgroundColor = 'transparent';
            });
            const lastRow = rows[rows.length - 1] as HTMLDivElement;
            if (markRows) {
                lastRow.style.backgroundColor = 'blue';
            }

            const txDiv = lastRow.querySelector(txSpanSelectorForBindMethod);
            if (txDiv) {
                const txText = txDiv.querySelector('span')?.textContent;
                setLastSeenTxID(txText || '');
                domDebug('lastSeenTxID', txText);
            }
        }
    };

    const autoScrollAlternateSolutionActive = true;



    useEffect(() => {
        if (autoScroll) {
            if (sortBy === 'time' || !autoScrollAlternateSolutionActive) {
                if (autoScrollDirection === ScrollDirection.DOWN) {
                    scrollByTxID(
                        lastSeenTxIDRef.current || '',
                        ScrollPosition.BOTTOM,
                    );
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
    }, [data]);


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

    useEffect(() => {
        if(moreDataLoadingRef.current) return;    
        const observer = new IntersectionObserver(
            (entries) => {

                const entry = entries[0];

                const moreDataLoadingVal = moreDataLoadingRef.current ? moreDataLoadingRef.current : moreDataLoading;
                const pagesVisibleVal = pagesVisibleRef.current ? pagesVisibleRef.current : pagesVisible;
                const extraPagesAvailableVal = extraPagesAvailableRef.current ? extraPagesAvailableRef.current : extraPagesAvailable;
                const moreDataAvailableVal = moreDataAvailableRef.current ? moreDataAvailableRef.current : moreDataAvailable

                if (moreDataLoadingVal) return;
                if (entry.isIntersecting) {
                    bindLastSeenRow();
                    bindTableReadyState(false);
                    // last row is visible
                    extraPagesAvailableVal + 1 > pagesVisibleVal[1]
                        ? shiftDown()
                        : moreDataAvailableVal
                          ? addMoreData()
                          : bindTableReadyState(true);
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
                
                const pagesVisibleVal = pagesVisibleRef.current ? pagesVisibleRef.current : pagesVisible;
                if (moreDataLoadingVal) return;
                if (entry.isIntersecting) {
                    // first row is visible
                    if(pagesVisibleVal[0] > 0){
                        shiftUp()
                    }else{
                        bindTableReadyState(true);
                    }
                    bindFirstSeenRow();
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
        console.log('add more data')
        setMoreDataLoading(true);
        const changePage = await fetcherFunction();
        console.log('change page', changePage);
        setMoreDataLoading(false);
        if(changePage){
            setExtraPagesAvailable((prev) => prev + 1);
            setPagesVisible((prev) => [
                prev[0] + 1,
                prev[1] + 1,
            ]);
            
            triggerAutoScroll(ScrollDirection.DOWN);
        }else{
            bindTableReadyState(true);
        }
    }

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
                {pagesVisible[0] > 0 && !isSmallScreen && (
                    <ScrollToTopButton onClick={scrollToTop}>Scroll to Top</ScrollToTopButton>)}
                {pagesVisible[0] > 0 && isSmallScreen && (
                    <ScrollToTopButtonMobile onClick={scrollToTop}>
<RiArrowUpSLine size={20} color='white'/>
                    </ScrollToTopButtonMobile>)}
                
            </div>
                {getOverlayComponentForLoadingState()}

        </>
    );
}

export default memo(TableRowsInfiniteScroll);
