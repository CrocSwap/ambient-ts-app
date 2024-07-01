import { useContext } from 'react';
import { getMoneynessRank } from '../../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { RowItem } from '../../../../styled/Components/TransactionTable';

interface propsIF {
    tx: TransactionIF;
    width: number;
    isAccountPage: boolean;
}

export default function TxType(props: propsIF) {
    const { tx, width, isAccountPage } = props;

    // whether denomination is displayed in terms of base token
    const { isDenomBase } = useContext(TradeDataContext);

    // needed for control flow below
    const isBaseTokenMoneynessGreaterOrEqual: boolean =
        getMoneynessRank(tx.baseSymbol) - getMoneynessRank(tx.quoteSymbol) >= 0;

    // needed for control flow below
    const isBuy: boolean = tx.isBuy === true || tx.isBid === true;

    // readable output for DOM
    const txTypeReadable: 'market'|'limit'|'range' =
    tx.entityType === 'liqchange'
        ? tx.changeType === 'mint'
            ? 'range'
            : 'range'
        : tx.entityType === 'limitOrder'
        ? 'limit'
        : 'market';

    // readable data for CSS control flow (color)
    const sideTypeReadable: 'add' | 'claim' | 'harvest' | 'remove' | 'buy' | 'sell' =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'burn'
                ? 'remove'
                : tx.changeType === 'harvest'
                ? 'harvest'
                : 'add'
            : tx.entityType === 'limitOrder'
            ? tx.changeType === 'mint'
                ? isAccountPage
                    ? isBaseTokenMoneynessGreaterOrEqual
                        ? isBuy
                            ? 'buy'
                            : 'sell'
                        : isBuy
                        ? 'sell'
                        : 'buy'
                    : (isDenomBase && tx.isBuy) || (!isDenomBase && !tx.isBuy)
                    ? 'sell'
                    : 'buy'
                : tx.changeType === 'recover'
                ? 'claim'
                : 'remove'
            : isAccountPage
            ? isBaseTokenMoneynessGreaterOrEqual
                ? isBuy
                    ? 'buy'
                    : 'sell'
                : isBuy
                ? 'sell'
                : 'buy'
            : (isDenomBase && tx.isBuy) || (!isDenomBase && !tx.isBuy)
            ? 'sell'
            : 'buy';

    return (
        <RowItem
            justifyContent='center'
            type={sideTypeReadable}
            data-label='type'
            tabIndex={0}
            width={width}
        >
            {txTypeReadable}
        </RowItem>
    );
}