import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { ITransaction } from '../../../../utils/state/graphDataSlice';

import styles from './SidebarRecentTransactionsCard.module.css';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
// import { toDisplayQty } from '@crocswap-libs/sdk';
import { formatAmount } from '../../../../utils/numbers';
// import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';

interface TransactionProps {
    tx: ITransaction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coinGeckoTokenMap?: Map<string, TokenIF>;
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
        // currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        // isShowAllEnabled,
        setIsShowAllEnabled,

        // selectedOutsideTab,
        setSelectedOutsideTab,
        // outsideControl,
        setOutsideControl,

        tabToSwitchToBasedOnRoute,
    } = props;

    const dispatch = useAppDispatch();

    // console.log(tx.source);
    // console.log(tx.block);

    const baseId = tx.base + '_' + chainId;
    const quoteId = tx.quote + '_' + chainId;

    const baseToken = coinGeckoTokenMap ? coinGeckoTokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = coinGeckoTokenMap ? coinGeckoTokenMap.get(quoteId.toLowerCase()) : null;

    // const [baseFlowDisplay, setBaseFlowDisplay] = useState<string | undefined>(undefined);
    const [valueUSD, setValueUSD] = useState<string | undefined>(undefined);
    //  const [quoteFlowDisplay, setQuoteFlowDisplay] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (tx.valueUSD) {
            setValueUSD(formatAmount(tx.valueUSD));
        } else {
            setValueUSD(undefined);
        }
    }, [JSON.stringify(tx)]);

    function handleRecentTransactionClick(tx: ITransaction) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setIsShowAllEnabled(false);

        setCurrentTxActiveInTransactions(tx.id);
        if (baseToken) dispatch(setTokenA(baseToken));
        if (quoteToken) dispatch(setTokenB(quoteToken));
    }
    // const baseTokenCharacter = baseToken ? getUnicodeCharacter(baseToken?.symbol) : null;

    return (
        <div className={styles.container} onClick={() => handleRecentTransactionClick(tx)}>
            <div>
                {baseToken?.symbol} / {quoteToken?.symbol}
            </div>
            <div>{tx.changeType}</div>
            <div className={styles.status_display}>
                {valueUSD ? `$${valueUSD}` : '…'}
                {/* {baseTokenDisplay} / {quoteTokenDisplay} */}
            </div>
        </div>
    );
}
