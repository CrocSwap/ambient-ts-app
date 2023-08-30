import { Results } from '../../../../../styled/Components/Sidebar';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { getFormattedNumber } from '../../../../functions/getFormattedNumber';
import { EntityType, getTxType } from '../../../../functions/getTxType';

interface propsIF {
    tx: TransactionIF;
    handleClick: (tx: TransactionIF) => void;
}

export default function TxLI(props: propsIF) {
    const { tx, handleClick } = props;

    // type of transaction in human-readable format
    const txType = getTxType(tx.entityType as EntityType);

    // value of transaction in human-readable format
    const txValue = getFormattedNumber({ value: tx.totalValueUSD });

    // TODO:   @Junior  please refactor the top-level element of this JSX return
    // TODO:   @Junior  ... to return an <li> element, and refactor parent to
    // TODO:   @Junior  ... render them inside an <ol> element

    return (
        <Results
            numCols={3}
            fullWidth
            fontWeight='300'
            fontSize='body'
            color='text2'
            padding='4px'
            onClick={() => handleClick(tx)}
        >
            <p>
                {tx.baseSymbol} / {tx.quoteSymbol}
            </p>
            <p style={{ textAlign: 'center' }}>{txType}</p>
            <p style={{ textAlign: 'center' }}>{txValue}</p>
        </Results>
    );
}
