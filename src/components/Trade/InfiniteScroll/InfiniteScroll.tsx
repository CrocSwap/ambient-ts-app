/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PositionIF } from '../../../ambient-utils/types/position';
import { LimitOrderIF } from '../../../ambient-utils/types/limitOrder';
import { TransactionIF } from '../../../ambient-utils/types/transaction';
import { memo, useContext, useRef, useState } from 'react';
import {
    Changes,
    LimitOrdersByPool,
    PositionsByPool,
} from '../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { PageDataCountIF } from '../../Chat/ChatIFs';

interface propsIF {
    type: 'Transaction' | 'Limit' | 'Range';
    data: TransactionIF[] | LimitOrderIF[] | PositionIF[];
    dataPerPage: number;
}

function InfiniteScroll(props: propsIF) {
    const { baseToken, quoteToken } = useContext(TradeDataContext);
    const { data, dataPerPage } = props;
    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;
    const selectedBaseAddress: string = baseToken.address;
    const selectedQuoteAddress: string = quoteToken.address;

    const PAGE_COUNT_DIVIDE_THRESHOLD = 20;
    const INITIAL_EXTRA_REQUEST_THRESHOLD = 20;

    const prevBaseQuoteAddressRef = useRef<string>(
        selectedBaseAddress + selectedQuoteAddress,
    );

    const assignInitialFetchedTransactions = ():
        | LimitOrdersByPool
        | PositionsByPool
        | Changes => {
        let ret: LimitOrdersByPool | PositionsByPool | Changes;
        if (props.type === 'Limit') {
            ret = {
                dataReceived: false,
                limitOrders: [...(props.data as LimitOrderIF[])],
            };
        } else if (props.type === 'Range') {
            ret = {
                dataReceived: false,
                positions: [...(props.data as PositionIF[])],
            };
        } else {
            return {
                dataReceived: false,
                changes: [...(props.data as TransactionIF[])],
            };
        }
        return ret;
    };

    // PAGE DATA COUNTS
    const getInitialDataPageCounts = (): PageDataCountIF => {
        let counts: [number, number];
        if (data.length == 0) {
            counts = [0, 0];
        } else if (data.length < PAGE_COUNT_DIVIDE_THRESHOLD) {
            counts = [data.length, 0];
        } else if (data.length / dataPerPage < 2) {
            counts = [Math.ceil(data.length / 2), Math.floor(data.length / 2)];
        } else {
            counts = [
                data.length > dataPerPage ? dataPerPage : data.length,
                data.length / dataPerPage == 2
                    ? dataPerPage
                    : data.length - dataPerPage,
            ];
        }

        return {
            pair: (selectedBaseAddress + selectedQuoteAddress).toLowerCase(),
            counts: counts,
        };
    };

    const addPageDataCount = (dataCount: number) => {
        setPageDataCount((prev) => {
            return {
                pair: prev.pair,
                counts: [...prev.counts, dataCount],
            };
        });
    };

    const mergePageDataCounts = (hotTxsCount: number) => {
        const counts = pageDataCountRef.current?.counts || pageDataCount.counts;
        const newCounts = counts.map((e) => {
            if (e < dataPerPage && hotTxsCount > 0) {
                const gap = dataPerPage - e;
                if (hotTxsCount > gap) {
                    e += gap;
                    hotTxsCount -= gap;
                } else {
                    e += hotTxsCount;
                    hotTxsCount = 0;
                }
            }
            return e;
        });

        if (hotTxsCount > 0) {
            for (let i = 0; i < hotTxsCount / dataPerPage - 1; i++) {
                newCounts.push(dataPerPage);
            }
            newCounts.push(hotTxsCount % dataPerPage);
        }

        setPageDataCount((prev) => {
            return {
                pair: prev.pair,
                counts: newCounts,
            };
        });
    };

    const [fetchedTransactions, setFetchedTransactions] = useState<
        LimitOrdersByPool | PositionsByPool | Changes
    >(assignInitialFetchedTransactions());

    const fetchedTransactionsRef = useRef<
        LimitOrdersByPool | PositionsByPool | Changes
    >();
    fetchedTransactionsRef.current = fetchedTransactions;

    const [hotTransactions, setHotTransactions] = useState<
        LimitOrderIF[] | PositionIF[] | TransactionIF[]
    >([]);

    const [extraPagesAvailable, setExtraPagesAvailable] = useState<number>(0);

    const [moreDataAvailable, setMoreDataAvailable] = useState<boolean>(true);
    const moreDataAvailableRef = useRef<boolean>();
    moreDataAvailableRef.current = moreDataAvailable;

    const [lastFetchedCount, setLastFetchedCount] = useState<number>(0);

    const [moreDataLoading, setMoreDataLoading] = useState<boolean>(false);

    const [pagesVisible, setPagesVisible] = useState<[number, number]>([0, 1]);
    const [pageDataCount, setPageDataCount] = useState<PageDataCountIF>(
        getInitialDataPageCounts(),
    );

    const pageDataCountRef = useRef<PageDataCountIF>();
    pageDataCountRef.current = pageDataCount;

    const resetInfiniteScroll = () => {
        setFetchedTransactions(assignInitialFetchedTransactions());
        setHotTransactions([]);
        setExtraPagesAvailable(0);
        setMoreDataAvailable(true);
        setLastFetchedCount(0);
        setMoreDataLoading(false);
    };

    return <div>InfiniteScroll</div>;
}

export default memo(InfiniteScroll);
