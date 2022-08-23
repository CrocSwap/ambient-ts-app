import styles from './Transactions.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import { CandleData, graphData } from '../../../../utils/state/graphDataSlice';
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

    isCandleSelected: boolean | undefined;
    filter: CandleData | undefined;
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
        isCandleSelected,
        filter,
        // setExpandTradeTable,
    } = props;

    const swapsByUser = graphData?.swapsByUser?.swaps;
    const swapsByPool = graphData?.swapsByPool?.swaps;

    const dataReceivedByUser = graphData?.swapsByUser?.dataReceived;
    const dataReceivedByPool = graphData?.swapsByPool?.dataReceived;

    const tradeData = useAppSelector((state) => state.tradeData);

    const [transactionData, setTransactionData] = useState(swapsByPool);
    const [dataReceived, setDataReceived] = useState(dataReceivedByPool);
    // todoJr: Finish this loading logic
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataToDisplay, setDataToDisplay] = useState(false);

    // check to see if data is received
    // if it is, set data is loading to false
    // check to see if we have items to display
    // if we do, set data to display to true
    // else set data to display to false
    // else set data is loading to true

    // 0x0000000000000000000000000000000000000000
    // 0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60

    function handleDataReceived() {
        setIsDataLoading(false);
        transactionData.length ? setDataToDisplay(true) : setDataToDisplay(false);
    }
    function handleUserPoolSelected() {
        setTransactionData(swapsByUser);
        setDataReceived(dataReceivedByUser);
    }
    function handleAllPoolSelected() {
        setTransactionData(swapsByPool);
        setDataReceived(dataReceivedByPool);
    }

    useEffect(() => {
        isCandleSelected
            ? setTransactionData(
                  swapsByPool.filter((data) => {
                      filter?.allSwaps.includes(data.id);
                  }),
              )
            : !isShowAllEnabled
            ? handleUserPoolSelected()
            : handleAllPoolSelected();
    }, [isShowAllEnabled, isCandleSelected, filter, swapsByUser, swapsByPool]);

    useEffect(() => {
        // console.log({ dataReceived });
        // console.log({ isDataLoading });
        dataReceived ? handleDataReceived() : setIsDataLoading(true);
    }, [graphData, transactionData, dataReceived]);

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

    const noData = <div className={styles.no_data}>No Data to Display</div>;
    const transactionDataOrNull = dataToDisplay ? TransactionsDisplay : noData;

    return (
        <div className={styles.container}>
            <TransactionCardHeader tradeData={tradeData} />
            <div
                className={styles.item_container}
                style={{ height: expandTradeTable ? '100%' : '170px' }}
            >
                {isDataLoading ? <TransactionsSkeletons /> : transactionDataOrNull}
            </div>
        </div>
    );
}
