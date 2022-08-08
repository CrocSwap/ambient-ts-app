import styles from './Transactions.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import { graphData } from '../../../../utils/state/graphDataSlice';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import TransactionsSkeletons from './TransactionsSkeletons/TransactionsSkeletons';

interface TransactionsProps {
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    tokenMap: Map<string, TokenIF>;
    graphData: graphData;
    chainId: string;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;

    expandTradeTable: boolean;
    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Transactions(props: TransactionsProps) {
    const {
        isShowAllEnabled,
        graphData,
        tokenMap,
        chainId,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        expandTradeTable,
        // setExpandTradeTable,
    } = props;

    const swapsByUser = graphData?.swapsByUser?.swaps;
    const swapsByPool = graphData?.swapsByPool?.swaps;
    // console.log('this is graph data', graphData);

    const tradeData = useAppSelector((state) => state.tradeData);

    const [transactionData, setTransactionData] = useState(swapsByPool);
    // todoJr: Finish this loading logic
    const [isDataLoading, setIsDataLoading] = useState(true);
    useEffect(() => {
        if (swapsByPool.length) {
            setIsDataLoading(false);
        }
    }, [graphData, transactionData]);

    // console.log(isDataLoading);

    useEffect(() => {
        !isShowAllEnabled ? setTransactionData(swapsByUser) : setTransactionData(swapsByPool);
    }, [isShowAllEnabled]);

    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const TransactionsDisplay = transactionData?.map((swap, idx) => (
        //   />
        <TransactionCard
            key={idx}
            swap={swap}
            tokenMap={tokenMap}
            chainId={chainId}
            tokenAAddress={tokenAAddress}
            tokenBAddress={tokenBAddress}
            isDenomBase={isDenomBase}
            currentTxActiveInTransactions={currentTxActiveInTransactions}
            setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
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
            <div
                className={styles.item_container}
                style={{ height: expandTradeTable ? '100%' : '220px' }}
            >
                {isDataLoading ? <TransactionsSkeletons /> : TransactionsDisplay}
            </div>
        </div>
    );
}
