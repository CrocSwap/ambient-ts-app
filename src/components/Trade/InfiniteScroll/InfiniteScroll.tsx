/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PositionIF } from '../../../ambient-utils/types/position';
import { LimitOrderIF } from '../../../ambient-utils/types/limitOrder';
import { TransactionIF } from '../../../ambient-utils/types/transaction';
import { memo, useRef, useState } from 'react';
import {
    Changes,
    LimitOrdersByPool,
    PositionsByPool,
} from '../../../contexts/GraphDataContext';

interface propsIF {
    type: 'Transaction' | 'Limit' | 'Range';
    data: TransactionIF[] | LimitOrderIF[] | PositionIF[];
    dataPerPage: number;
}

function InfiniteScroll(props: propsIF) {
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

    return <div>InfiniteScroll</div>;
}

export default memo(InfiniteScroll);
