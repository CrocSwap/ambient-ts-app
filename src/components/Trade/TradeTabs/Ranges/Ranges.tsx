// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect } from 'react';
import { ethers } from 'ethers';

// START: Import JSX Components
import RangeCard from './RangeCard';
import RangeCardHeader from './RangeCardHeader';

// START: Import Local Files
import styles from './Ranges.module.css';
import {
    addPositionsByPool,
    addPositionsByUser,
    graphData,
} from '../../../../utils/state/graphDataSlice';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useSortedPositions } from './useSortedPositions';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { updateApy } from '../../../../App/functions/getPositionData';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
// import RangeAccordions from './RangeAccordions/RangeAccordions';

// interface for props
interface RangesPropsIF {
    isUserLoggedIn: boolean;
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    provider: ethers.providers.Provider | undefined;
    isAuthenticated: boolean;
    account: string;
    chainId: string;
    isShowAllEnabled: boolean;
    notOnTradeRoute?: boolean;
    graphData: graphData;
    lastBlockNumber: number;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    expandTradeTable: boolean;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    portfolio?: boolean;
    importedTokens: TokenIF[];
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
}

// react functional component
export default function Ranges(props: RangesPropsIF) {
    const {
        isUserLoggedIn,
        crocEnv,
        chainData,
        provider,
        account,
        isAuthenticated,
        chainId,
        isShowAllEnabled,
        notOnTradeRoute,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        graphData,
        lastBlockNumber,
        expandTradeTable,
        currentPositionActive,
        setCurrentPositionActive,
        portfolio,
    } = props;

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddressLowerCase = tradeData.baseToken.address.toLowerCase();
    const quoteTokenAddressLowerCase = tradeData.quoteToken.address.toLowerCase();

    const positionsByUserMatchingSelectedTokens = graphData?.positionsByUser?.positions.filter(
        (position) => {
            if (
                position.base.toLowerCase() === baseTokenAddressLowerCase &&
                position.quote.toLowerCase() === quoteTokenAddressLowerCase
            ) {
                return true;
            } else {
                return false;
            }
        },
    );

    const columnHeaders = [
        { name: 'ID', sortable: false, className: '' },
        { name: 'Wallet', sortable: true, className: 'wallet' },
        // { name: 'Range', sortable: false, className: 'Range' },
        { name: ' Min', sortable: false, className: 'range_sing' },
        { name: 'Max', sortable: false, className: 'range_sing' },
        { name: 'Value', sortable: true, className: 'wallet' },
        { name: tradeData.baseToken.symbol, sortable: false, className: 'token' },
        { name: tradeData.quoteToken.symbol, sortable: false, className: 'token' },
        { name: 'APY', sortable: true, className: '' },
        { name: 'Status', sortable: false, className: '' },
    ];

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] = useSortedPositions(
        isShowAllEnabled,
        positionsByUserMatchingSelectedTokens,
        graphData?.positionsByPool?.positions,
    );

    const topThreePositions = sortedPositions.slice(0, 3);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (topThreePositions) {
            Promise.all(
                topThreePositions.map((position: PositionIF) => {
                    return updateApy(position);
                }),
            )
                .then((updatedPositions) => {
                    if (isShowAllEnabled) {
                        dispatch(addPositionsByPool(updatedPositions));
                    } else {
                        dispatch(addPositionsByUser(updatedPositions));
                    }
                })
                .catch(console.log);
        }
    }, [JSON.stringify(topThreePositions), lastBlockNumber, isShowAllEnabled]);

    // const [expanded, setExpanded] = useState<false | number>(false);

    const desktopDisplay = (
        <div className={styles.desktop_ranges_display_container}>
            {sortedPositions.map((position) => (
                <RangeCard
                    isUserLoggedIn={isUserLoggedIn}
                    crocEnv={crocEnv}
                    chainData={chainData}
                    provider={provider}
                    chainId={chainId}
                    key={position.positionId}
                    portfolio={portfolio}
                    baseTokenBalance={baseTokenBalance}
                    quoteTokenBalance={quoteTokenBalance}
                    baseTokenDexBalance={baseTokenDexBalance}
                    quoteTokenDexBalance={quoteTokenDexBalance}
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
                    openGlobalModal={props.openGlobalModal}
                    closeGlobalModal={props.closeGlobalModal}
                />
            ))}
        </div>
    );

    const mobileAccordionDisplay = (
        <div className={styles.accordion_display_container}>
            {/* {sortedPositions.map((position, idx) => (
                <RangeAccordions
                    key={idx}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    i={idx}
                    position={position}
                />
            ))} */}
            <p>Mobile Accordion here: Disabled for now</p>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* <header className={styles.row_container}>
                {columnHeaders.map((header) => (
                    <RangeCardHeader
                        key={`rangeDataHeaderField${header.name}`}
                        data={header}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        reverseSort={reverseSort}
                        setReverseSort={setReverseSort}
                        columnHeaders={columnHeaders}
                    />
                ))}
            </header> */}
            <RangeCardHeader
                sortBy={sortBy}
                setSortBy={setSortBy}
                reverseSort={reverseSort}
                setReverseSort={setReverseSort}
                columnHeaders={columnHeaders}
            />
            <ol
                className={styles.positions_list}
                style={{ height: expandTradeTable ? '100%' : '220px' }}
            >
                {mobileAccordionDisplay}
                {desktopDisplay}
            </ol>
        </div>
    );
}
