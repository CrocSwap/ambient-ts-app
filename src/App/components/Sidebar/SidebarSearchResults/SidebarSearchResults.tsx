import { Dispatch, SetStateAction } from 'react';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarSearchResults.module.css';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults/PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults/OrdersSearchResults';
import TxSearchResults from './TxSearchResults/TxSearchResults';
import { PoolStatsFn } from '../../../functions/getPoolStats';
import { sidebarSearchIF } from '../useSidebarSearch';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface propsIF {
    tokenPair: TokenPairIF;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    isDenomBase: boolean;
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
        cachedPoolStatsFetch,
        isDenomBase,
        setCurrentPositionActive,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled,
    } = props;
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    return (
        <div className={styles.container}>
            <div className={styles.search_result_title}>Search Results</div>
            <PoolsSearchResults
                searchedPools={searchData.pools}
                tokenPair={tokenPair}
                chainId={chainId}
                cachedPoolStatsFetch={cachedPoolStatsFetch}
            />
            {isUserConnected && (
                <>
                    <TxSearchResults
                        chainId={chainId}
                        searchedTxs={searchData.txs}
                        setCurrentTxActiveInTransactions={
                            setCurrentTxActiveInTransactions
                        }
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                    <OrdersSearchResults
                        chainId={chainId}
                        searchedLimitOrders={searchData.limits}
                        isDenomBase={isDenomBase}
                        setCurrentPositionActive={setCurrentPositionActive}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                    <PositionsSearchResults
                        chainId={chainId}
                        searchedPositions={searchData.positions}
                        isDenomBase={isDenomBase}
                        setCurrentPositionActive={setCurrentPositionActive}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                </>
            )}
        </div>
    );
}
