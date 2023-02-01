import { Dispatch, SetStateAction } from 'react';
import {
    LimitOrderIF,
    PositionIF,
    TokenIF,
    TokenPairIF,
    TempPoolIF,
    TransactionIF,
} from '../../../../utils/interfaces/exports';
import styles from './SidebarSearchResults.module.css';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults/PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults/OrdersSearchResults';
import TxSearchResults from './TxSearchResults/TxSearchResults';
import { PoolStatsFn } from '../../../functions/getPoolStats';

interface propsIF {
    searchedPools: TempPoolIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
    isConnected: boolean;
    cachedPoolStatsFetch: PoolStatsFn;
    searchedPositions: PositionIF[];
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    searchedTxs: TransactionIF[];
    searchedLimitOrders: LimitOrderIF[];
}

export default function SidebarSearchResults(props: propsIF) {
    const {
        searchedPools,
        getTokenByAddress,
        tokenPair,
        chainId,
        isConnected,
        cachedPoolStatsFetch,
        searchedPositions,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
        searchedTxs,
        searchedLimitOrders,
    } = props;

    return (
        <div className={styles.container}>
            <div className={styles.search_result_title}>Search Results</div>
            <PoolsSearchResults
                searchedPools={searchedPools}
                getTokenByAddress={getTokenByAddress}
                tokenPair={tokenPair}
                chainId={chainId}
                cachedPoolStatsFetch={cachedPoolStatsFetch}
            />
            {isConnected && (
                <>
                    <TxSearchResults
                        chainId={chainId}
                        searchedTxs={searchedTxs}
                        setOutsideControl={setOutsideControl}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                    <OrdersSearchResults
                        chainId={chainId}
                        searchedLimitOrders={searchedLimitOrders}
                        isDenomBase={isDenomBase}
                        setOutsideControl={setOutsideControl}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setCurrentPositionActive={setCurrentPositionActive}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                    <PositionsSearchResults
                        chainId={chainId}
                        searchedPositions={searchedPositions}
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
