import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { formatAmountOld } from '../../../../../utils/numbers';

interface propsIF {
    tx: TransactionIF;
}

export default function TxLI(props: propsIF) {
    const { tx } = props;

    // TODO:   @Emily  replace Price and Qty in template below with live
    // TODO:   @Emily  ... data, refer to SidebarRecentTransactionsCard.tsx
    // TODO:   @Emily  ... component file as a model to replicate logic

    const usdValueNum = tx.valueUSD;
    const totalValueUSD = tx.totalValueUSD;
    const totalFlowUSD = tx.totalFlowUSD;
    const totalFlowAbsNum = totalFlowUSD !== undefined ? Math.abs(totalFlowUSD) : undefined;

    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 10000
        ? formatAmountOld(usdValueNum, 1)
        : // ? baseLiqDisplayNum.toExponential(2)
        usdValueNum.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const totalValueUSDTruncated = !totalValueUSD
        ? undefined
        : totalValueUSD < 0.001
        ? totalValueUSD.toExponential(2)
        : totalValueUSD < 2
        ? totalValueUSD.toPrecision(3)
        : totalValueUSD >= 10000
        ? formatAmountOld(totalValueUSD, 1)
        : // ? baseLiqDisplayNum.toExponential(2)
        totalValueUSD.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const totalFlowUSDTruncated =
        totalFlowAbsNum === undefined
            ? undefined
            : totalFlowAbsNum === 0
            ? '0.00'
            : totalFlowAbsNum < 0.001
            ? totalFlowAbsNum.toExponential(2)
            : totalFlowAbsNum < 2
            ? totalFlowAbsNum.toPrecision(3)
            : totalFlowAbsNum >= 10000
            ? formatAmountOld(totalFlowAbsNum, 1)
            : // ? baseLiqDisplayNum.toExponential(2)
            totalFlowAbsNum.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

    const transactionTypeSide = tx.entityType === 'swap'
        ? 'Market' : tx.entityType === 'limitOrder'
        ? 'Limit'
        : 'Range';

    return (
        <div className={styles.card_container}>
            <div>{tx.baseSymbol} / {tx.quoteSymbol}</div>
            <div>{transactionTypeSide}</div>
            <div className={styles.status_display}>
                {totalFlowUSDTruncated !== undefined
                    ? '$' + totalFlowUSDTruncated
                    : totalValueUSDTruncated
                    ? '$' + totalValueUSDTruncated
                    : usdValueTruncated
                    ? '$' + usdValueTruncated
                    : '…'}
            </div>
        </div>
    );
}