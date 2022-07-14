import Transaction from '../../Transaction/Transaction';
import styles from './Transactions.module.css';
import { graphData } from '../../../utils/state/graphDataSlice';
import { useAppSelector } from './../../../utils/hooks/reduxToolkit';
import { useMoralis } from 'react-moralis';
import TransactionCard from '../../Transaction/TransactionCard';

interface TransactionsProps {
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    graphData: graphData;
}

export default function Transactions(props: TransactionsProps) {
    const {
        // portfolio,
        //  notOnTradeRoute,
        isShowAllEnabled,
        graphData,
    } = props;

    const tradeData = useAppSelector((state) => state.tradeData);

    const { account, isAuthenticated } = useMoralis();

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    // const exampleTransactions = [1, 2, 3];

    const swapsByUser = graphData?.swapsByUser?.swaps;
    const swapsByPool = graphData?.swapsByPool?.swaps;

    const TransactionsDisplay = isShowAllEnabled
        ? swapsByPool
              .map((swap, idx) => (
                  //   <Transaction
                  //       key={idx}
                  //       swap={swap}
                  //       tokenAAddress={tokenAAddress}
                  //       tokenBAddress={tokenBAddress}
                  //       account={account ?? undefined}
                  //       isAuthenticated={isAuthenticated}
                  //       isShowAllEnabled={isShowAllEnabled}
                  //   />
                  <TransactionCard key={idx} />
              ))
              .reverse()
        : swapsByUser
              .map((swap, idx) => (
                  //   <Transaction
                  //       key={idx}
                  //       swap={swap}
                  //       tokenAAddress={tokenAAddress}
                  //       tokenBAddress={tokenBAddress}
                  //       account={account ?? undefined}
                  //       isAuthenticated={isAuthenticated}
                  //       isShowAllEnabled={isShowAllEnabled}
                  //   />
                  <TransactionCard key={idx} />
              ))
              .reverse();

    return (
        <>
            <>{TransactionsDisplay}</>
        </>
    );
}
