// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

// START: Import JSX Components
import RangeCard from './RangeCard';
import RangeCardHeader from './RangeCardHeader';

// START: Import Local Files
import styles from './Ranges.module.css';
import { graphData } from '../../../../utils/state/graphDataSlice';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';

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

    const userPositions = graphData?.positionsByUser?.positions;
    const poolPositions = graphData?.positionsByPool?.positions;

    const columnHeaders = [
        {
            name: 'Wallet',
            sortable: true
        },
        {
            name: 'Range',
            sortable: true
        },
        {
            name: 'Range Min',
            sortable: true
        },
        {
            name: 'Range Max',
            sortable: true
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
            sortable: true
        }
    ];

    console.log(poolPositions);

    const [ sortBy, setSortBy ] = useState('default');
    const [ reverseSort, setReverseSort ] = useState(false);
    useEffect(() => {
        console.log({sortBy, reverseSort})
    }, [sortBy, reverseSort]);

    const sortByWallet = (unsortedData: PositionIF[]) => (
        [...unsortedData].sort((a, b) => a.user.localeCompare(b.user))
    );

    const sortByApy = (unsortedData: PositionIF[]) => (
        [...unsortedData].sort((a, b) => b.apy - a.apy)
    );

    const sortData = (data: PositionIF[]) => {
        let sortedData: PositionIF[];
        switch (sortBy) {
            case 'wallet':
                sortedData = sortByWallet(data);
                break;
            case 'apy':
                sortedData = sortByApy(data);
                break;
            default:
                sortedData = data;
        }
        return reverseSort ? sortedData.reverse() : sortedData;
    }

    // TODO: new user positions reset table sort, new pool positions retains sort

    const sortedPositions = useMemo(() => {
        const positions = isShowAllEnabled ? poolPositions : userPositions;
        return sortData(positions);
    }, [
        sortBy,
        isShowAllEnabled,
        poolPositions,
        userPositions
    ]);

    const RangesDisplay = sortedPositions.map((position, idx) => (
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
    ));

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
                {RangesDisplay}
            </div>
        </div>
    );
}
