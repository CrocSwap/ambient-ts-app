import { useCallback, useState } from 'react';
import { Transaction } from '../../types';
import TransactionRow from './Transaction';

interface TransactionsProps {
    transactions: Transaction[];
}

export default function Transactions(props: TransactionsProps) {
    const SORT_FIELD = {
        amountUSD: 'amountUSD',
        timestamp: 'timestamp',
        sender: 'sender',
        amountToken0: 'amountToken0',
        amountToken1: 'amountToken1',
    };

    const [sortField, setSortField] = useState(SORT_FIELD.timestamp);
    const [sortDirection, setSortDirection] = useState<boolean>(true);
    const handleSort = useCallback(
        (newField: string) => {
            setSortField(newField);
            setSortDirection(sortField !== newField ? true : !sortDirection);
        },
        [sortDirection, sortField],
    );

    const arrow = useCallback(
        (field: string) => {
            return sortField === field ? (!sortDirection ? '↑' : '↓') : '';
        },
        [sortDirection, sortField],
    );

    const trancationsDisplay = props.transactions.map((transaction, idx) => (
        <TransactionRow transaction={transaction} key={idx} />
    ));

    const trancationsHeader = (
        <thead>
            <tr>
                <th>#</th>

                <th>
                    <label onClick={() => handleSort(SORT_FIELD.amountUSD)}>
                        Total Value {arrow(SORT_FIELD.amountUSD)}
                    </label>
                </th>
                <th></th>
                <th></th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.amountToken0)}>
                        Token Amount {arrow(SORT_FIELD.amountToken0)}
                    </label>
                </th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.amountToken1)}>
                        Token Amount {arrow(SORT_FIELD.amountToken1)}
                    </label>
                </th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.sender)}>
                        Account {arrow(SORT_FIELD.sender)}
                    </label>
                </th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.timestamp)}>
                        Time {arrow(SORT_FIELD.timestamp)}
                    </label>
                </th>
            </tr>
        </thead>
    );

    return (
        <table>
            {trancationsHeader}

            <tbody>{trancationsDisplay}</tbody>
        </table>
    );
}
