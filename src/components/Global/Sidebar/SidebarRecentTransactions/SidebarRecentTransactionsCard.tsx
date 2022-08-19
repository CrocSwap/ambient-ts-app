import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { ISwap } from '../../../../utils/state/graphDataSlice';

import styles from './SidebarRecentTransactionsCard.module.css';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
import { useLocation } from 'react-router-dom';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { formatAmount } from '../../../../utils/numbers';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';

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

    const [baseFlowDisplay, setBaseFlowDisplay] = useState<string | undefined>(undefined);
    //  const [quoteFlowDisplay, setQuoteFlowDisplay] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (tx.baseFlow && tx.baseDecimals) {
            const baseFlowDisplayNum = parseFloat(toDisplayQty(tx.baseFlow, tx.baseDecimals));
            const baseFlowAbsNum = Math.abs(baseFlowDisplayNum);
            const isBaseFlowNegative = baseFlowDisplayNum < 0;
            const baseFlowDisplayTruncated =
                baseFlowAbsNum === 0
                    ? '0'
                    : baseFlowAbsNum < 0.0001
                    ? baseFlowDisplayNum.toExponential(2)
                    : baseFlowAbsNum < 2
                    ? baseFlowAbsNum.toPrecision(3)
                    : baseFlowAbsNum >= 100000
                    ? formatAmount(baseFlowAbsNum)
                    : // ? baseLiqDisplayNum.toExponential(2)
                      baseFlowAbsNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            const baseFlowDisplayString = isBaseFlowNegative
                ? `(${baseFlowDisplayTruncated})`
                : baseFlowDisplayTruncated;
            setBaseFlowDisplay(baseFlowDisplayString);
        }
        //  if (swap.quoteFlow && swap.quoteDecimals) {
        //      const quoteFlowDisplayNum = parseFloat(
        //          toDisplayQty(swap.quoteFlow, swap.quoteDecimals),
        //      );
        //      const quoteFlowAbsNum = Math.abs(quoteFlowDisplayNum);
        //      const isQuoteFlowNegative = quoteFlowDisplayNum < 0;
        //      const quoteFlowDisplayTruncated =
        //          quoteFlowAbsNum === 0
        //              ? '0'
        //              : quoteFlowAbsNum < 0.0001
        //              ? quoteFlowDisplayNum.toExponential(2)
        //              : quoteFlowAbsNum < 2
        //              ? quoteFlowAbsNum.toPrecision(3)
        //              : quoteFlowAbsNum >= 100000
        //              ? formatAmount(quoteFlowAbsNum)
        //              : // ? quoteLiqDisplayNum.toExponential(2)
        //                quoteFlowAbsNum.toLocaleString(undefined, {
        //                    minimumFractionDigits: 2,
        //                    maximumFractionDigits: 2,
        //                });
        //      const quoteFlowDisplayString = isQuoteFlowNegative
        //          ? `(${quoteFlowDisplayTruncated})`
        //          : quoteFlowDisplayTruncated;
        //      setQuoteFlowDisplay(quoteFlowDisplayString);
        //  }
    }, [JSON.stringify(tx)]);
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
    const baseTokenCharacter = baseToken ? getUnicodeCharacter(baseToken?.symbol) : null;

    return (
        <div className={styles.container} onClick={() => handleRecentTransactionClick(tx)}>
            <div>
                {baseToken?.symbol} / {quoteToken?.symbol}
            </div>
            <div>Market</div>
            <div className={styles.status_display}>
                {baseTokenCharacter} {baseFlowDisplay}
                {/* {baseTokenDisplay} / {quoteTokenDisplay} */}
            </div>
        </div>
    );
}
