import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { formatAmountOld } from '../../../../../utils/numbers';
import { getTxType } from './functions/getTxType';

interface propsIF {
    tx: TransactionIF;
}

export default function TxLI(props: propsIF) {
    const { tx } = props;

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

    return (
        <div className={styles.card_container}>
            <div>{tx.baseSymbol} / {tx.quoteSymbol}</div>
            <div>{getTxType(tx.entityType)}</div>
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