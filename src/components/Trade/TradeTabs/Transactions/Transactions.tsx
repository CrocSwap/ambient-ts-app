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
    account: string;
    expandTradeTable: boolean;

    isCandleSelected: boolean | undefined;
    filter: CandleData | undefined;
    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Transactions(props: TransactionsProps) {
    const {
        isShowAllEnabled,
        account,
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
                      filter?.allSwaps?.includes(data.id);
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
            account={account}
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
                <div>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore quia, molestias
                    alias illo voluptatem sunt quos est modi possimus id eum enim libero nobis
                    dolorem aperiam quas quis placeat vero et dolore labore officia! Officia maxime
                    laborum porro alias est molestias. In ipsam quam quod amet aspernatur ullam
                    asperiores quae quo nihil mollitia assumenda provident fugit explicabo,
                    suscipit, odit sapiente illo necessitatibus! Maiores id maxime tenetur, quos
                    velit aliquam asperiores aliquid quibusdam, minus blanditiis vel inventore quasi
                    non est provident perferendis ipsam laborum, dolor ad. Error aut magnam dolorem
                    perferendis, reiciendis, libero cum consequatur incidunt placeat aperiam, veniam
                    necessitatibus temporibus. Lorem ipsum dolor sit amet consectetur adipisicing
                    elit. Incidunt nam cum nemo! Perferendis, quis minima. Consectetur deleniti
                    alias architecto dolores obcaecati eligendi modi eum eveniet unde aliquid
                    facere, deserunt est a porro, vitae quidem officia nisi mollitia! Hic expedita
                    ad, quidem possimus sapiente rerum praesentium laboriosam quisquam corporis
                    ipsam exercitationem itaque aspernatur nihil laudantium minima vel architecto
                    tempora molestias, cum harum enim. Accusantium modi voluptatum repudiandae
                    ipsam. Iste, laborum eos inventore impedit, sit iure veniam dolore beatae,
                    consequuntur sint assumenda est minus cupiditate corrupti repudiandae provident
                    veritatis accusamus! Alias officia, incidunt quae sit, consequatur animi
                    voluptate eaque molestiae quam quod, corrupti commodi mollitia. Deserunt est
                    beatae illum architecto vel omnis doloribus. Assumenda esse modi iste deleniti
                    doloremque, tenetur suscipit repudiandae voluptates dolores fugiat numquam
                    incidunt similique perferendis ratione labore odio soluta. Voluptatum, placeat
                    tempore suscipit officiis ab laudantium, nam aliquam nisi minus sed saepe, est
                    molestiae incidunt nemo optio at vitae. Vitae aut delectus necessitatibus
                    possimus aspernatur doloremque error laudantium veniam porro a. Tempora, nobis
                    aliquid deleniti perspiciatis esse quae deserunt sequi, quasi quaerat
                    necessitatibus laboriosam, unde illo cum veniam eaque itaque! Ipsam debitis vero
                    aut ut assumenda consectetur, libero eligendi rem impedit quam dignissimos iste
                    nesciunt, voluptate itaque provident id perferendis commodi nihil quia, unde
                    temporibus. Veniam deserunt saepe nisi quod eius rem repellendus sit facilis
                    voluptate, nihil, qui id vel commodi dolorem, cupiditate maxime deleniti
                    inventore explicabo quibusdam? Nobis iste dicta aliquid pariatur perspiciatis
                    accusantium ratione facilis, voluptas at sint praesentium ipsa esse, soluta
                    reprehenderit? Similique praesentium cupiditate quibusdam placeat dolore sed
                    quae perspiciatis? Quos assumenda nam repellendus quibusdam nulla sunt atque cum
                    qui laudantium est ipsam, id a iusto ab eaque magnam vel molestiae aliquid alias
                    itaque rerum sequi labore ad incidunt. A suscipit dolorum ipsum id quod corrupti
                    possimus praesentium ipsam dignissimos reiciendis! Nam, odio ipsa.
                </div>
                {isDataLoading ? <TransactionsSkeletons /> : transactionDataOrNull}
            </div>
        </div>
    );
}
