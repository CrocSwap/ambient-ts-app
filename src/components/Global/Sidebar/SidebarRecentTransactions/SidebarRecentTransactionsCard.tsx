import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { ISwap } from '../../../../utils/state/graphDataSlice';

import styles from './SidebarRecentTransactionsCard.module.css';
import { Dispatch, SetStateAction } from 'react';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
import { useLocation } from 'react-router-dom';

interface TransactionProps {
    tx: ISwap;
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
}

export default function SidebarRecentTransactionsCard(props: TransactionProps) {
    const location = useLocation();

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 2 : onAccountRoute ? 4 : 0;

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
    } = props;

    const dispatch = useAppDispatch();

    // console.log(tx.source);
    // console.log(tx.block);

    const baseId = tx.base + '_' + chainId;
    const quoteId = tx.quote + '_' + chainId;

    const baseToken = coinGeckoTokenMap ? coinGeckoTokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = coinGeckoTokenMap ? coinGeckoTokenMap.get(quoteId.toLowerCase()) : null;

    // const baseTokenDisplay = (
    //     <div className={styles.token_container}>
    //         <img src={baseToken?.logoURI} alt='base token image' />
    //     </div>
    // );

    // const quoteTokenDisplay = (
    //     <div className={styles.token_container}>
    //         <img src={quoteToken?.logoURI} alt='quote token image' />
    //     </div>
    // );

    function handleRecentTransactionClick(tx: ISwap) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setIsShowAllEnabled(false);

        setCurrentTxActiveInTransactions(tx.id);
        if (baseToken) dispatch(setTokenA(baseToken));
        if (quoteToken) dispatch(setTokenB(quoteToken));
    }

    return (
        <div className={styles.container} onClick={() => handleRecentTransactionClick(tx)}>
            <div>
                {baseToken?.symbol} / {quoteToken?.symbol}
            </div>
            <div>Swap</div>
            <div className={styles.status_display}>
                Complete
                {/* {baseTokenDisplay} / {quoteTokenDisplay} */}
            </div>
        </div>
    );
}
