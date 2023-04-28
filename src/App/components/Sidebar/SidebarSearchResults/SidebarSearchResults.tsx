import { Dispatch, SetStateAction } from 'react';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarSearchResults.module.css';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults/PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults/OrdersSearchResults';
import TxSearchResults from './TxSearchResults/TxSearchResults';
import { PoolStatsFn } from '../../../functions/getPoolStats';
import { sidebarSearchIF } from '../useSidebarSearch';

interface propsIF {
    tokenPair: TokenPairIF;
    chainId: string;
    isConnected: boolean;
    cachedPoolStatsFetch: PoolStatsFn;
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    searchData: sidebarSearchIF;
}

export default function SidebarSearchResults(props: propsIF) {
    const {
        searchData,
        tokenPair,
        chainId,
        isConnected,
        cachedPoolStatsFetch,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
    } = props;

    return (
        <div className={styles.container}>
            <div className={styles.search_result_title}>Search Results</div>
            <PoolsSearchResults
                searchedPools={searchData.pools}
                tokenPair={tokenPair}
                chainId={chainId}
                cachedPoolStatsFetch={cachedPoolStatsFetch}
            />
            {isConnected && (
                <>
                    <TxSearchResults
                        chainId={chainId}
                        searchedTxs={searchData.txs}
                        setOutsideControl={setOutsideControl}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setCurrentTxActiveInTransactions={
                            setCurrentTxActiveInTransactions
                        }
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                    <OrdersSearchResults
                        chainId={chainId}
                        searchedLimitOrders={searchData.limits}
                        isDenomBase={isDenomBase}
                        setOutsideControl={setOutsideControl}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setCurrentPositionActive={setCurrentPositionActive}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                    <PositionsSearchResults
                        chainId={chainId}
                        searchedPositions={searchData.positions}
                        isDenomBase={isDenomBase}
                        setOutsideControl={setOutsideControl}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setCurrentPositionActive={setCurrentPositionActive}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                </>
            )}
        </div>
    );
}
