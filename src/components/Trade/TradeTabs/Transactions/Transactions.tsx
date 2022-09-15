import styles from './Transactions.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import { CandleData, graphData } from '../../../../utils/state/graphDataSlice';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import TransactionsSkeletons from './TransactionsSkeletons/TransactionsSkeletons';
import Pagination from '../../../Global/Pagination/Pagination';

interface TransactionsProps {
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    tokenMap: Map<string, TokenIF>;
    graphData: graphData;
    chainId: string;
    blockExplorer?: string;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    account: string;
    expandTradeTable: boolean;

    isCandleSelected: boolean | undefined;
    filter: CandleData | undefined;

    openGlobalModal: (content: React.ReactNode) => void;
    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Transactions(props: TransactionsProps) {
    const {
        isShowAllEnabled,
        account,
        graphData,
        tokenMap,
        chainId,
        blockExplorer,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        expandTradeTable,
        isCandleSelected,
        filter,
        // setExpandTradeTable,
    } = props;

    const changesByUser = graphData?.changesByUser?.changes;
    const changesByPool = graphData?.changesByPool?.changes;

    // console.log(changesByPool);

    const dataReceivedByUser = graphData?.changesByUser?.dataReceived;
    const dataReceivedByPool = graphData?.changesByPool?.dataReceived;

    const tradeData = useAppSelector((state) => state.tradeData);

    const [transactionData, setTransactionData] = useState(changesByPool);
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
        setTransactionData(changesByUser);
        setDataReceived(dataReceivedByUser);
    }
    function handleAllPoolSelected() {
        setTransactionData(changesByPool);
        setDataReceived(dataReceivedByPool);
    }

    useEffect(() => {
        isCandleSelected
            ? setTransactionData(
                  changesByPool.filter((data) => {
                      filter?.allSwaps?.includes(data.id);
                  }),
              )
            : !isShowAllEnabled
            ? handleUserPoolSelected()
            : handleAllPoolSelected();
    }, [isShowAllEnabled, isCandleSelected, filter, changesByUser, changesByPool]);

    useEffect(() => {
        // console.log({ dataReceived });
        // console.log({ isDataLoading });
        dataReceived ? handleDataReceived() : setIsDataLoading(true);
    }, [graphData, transactionData, dataReceived]);

    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    // console.log(changesByPool);

    const [transactions] = useState(transactionData);
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(15);

    // Get current transactions
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const usePaginateDataOrNull = expandTradeTable ? currentTransactions : transactionData;

    // console.log({ transactionData });

    const TransactionsDisplay = usePaginateDataOrNull?.map((tx, idx) => (
        //   />
        <TransactionCard
            key={idx}
            tx={tx}
            tokenMap={tokenMap}
            chainId={chainId}
            blockExplorer={blockExplorer}
            tokenAAddress={tokenAAddress}
            tokenBAddress={tokenBAddress}
            isDenomBase={isDenomBase}
            account={account}
            currentTxActiveInTransactions={currentTxActiveInTransactions}
            setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
            openGlobalModal={props.openGlobalModal}
        />
    ));

    const noData = <div className={styles.no_data}>No Data to Display</div>;
    const transactionDataOrNull = dataToDisplay ? TransactionsDisplay : noData;

    return (
        <div className={styles.container}>
            <TransactionCardHeader tradeData={tradeData} />
            <div
                className={`${styles.item_container} ${expandTradeTable && styles.expand_height}`}
                // style={{ height: expandTradeTable ? '100%' : '170px' }}
            >
                {isDataLoading ? <TransactionsSkeletons /> : transactionDataOrNull}
            </div>
            {expandTradeTable && transactionData.length > 30 && (
                <Pagination
                    itemsPerPage={transactionsPerPage}
                    totalItems={transactions.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            )}
        </div>
    );
}
