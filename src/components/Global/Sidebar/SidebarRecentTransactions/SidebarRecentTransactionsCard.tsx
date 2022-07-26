import { ISwap } from '../../../../utils/state/graphDataSlice';

import styles from './SidebarRecentTransactionsCard.module.css';

interface TransactionProps {
    tx: ISwap;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coinGeckoTokenMap?: Map<any, any>;
    chainId: string;
}

export default function SidebarRecentTransactionsCard(props: TransactionProps) {
    const { tx, coinGeckoTokenMap, chainId } = props;

    const baseId = tx.base + '_' + chainId;
    const quoteId = tx.quote + '_' + chainId;

    const baseToken = coinGeckoTokenMap ? coinGeckoTokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = coinGeckoTokenMap ? coinGeckoTokenMap.get(quoteId.toLowerCase()) : null;

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
                {baseToken.symbol} / {quoteToken.symbol}
                {tokenDisplay}
            </div>
        </div>
    );
}
