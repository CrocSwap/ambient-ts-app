import { Dispatch, SetStateAction, ReactNode } from 'react';
import { PositionIF, TokenIF, TokenPairIF, TempPoolIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarSearchResults.module.css';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults/PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults/OrdersSearchResults';
import TransactionsSearchResults from './TransactionsResults/TransactionsResults';
import { PoolStatsFn } from '../../../functions/getPoolStats';

interface SidebarSearchResultsPropsIF {
    searchedPools: TempPoolIF[];
    searchInput: ReactNode;
    exampleLoading: boolean;
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
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarSearchResults(props: SidebarSearchResultsPropsIF) {
    const {
        searchedPools,
        exampleLoading,
        searchInput,
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
        setIsShowAllEnabled,
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
                    <PositionsSearchResults
                        searchedPositions={searchedPositions}
                        isDenomBase={isDenomBase}
                        setOutsideControl={setOutsideControl}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setCurrentPositionActive={setCurrentPositionActive}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                    {false && <OrdersSearchResults loading={exampleLoading} searchInput={searchInput} />}
                    <TransactionsSearchResults loading={exampleLoading} searchInput={searchInput} />
                </>
            )}
        </div>
    );
}
