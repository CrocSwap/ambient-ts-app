import { ISwap } from '../../../../utils/state/graphDataSlice';

import { useEffect } from 'react';
import styles from './SidebarRecentTransactionsCard.module.css';

interface TransactionProps {
    tx: ISwap;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coinGeckoTokenMap?: Map<any, any>;
    chainId: string;
}

export default function SidebarRecentTransactionsCard(props: TransactionProps) {
    const { tx, coinGeckoTokenMap, chainId } = props;

    const quoteId = tx.quote + '_' + chainId;
    // console.log({ quoteId });
    // console.log({ coinGeckoTokenMap });

    const quoteToken = coinGeckoTokenMap ? coinGeckoTokenMap.get(quoteId) : null;

    useEffect(() => {
        console.log({ quoteToken });
    }, [quoteToken]);

    const tokenDisplay = (
        <div className={styles.token_container}>
            <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/2048px-Ethereum-icon-purple.svg.png'
                alt='token image'
            />
        </div>
    );
    return (
        <div className={styles.container}>
            <div>{tx.block}</div>
            <div>Swap</div>
            <div className={styles.status_display}>
                {tx.inBaseQty}
                {tokenDisplay}
            </div>
        </div>
    );
}
