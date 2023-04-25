import { Dispatch, SetStateAction } from 'react';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarSearchResults.module.css';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults/PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults/OrdersSearchResults';
import TxSearchResults from './TxSearchResults/TxSearchResults';
import { PoolStatsFn } from '../../../functions/getPoolStats';
import { ackTokensMethodsIF } from '../../../hooks/useAckTokens';
import { sidebarSearchIF } from '../useSidebarSearch';

interface propsIF {
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
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
    ackTokens: ackTokensMethodsIF;
    searchData: sidebarSearchIF;
}

export default function SidebarSearchResults(props: propsIF) {
    const {
        searchData,
        getTokenByAddress,
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
        ackTokens,
    } = props;

    return (
        <div className={styles.container}>
            <div className={styles.search_result_title}>Search Results</div>
            <PoolsSearchResults
                searchedPools={searchData.pools}
                getTokenByAddress={getTokenByAddress}
                tokenPair={tokenPair}
                chainId={chainId}
                cachedPoolStatsFetch={cachedPoolStatsFetch}
                ackTokens={ackTokens}
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
