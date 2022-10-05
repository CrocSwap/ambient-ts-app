import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SidebarRecentTransactionsCard.module.css';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { formatAmount } from '../../../../utils/numbers';

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
        coinGeckoTokenMap,
        chainId,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
        setSelectedOutsideTab,
        setOutsideControl,
        tabToSwitchToBasedOnRoute,
    } = props;

    const baseId = tx.base + '_' + chainId;
    const quoteId = tx.quote + '_' + chainId;

    const getToken = (addr: string) => coinGeckoTokenMap.get(addr.toLowerCase());
    const baseToken = getToken(baseId) as TokenIF;
    const quoteToken = getToken(quoteId) as TokenIF;

    const { pathname } = useLocation();

    const linkPath = useMemo(() => {
        let locationSlug = '';
        if (
            pathname.startsWith('/trade/market') ||
            pathname.startsWith('/account')
        ) {
            locationSlug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            locationSlug = '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            locationSlug = '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            locationSlug = '/swap';
        }
        return (
            locationSlug +
            '/chain=0x5&tokenA=' +
            baseToken.address +
            '&tokenB=' +
            quoteToken.address
        );
    }, [pathname]);

    const [valueUSD, setValueUSD] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (tx.valueUSD) {
            setValueUSD(formatAmount(tx.valueUSD));
        } else {
            setValueUSD(undefined);
        }
    }, [JSON.stringify(tx)]);

    const navigate = useNavigate();

    function handleRecentTransactionClick(tx: ITransaction) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setIsShowAllEnabled(false);
        setCurrentTxActiveInTransactions(tx.id);
        navigate(linkPath);
    }

    const transactionTypeSide =
        tx.entityType === 'swap'
            ? 'Market'
            : tx.entityType === 'limitOrder'
            ? 'Limit Order'
            : tx.changeType === 'burn'
            ? 'Range (-)'
            : 'Range (+)';

    return (
        <div className={styles.container} onClick={() => handleRecentTransactionClick(tx)}>
            <div>
                {baseToken.symbol} / {quoteToken.symbol}
            </div>
            <div>{transactionTypeSide}</div>
            <div className={styles.status_display}>
                {valueUSD ? `$${valueUSD}` : '…'}
            </div>
        </div>
    );
}
