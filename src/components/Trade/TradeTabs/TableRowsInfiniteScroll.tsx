import { memo, MutableRefObject, useEffect, useRef, useState } from 'react';
import { } from '../../../ambient-utils/api';
import {
    LimitOrderIF,
    PositionIF,
    TransactionIF
} from '../../../ambient-utils/types';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { domDebug } from '../../Chat/DomDebugger/DomDebuggerUtils';
import TableRows from './TableRows';
import { TxSortType } from './useSortedTxs';

interface propsIF {
    type: 'Transaction' | 'Order' | 'Range';
    fullData: TransactionIF[] | LimitOrderIF[] | PositionIF[];
    tableView: 'small' | 'medium' | 'large';
    isAccountView: boolean;
    fetcherFunction: () => Promise<boolean>;
    scrollRef: MutableRefObject<HTMLDivElement | null>;
    sortBy: TxSortType;
    showAllData: boolean;
    selectedBaseAddress:string;
    selectedQuoteAddress: string;
    moreDataAvailable: boolean;
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
    fullData,
    isAccountView,
    tableView,
    fetcherFunction,
    scrollRef,
    sortBy,
    showAllData,
    selectedBaseAddress,
    selectedQuoteAddress,
    moreDataAvailable  
    
}: propsIF) {

    const isSmallScreen: boolean = useMediaQuery('(max-width: 768px)');

    const txSpanSelectorForScrollMethod =  isSmallScreen ? '#current_row_scroll > div > div > div:nth-child(1) > div:nth-child(1) > span':
        '#current_row_scroll > div > div > div:nth-child(2) > div > span';
    const txSpanSelectorForBindMethod =  isSmallScreen ? 'div:nth-child(1)':
        'div:nth-child(2)';
    

    const [pagesVisible, setPagesVisible] = useState<[number, number]>([0, 1]);

    const pagesVisibleRef = useRef<[number, number]>();
    pagesVisibleRef.current = pagesVisible;

    
    const [extraPagesAvailable, setExtraPagesAvailable] = useState<number>(0);
    const extraPagesAvailableRef = useRef<number>();
    extraPagesAvailableRef.current = extraPagesAvailable;

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

    const bindData = () => {
        return fullData.slice(pagesVisible[0] * 50, pagesVisible[1] * 50 + 50);
    }

    const [data, setData] = useState<TransactionIF[] | LimitOrderIF[] | PositionIF[]>(bindData());

    useEffect(() => {
        setData(bindData());
    }
    , [fullData, pagesVisible]);

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

  


    
    useEffect(() => {
        setPagesVisible([0, 1]);
        setExtraPagesAvailable(0);
    }, [selectedBaseAddress + selectedQuoteAddress]);

    const scrollToTop = () => {
        setLastSeenTxID('');
        setPagesVisible([0, 1]);

        if(isSmallScreen){
            const wrapper = document.getElementById('current_row_scroll');
            if(wrapper){
                    wrapper.scrollTo({
                        top: 0,
                        behavior: 'instant' as ScrollBehavior,
                    });
            }
        }else if(scrollRef.current) {
            // scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); // For smooth scrolling
            scrollRef.current.scrollTo({
                top: 0,
                behavior: 'instant' as ScrollBehavior,
            });
        }
    };
    
    const setTransactionTableOpacity = (val: string) => {
        if (scrollRef.current) {
            scrollRef.current.style.opacity = val;
        }
    };


    const triggerAutoScroll = (
        direction: ScrollDirection,
        timeout?: number,
    ) => {
        console.log('triggerAutoScroll')
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
        const rows = document.querySelectorAll('#current_row_scroll > div > div');
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
        const rows = document.querySelectorAll('#current_row_scroll > div > div');
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

        if(isSmallScreen){
            const wrapper = document.getElementById('current_row_scroll');
            if(wrapper){
                    wrapper.scrollTo({
                        top: autoScrollDirection === ScrollDirection.DOWN ? 1400 : 1340,
                        behavior: 'instant' as ScrollBehavior,
                    });
            }
        }else{
            if ( scrollRef.current) {
                scrollRef.current.scrollTo({
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
                const pagesVisibleVal = pagesVisibleRef.current
                    ? pagesVisibleRef.current
                    : pagesVisible;

                const extraPagesAvailableVal = extraPagesAvailableRef.current ? extraPagesAvailableRef.current : extraPagesAvailable;
                const entry = entries[0];

                const moreDataLoadingVal = moreDataLoadingRef.current ? moreDataLoadingRef.current : moreDataLoading;

                if (moreDataLoadingVal) return;
                if (entry.isIntersecting) {
                    bindLastSeenRow();
                    bindTableReadyState(false);
                    // last row is visible
                    extraPagesAvailableVal + 1 > pagesVisibleVal[1]
                        ? shiftDown()
                        : moreDataAvailable
                          ? addMoreData()
                          : undefined;
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

    if(pagesVisibleRef.current){
        domDebug('page', pagesVisibleRef.current[0]);
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                const moreDataLoadingVal = moreDataLoadingRef.current ? moreDataLoadingRef.current : moreDataLoading;
                
                if (moreDataLoadingVal) return;
                if (entry.isIntersecting) {
                    // first row is visible
                    pagesVisible[0] > 0 && shiftUp();
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
        setMoreDataLoading(false);
        console.log('change Page................')
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
<div>
            {getOverlayComponentForLoadingState()}
            <TableRows
                type={type}
                data={data}
                fullData={fullData}
                isAccountView={isAccountView}
                tableView={tableView}
                lastRowRef={lastRowRef}
                firstRowRef={firstRowRef}
                />

            </div>

        </>
    );
}

export default memo(TableRowsInfiniteScroll);
