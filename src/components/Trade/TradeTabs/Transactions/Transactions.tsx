import styles from './Transactions.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import { graphData } from '../../../../utils/state/graphDataSlice';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useState, useEffect } from 'react';

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

    const [poolData, setPoolData] = useState(swapsByPool);

    useEffect(() => {
        if (isShowAllEnabled) {
            setPoolData(swapsByUser);
        } else {
            setPoolData(swapsByPool);
        }
    }, [isShowAllEnabled, swapsByPool, swapsByUser]);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    console.log({ swapsByUser });
    console.log(isShowAllEnabled);

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
