import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { ISwap } from '../../../../utils/state/graphDataSlice';

import styles from './SidebarRecentTransactionsCard.module.css';
import { Dispatch, SetStateAction } from 'react';

interface TransactionProps {
    tx: ISwap;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coinGeckoTokenMap?: Map<string, TokenIF>;
    chainId: string;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarRecentTransactionsCard(props: TransactionProps) {
    const { tx, coinGeckoTokenMap, chainId, isShowAllEnabled, setIsShowAllEnabled } = props;

    // console.log(tx.source);
    // console.log(tx.block);
    console.log('from recent tx card', isShowAllEnabled);
    const baseId = tx.base + '_' + chainId;
    const quoteId = tx.quote + '_' + chainId;

    const baseToken = coinGeckoTokenMap ? coinGeckoTokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = coinGeckoTokenMap ? coinGeckoTokenMap.get(quoteId.toLowerCase()) : null;

    // const baseTokenDisplay = (
    //     <div className={styles.token_container}>
    //         <img src={baseToken?.logoURI} alt='base token image' />
    //     </div>
    // );

    // const quoteTokenDisplay = (
    //     <div className={styles.token_container}>
    //         <img src={quoteToken?.logoURI} alt='quote token image' />
    //     </div>
    // );

    console.log(isShowAllEnabled);

    function handleTransactionCardClick() {
        if (isShowAllEnabled) {
            setIsShowAllEnabled(false);
            console.log('i am clicked');
        } else {
            console.log('nothing');
        }
    }
    return (
        <div className={styles.container} onClick={() => handleTransactionCardClick()}>
            <div>
                {baseToken?.symbol} / {quoteToken?.symbol}
            </div>
            <div>Swap</div>
            <div className={styles.status_display}>
                Complete
                {/* {baseTokenDisplay} / {quoteTokenDisplay} */}
            </div>
        </div>
    );
}
