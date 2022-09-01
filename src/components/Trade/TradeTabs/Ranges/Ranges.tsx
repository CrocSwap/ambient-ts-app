// START: Import React and Dongles
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { ethers } from 'ethers';

// START: Import JSX Components
import RangeCard from './RangeCard';
import RangeCardHeader from './RangeCardHeader';

// START: Import Local Files
import styles from './Ranges.module.css';
import { graphData } from '../../../../utils/state/graphDataSlice';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useSortedPositions } from './useSortedPositions';

// interface for props
interface RangesPropsIF {
    provider: ethers.providers.Provider | undefined;
    isAuthenticated: boolean;
    account: string;
    chainId: string;
    isShowAllEnabled: boolean;
    notOnTradeRoute?: boolean;
    graphData: graphData;
    lastBlockNumber: number;
    expandTradeTable: boolean;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    portfolio?: boolean;
}

// react functional component
export default function Ranges(props: RangesPropsIF) {
    const {
        provider,
        account,
        isAuthenticated,
        chainId,
        isShowAllEnabled,
        notOnTradeRoute,
        graphData,
        lastBlockNumber,
        expandTradeTable,
        currentPositionActive,
        setCurrentPositionActive,
        portfolio,
    } = props;

    const tradeData = useAppSelector((state) => state.tradeData);

    const columnHeaders = [
        {
            name: 'ID',
            sortable: false
        },
        {
            name: 'Wallet',
            sortable: true
        },
        {
            name: 'Range',
            sortable: false
        },
        {
            name: 'Range Min',
            sortable: false
        },
        {
            name: 'Range Max',
            sortable: false
        },
        {
            name: tradeData.baseToken.symbol,
            sortable: false
        },
        {
            name: tradeData.quoteToken.symbol,
            sortable: false
        },
        {
            name: 'APY',
            sortable: true
        },
        {
            name: 'Status',
            sortable: false
        }
    ];

    const [
        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort,
        sortedPositions
    ] = useSortedPositions(
        isShowAllEnabled,
        graphData?.positionsByUser?.positions,
        graphData?.positionsByPool?.positions
    );

    return (
        <div className={styles.container}>
            {/* header fields */}
            
            <header className={styles.row_container}>
                {
                    columnHeaders.map((header) => 
                        <RangeCardHeader
                            key={`rangeDataHeaderField${header.name}`}
                            data={header}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            reverseSort={reverseSort}
                            setReverseSort={setReverseSort}
                        />
                    )
                }
            </header>
            {/* item_container is the data proper (not headings) */}
            <div
                className={styles.item_container}
                style={{ height: expandTradeTable ? '100%' : '220px' }}
            >
                {
                    sortedPositions.map((position, idx) => (
                        <RangeCard
                            provider={provider}
                            chainId={chainId}
                            key={idx}
                            portfolio={portfolio}
                            notOnTradeRoute={notOnTradeRoute}
                            position={position}
                            isAllPositionsEnabled={isShowAllEnabled}
                            tokenAAddress={tradeData.tokenA.address}
                            tokenBAddress={tradeData.tokenB.address}
                            account={account ?? undefined}
                            isAuthenticated={isAuthenticated}
                            isDenomBase={tradeData.isDenomBase}
                            lastBlockNumber={lastBlockNumber}
                            currentPositionActive={currentPositionActive}
                            setCurrentPositionActive={setCurrentPositionActive}
                        />
                    ))
                }
            </div>
        </div>
    );
}
