import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SidebarRecentTransactionsCard.module.css';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { formatAmountOld } from '../../../../utils/numbers';

interface TransactionProps {
    tx: ITransaction;
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

export default function SidebarRecentTransactionsCard(props: TransactionProps) {
    const {
        tx,
        // coinGeckoTokenMap,
        // chainId,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
        setSelectedOutsideTab,
        setOutsideControl,
        tabToSwitchToBasedOnRoute,
    } = props;

    // const baseId = tx.base + '_' + chainId;
    // const quoteId = tx.quote + '_' + chainId;

    // const getToken = (addr: string) => coinGeckoTokenMap.get(addr.toLowerCase());
    // const baseToken = getToken(baseId) as TokenIF;
    // const quoteToken = getToken(quoteId) as TokenIF;

    const { pathname } = useLocation();

    const linkPath = useMemo(() => {
        let locationSlug = '';
        if (tx.entityType === 'swap') {
            locationSlug = '/trade/market';
        } else if (tx.entityType === 'limitOrder') {
            locationSlug = '/trade/limit';
        } else if (tx.entityType === 'liqchange') {
            locationSlug = '/trade/range';
        } else {
            locationSlug = '/trade/market';
        }
        return locationSlug + '/chain=0x5&tokenA=' + tx.base + '&tokenB=' + tx.quote;
    }, [pathname]);
    // const linkPath = useMemo(() => {
    //     let locationSlug = '';
    //     if (pathname.startsWith('/trade/market') || pathname.startsWith('/account')) {
    //         locationSlug = '/trade/market';
    //     } else if (pathname.startsWith('/trade/limit')) {
    //         locationSlug = '/trade/limit';
    //     } else if (pathname.startsWith('/trade/range')) {
    //         locationSlug = '/trade/range';
    //     } else if (pathname.startsWith('/swap')) {
    //         locationSlug = '/swap';
    //     }
    //     return locationSlug + '/chain=0x5&tokenA=' + tx.base + '&tokenB=' + tx.quote;
    // }, [pathname]);

    // const [valueUSD, setValueUSD] = useState<string | undefined>(undefined);

    // useEffect(() => {
    //     if (tx.valueUSD) {
    //         setValueUSD(formatAmountOld(tx.valueUSD));
    //     } else {
    //         setValueUSD(undefined);
    //     }
    // }, [JSON.stringify(tx)]);

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

    function handleRecentTransactionClick(tx: ITransaction) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setIsShowAllEnabled(false);
        setCurrentTxActiveInTransactions(tx.id);
        navigate(linkPath);
    }

    const transactionTypeSide =
        tx.entityType === 'swap' ? 'Market' : tx.entityType === 'limitOrder' ? 'Limit' : 'Range';
    // tx.entityType === 'swap'
    //     ? tx.isBuy
    //         ? 'Market (-)'
    //         : 'Market (+)'
    //     : tx.entityType === 'limitOrder'
    //     ? tx.isBid
    //         ? 'Limit (-)'
    //         : 'Limit (+)'
    //     : tx.changeType === 'burn'
    //     ? 'Range (-)'
    //     : 'Range (+)';

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
