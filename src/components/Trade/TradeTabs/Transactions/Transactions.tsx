import styles from './Transactions.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import { graphData } from '../../../../utils/state/graphDataSlice';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface TransactionsProps {
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    tokenMap: Map<string, TokenIF>;
    graphData: graphData;
    chainId: string;
}
export default function Transactions(props: TransactionsProps) {
    const { isShowAllEnabled, graphData, tokenMap, chainId } = props;

    const swapsByUser = graphData?.swapsByUser?.swaps;
    const swapsByPool = graphData?.swapsByPool?.swaps;

    const tradeData = useAppSelector((state) => state.tradeData);

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const TransactionsDisplay = isShowAllEnabled
        ? swapsByPool.map((swap, idx) => (
              //   />
              <TransactionCard
                  key={idx}
                  swap={swap}
                  tokenMap={tokenMap}
                  chainId={chainId}
                  tokenAAddress={tokenAAddress}
                  tokenBAddress={tokenBAddress}
              />
          ))
        : //   .reverse()
          swapsByUser.map((swap, idx) => (
              <TransactionCard
                  key={idx}
                  swap={swap}
                  tokenMap={tokenMap}
                  chainId={chainId}
                  tokenAAddress={tokenAAddress}
                  tokenBAddress={tokenBAddress}
              />
          ));

    return (
        <div className={styles.container}>
            <TransactionCardHeader />
            {TransactionsDisplay}
        </div>
    );
}
