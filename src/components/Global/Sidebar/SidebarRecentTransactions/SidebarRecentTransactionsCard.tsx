import { TransactionIF } from '../../../../utils/interfaces/exports';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import { EntityType, getTxType } from '../../../../App/functions/getTxType';
import { ItemContainer } from '../../../../styled/Components/Sidebar';
import { FlexContainer } from '../../../../styled/Common';

interface propsIF {
    tx: TransactionIF;
    handleClick: (tx: TransactionIF) => void;
}

export default function SidebarRecentTransactionsCard(props: propsIF) {
    const { tx, handleClick } = props;

    // human-readable form of transaction type to display in DOM
    const txType = getTxType(tx.entityType as EntityType);

    // human-readable form of transaction value to display in DOM
    const txValue = getFormattedNumber({
        value: tx.totalValueUSD,
        prefix: '$',
    });

    return (
        <ItemContainer
            numCols={3}
            color='text2'
            onClick={() => handleClick(tx)}
        >
            {[`${tx.baseSymbol} / ${tx.quoteSymbol}`, txType, txValue].map(
                (item) => (
                    <FlexContainer
                        key={item}
                        justifyContent='center'
                        alignItems='center'
                        padding='4px'
                    >
                        {item}
                    </FlexContainer>
                ),
            )}
        </ItemContainer>
    );
}
