import styles from './Ranges.module.css';
import RangeCard from './RangeCard';
import { graphData } from '../../../../utils/state/graphDataSlice';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useMoralis } from 'react-moralis';
import RangeCardHeader from './RangeCardHeader';
// import { Dispatch, SetStateAction } from 'react';
import { ethers } from 'ethers';
import { Dispatch, SetStateAction } from 'react';

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
            name: tradeData.baseToken,
            sortable: true
        },
        {
            name: tradeData.quoteToken,
            sortable: true
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
            <RangeCardHeader
                baseToken={tradeData.baseToken}
                quoteToken={tradeData.quoteToken}
            />
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
