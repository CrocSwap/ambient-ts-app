import styles from './Transactions.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import { graphData } from '../../../../utils/state/graphDataSlice';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { ISwap } from './../../../../utils/state/graphDataSlice';

interface TransactionsProps {
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    portfolio?: boolean;
    tokenMap: Map<string, TokenIF>;
    graphData: graphData;
    chainId: string;
    currentClickedTxHashFromRecentTx: string;
    SetCurrentClickedTxHashFromRecentTx: Dispatch<SetStateAction<string>>;
}
export default function Transactions(props: TransactionsProps) {
    const {
        isShowAllEnabled,
        graphData,
        tokenMap,
        chainId,
        setIsShowAllEnabled,
        currentClickedTxHashFromRecentTx,
        SetCurrentClickedTxHashFromRecentTx,
    } = props;

    const swapsByUser = graphData?.swapsByUser?.swaps;
    const swapsByPool = graphData?.swapsByPool?.swaps;

    const [poolData, setPoolData] = useState<ISwap[]>();

    console.log({ swapsByUser });
    console.log({ swapsByPool });

    useEffect(() => {
        if (isShowAllEnabled) {
            setPoolData(swapsByPool);
        } else {
            setPoolData(swapsByUser);
        }
    }, [isShowAllEnabled]);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const TransactionsDisplay = poolData?.map((swap, idx) => (
        //   />
        <TransactionCard
            key={idx}
            swap={swap}
            tokenMap={tokenMap}
            chainId={chainId}
            tokenAAddress={tokenAAddress}
            tokenBAddress={tokenBAddress}
            isDenomBase={isDenomBase}
            currentClickedTxHashFromRecentTx={currentClickedTxHashFromRecentTx}
            SetCurrentClickedTxHashFromRecentTx={SetCurrentClickedTxHashFromRecentTx}
        />
    ));
    // : //   .reverse()
    //   swapsByUser?.map((swap, idx) => (
    //       <TransactionCard
    //           key={idx}
    //           swap={swap}
    //           tokenMap={tokenMap}
    //           chainId={chainId}
    //           tokenAAddress={tokenAAddress}
    //           tokenBAddress={tokenBAddress}
    //           isDenomBase={isDenomBase}
    //       />
    //   ));

    return (
        <div className={styles.container}>
            <TransactionCardHeader />
            <div className={styles.item_container}>{TransactionsDisplay}</div>
        </div>
    );
}
