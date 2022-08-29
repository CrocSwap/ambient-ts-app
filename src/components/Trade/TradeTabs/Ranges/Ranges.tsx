import styles from './Ranges.module.css';
import RangeCard from './RangeCard';
import { graphData } from '../../../../utils/state/graphDataSlice';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useMoralis } from 'react-moralis';
import RangeCardHeader from './RangeCardHeader';
import { ethers } from 'ethers';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface RangesProps {
    chainId: string;
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    graphData: graphData;
    lastBlockNumber: number;
    provider: ethers.providers.Provider | undefined;

    expandTradeTable: boolean;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Ranges(props: RangesProps) {
    const {
        provider,
        chainId,
        portfolio,
        notOnTradeRoute,
        isShowAllEnabled,
        graphData,
        expandTradeTable,
        currentPositionActive,
        setCurrentPositionActive,
    } = props;

    const { account, isAuthenticated } = useMoralis();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

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

    const [ sortBy, setSortBy ] = useState('wallet');
    useEffect(() => {console.log(sortBy)}, [sortBy]);

    const RangesDisplay = isShowAllEnabled
        ? poolPositions.map((position, idx) => (
            <RangeCard
                provider={provider}
                chainId={chainId}
                key={idx}
                portfolio={portfolio}
                notOnTradeRoute={notOnTradeRoute}
                position={position}
                isAllPositionsEnabled={isShowAllEnabled}
                tokenAAddress={tokenAAddress}
                tokenBAddress={tokenBAddress}
                account={account ?? undefined}
                isAuthenticated={isAuthenticated}
                isDenomBase={isDenomBase}
                lastBlockNumber={props.lastBlockNumber}
                currentPositionActive={currentPositionActive}
                setCurrentPositionActive={setCurrentPositionActive}
            />
        ))
        : //   .reverse()
        userPositions.map((position, idx) => (
            <RangeCard
                provider={provider}
                chainId={chainId}
                key={idx}
                portfolio={portfolio}
                notOnTradeRoute={notOnTradeRoute}
                position={position}
                isAllPositionsEnabled={isShowAllEnabled}
                tokenAAddress={tokenAAddress}
                tokenBAddress={tokenBAddress}
                account={account ?? undefined}
                isAuthenticated={isAuthenticated}
                isDenomBase={isDenomBase}
                lastBlockNumber={props.lastBlockNumber}
                currentPositionActive={currentPositionActive}
                setCurrentPositionActive={setCurrentPositionActive}
            />
        ));
    //   .reverse();

    return (
        <div className={styles.container}>
            {/* header fields */}
            <header className={styles.row_container}>
                {
                    columnHeaders.map((header) => 
                        <RangeCardHeader
                            key={`rangeDataHeaderField${header.name}`}
                            data={header}
                            clickHandler={() => setSortBy(header.name.toLowerCase())}
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
