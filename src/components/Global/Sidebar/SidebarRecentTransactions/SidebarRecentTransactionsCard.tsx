import { TokenIF, TransactionIF } from '../../../../utils/interfaces/exports';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SidebarRecentTransactionsCard.module.css';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { formatAmountOld } from '../../../../utils/numbers';

interface propsIF {
    tx: TransactionIF;
    coinGeckoTokenMap: Map<string, TokenIF>;
    chainId: string;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    tabToSwitchToBasedOnRoute: number;
}

export default function SidebarRecentTransactionsCard(props: propsIF) {
    const {
        tx,
        // coinGeckoTokenMap,
        chainId,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
        setSelectedOutsideTab,
        setOutsideControl,
        tabToSwitchToBasedOnRoute,
    } = props;

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

    const navigate = useNavigate();

    function handleRecentTransactionClick(tx: TransactionIF) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setIsShowAllEnabled(false);
        setCurrentTxActiveInTransactions(tx.id);
        navigate(
            '/trade/market/chain=' +
            chainId +
            '&tokenA=' +
            tx.base +
            '&tokenB=' +
            tx.quote
        );
    }

    const transactionTypeSide =
        tx.entityType === 'swap' ? 'Market' : tx.entityType === 'limitOrder' ? 'Limit' : 'Range';

    return (
        <div className={styles.container} onClick={() => handleRecentTransactionClick(tx)}>
            <div>
                {tx.baseSymbol} / {tx.quoteSymbol}
            </div>
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
