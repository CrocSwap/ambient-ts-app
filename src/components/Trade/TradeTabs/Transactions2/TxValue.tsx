import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../../ambient-utils/types';
import { RowItem } from '../../../../styled/Components/TransactionTable';

interface propsIF {
    width: number;
    tx: TransactionIF;
}

export default function TxValue(props: propsIF) {
    const { width, tx } = props;
    return (
        <RowItem
            justifyContent='flex-end'
            data-label='value'
            tabIndex={0}
            width={width}
        >
            {getFormattedNumber({ value: Math.abs(tx.totalValueUSD), isUSD: true })}
        </RowItem>
    );
}