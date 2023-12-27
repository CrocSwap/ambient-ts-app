import { useContext } from 'react';
import { getMoneynessRank, getUnicodeCharacter } from '../../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { RowItem } from '../../../../styled/Components/TransactionTable';

interface propsIF {
    tx: TransactionIF;
    isAccountPage: boolean;
    width: number;
};

export default function TxSide(props: propsIF) {
    const { tx, isAccountPage, width } = props;

    // whether denomination is displayed in terms of base token
    const { isDenomBase } = useContext(TradeDataContext);

    // needed for control flow below
    const isBaseTokenMoneynessGreaterOrEqual: boolean =
        getMoneynessRank(tx.baseSymbol) - getMoneynessRank(tx.quoteSymbol) >= 0;

    // needed for control flow below
    const isBuy: boolean = tx.isBuy === true || tx.isBid === true;

    type sideType = 'remove'|'harvest'|'add'|'buy'|'sell'|'claim';

    // side of transaction
    // we really should find a better way to write this logic
    const side: sideType =
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


    // first character of base and quote token symbols (capitalized)
    const baseChar: string = getUnicodeCharacter(tx.baseSymbol) ?? '';
    const quoteChar: string = getUnicodeCharacter(tx.quoteSymbol) ?? '';

    // character of token to display
    const sideCharacter: string = isAccountPage
        ? isBaseTokenMoneynessGreaterOrEqual
            ? quoteChar
            : baseChar
        : isDenomBase
        ? baseChar
        : quoteChar;

    // display text string for the DOM
    let displayText: string = side;
    // add a currency charachter to the display string if relevant
    if (
        tx.entityType === 'liqchange' ||
        tx.changeType === 'burn' ||
        tx.changeType === 'recover'
    ) {
        displayText += ` ${sideCharacter}`;
    }

    return (
        <RowItem
            type={side}
            justifyContent='center'
            data-label='side'
            tabIndex={0}
            width={width}
        >
            {displayText}
        </RowItem>
    );
};