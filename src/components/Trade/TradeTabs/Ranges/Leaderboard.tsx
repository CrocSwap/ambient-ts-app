/* eslint-disable no-irregular-whitespace */
// todo: Commented out code were commented out on 10/14/2022 for a new refactor. If not uncommented by 12/14/2022, they can be safely removed from the file. -Jr

// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ethers } from 'ethers';

// START: Import JSX Components

// START: Import Local Files
import styles from './Ranges.module.css';
import {
    // addPositionsByPool,
    // addPositionsByUser,
    graphData,
    updateLeaderboard,
} from '../../../../utils/state/graphDataSlice';
import Pagination from '../../../Global/Pagination/Pagination';

import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useSortedPositions } from './useSortedPositions';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { updateApy } from '../../../../App/functions/getPositionData';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import RangeHeader from './RangesTable/RangeHeader';
import RangesRow from './RangesTable/RangesRow';
// import RangeAccordions from './RangeAccordions/RangeAccordions';

// interface for props
interface LeaderboardPropsIF {
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
    showSidebar: boolean;
}

// react functional component
export default function Leaderboard(props: LeaderboardPropsIF) {
    const {
        isUserLoggedIn,
        crocEnv,
        chainData,
        provider,

        chainId,
        isShowAllEnabled,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        graphData,
        lastBlockNumber,
        expandTradeTable,
        currentPositionActive,
        setCurrentPositionActive,
        account,

        showSidebar,
    } = props;

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

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

    // const columnHeaders = [
    //     { name: 'ID', sortable: false, className: '' },
    //     { name: 'Wallet', sortable: true, className: 'wallet' },
    //     { name: ' Min', sortable: false, className: 'range_sing' },
    //     { name: 'Max', sortable: false, className: 'range_sing' },
    //     { name: 'Value', sortable: true, className: 'wallet' },
    //     { name: tradeData.baseToken.symbol, sortable: false, className: 'token' },
    //     { name: tradeData.quoteToken.symbol, sortable: false, className: 'token' },
    //     { name: 'APR', sortable: true, className: '' },
    //     { name: 'Status', sortable: false, className: '' },
    // ];

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] = useSortedPositions(
        true, // leaderboard is never limited to the user
        positionsByUserMatchingSelectedTokens,
        graphData?.leaderboardByPool?.positions,
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
                        dispatch(updateLeaderboard(updatedPositions));
                    } else {
                        dispatch(updateLeaderboard(updatedPositions));
                    }
                })
                .catch(console.log);
        }
    }, [
        JSON.stringify({
            id0: topThreePositions[0]?.positionId,
            id1: topThreePositions[1]?.positionId,
            id2: topThreePositions[2]?.positionId,
        }),
        lastBlockNumber,
        isShowAllEnabled,
    ]);

    // const [expanded, setExpanded] = useState<false | number>(false);

    // const desktopDisplay = (
    //     <div className={styles.desktop_ranges_display_container}>
    //         {sortedPositions.map((position) => (
    //             <RangeCard
    //                 isUserLoggedIn={isUserLoggedIn}
    //                 crocEnv={crocEnv}
    //                 chainData={chainData}
    //                 provider={provider}
    //                 chainId={chainId}
    //                 key={position.positionId}
    //                 portfolio={portfolio}
    //                 baseTokenBalance={baseTokenBalance}
    //                 quoteTokenBalance={quoteTokenBalance}
    //                 baseTokenDexBalance={baseTokenDexBalance}
    //                 quoteTokenDexBalance={quoteTokenDexBalance}
    //                 notOnTradeRoute={notOnTradeRoute}
    //                 position={position}
    //                 isAllPositionsEnabled={isShowAllEnabled}
    //                 tokenAAddress={tradeData.tokenA.address}
    //                 tokenBAddress={tradeData.tokenB.address}
    //                 account={account ?? undefined}
    //                 isAuthenticated={isAuthenticated}
    //                 isDenomBase={tradeData.isDenomBase}
    //                 lastBlockNumber={lastBlockNumber}
    //                 currentPositionActive={currentPositionActive}
    //                 setCurrentPositionActive={setCurrentPositionActive}
    //                 openGlobalModal={props.openGlobalModal}
    //                 closeGlobalModal={props.closeGlobalModal}
    //             />
    //         ))}
    //     </div>
    // );

    // const oldReturn =
    // return (
    //     <div className={styles.container}>
    //         {/* <header className={styles.row_container}>
    //             {columnHeaders.map((header) => (
    //                 <RangeCardHeader
    //                     key={`rangeDataHeaderField${header.name}`}
    //                     data={header}
    //                     sortBy={sortBy}
    //                     setSortBy={setSortBy}
    //                     reverseSort={reverseSort}
    //                     setReverseSort={setReverseSort}
    //                     columnHeaders={columnHeaders}
    //                 />
    //             ))}
    //         </header> */}
    //         <RangeCardHeader
    //             sortBy={sortBy}
    //             setSortBy={setSortBy}
    //             reverseSort={reverseSort}
    //             setReverseSort={setReverseSort}
    //             columnHeaders={columnHeaders}
    //         />
    //         <ol
    //             className={styles.positions_list}
    //             style={{ height: expandTradeTable ? '100%' : '220px' }}
    //         >
    //             {desktopDisplay}
    //         </ol>
    //     </div>
    // );

    // ---------------------
    const [currentPage, setCurrentPage] = useState(1);
    const [rangesPerPage] = useState(20);

    useEffect(() => {
        setCurrentPage(1);
    }, [account, isShowAllEnabled, JSON.stringify({ baseTokenAddress, quoteTokenAddress })]);

    // Get current tranges
    const indexOfLastRanges = currentPage * rangesPerPage;
    const indexOfFirstRanges = indexOfLastRanges - rangesPerPage;
    const currentRangess = sortedPositions?.slice(indexOfFirstRanges, indexOfLastRanges);
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const usePaginateDataOrNull = expandTradeTable ? currentRangess : sortedPositions;

    const footerDisplay = (
        <div className={styles.footer}>
            {expandTradeTable && sortedPositions.length > 30 && (
                <Pagination
                    itemsPerPage={rangesPerPage}
                    totalItems={sortedPositions.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            )}
        </div>
    );

    // ----------------------

    const sidebarOpen = false;

    const ipadView = useMediaQuery('(max-width: 480px)');
    const desktopView = useMediaQuery('(max-width: 768px)');

    const showColumns = sidebarOpen || desktopView;

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

    const baseTokenCharacter = baseTokenSymbol ? getUnicodeCharacter(baseTokenSymbol) : '';
    const quoteTokenCharacter = quoteTokenSymbol ? getUnicodeCharacter(quoteTokenSymbol) : '';

    const walID = (
        <>
            <p>ID</p>
            <p>Wallet</p>
        </>
    );
    const minMax = (
        <>
            <p>Min</p>
            <p>Max</p>
        </>
    );
    const tokens = (
        <>
            <p>{`${baseTokenSymbol} ( ${baseTokenCharacter} )`}</p>
            <p>{`${quoteTokenSymbol} ( ${quoteTokenCharacter} )`}</p>
        </>
    );
    const headerColumns = [
        {
            name: 'ID',
            className: 'ID',
            show: !showColumns,
            slug: 'id',
            sortable: true,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: !showColumns,
            slug: 'wallet',
            sortable: true,
        },
        {
            name: walID,
            className: 'wallet_id',
            show: showColumns,
            slug: 'walletid',
            sortable: false,
        },
        {
            name: 'Min',

            show: !showColumns,
            slug: 'min',
            sortable: true,
        },
        {
            name: 'Max',
            className: 'side',
            show: !showColumns,
            slug: 'max',
            sortable: true,
        },

        {
            name: minMax,
            className: 'side_type',
            show: showColumns && !ipadView,
            slug: 'minMax',
            sortable: false,
        },
        {
            name: 'Value (USD)',
            className: 'value',
            show: true,
            slug: 'value',
            sortable: true,
        },
        {
            name: `${baseTokenSymbol} ( ${baseTokenCharacter} )`,

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
        },
        {
            name: `${quoteTokenSymbol} ( ${quoteTokenCharacter} )`,

            show: !showColumns,
            slug: quoteTokenSymbol,
            sortable: false,
        },
        {
            name: tokens,
            className: 'tokens',
            show: showColumns,
            slug: 'tokens',
            sortable: false,
        },
        {
            name: 'APR',
            className: 'apr',
            show: true,
            slug: 'apr',
            sortable: true,
        },
        {
            name: 'Status',
            className: '',
            show: !ipadView,
            slug: 'status',
            sortable: false,
        },
        {
            name: '',
            className: '',
            show: true,
            slug: 'menu',
            sortable: false,
        },
    ];
    const headerColumnsDisplay = (
        <ul className={styles.header}>
            {headerColumns.map((header, idx) => (
                <RangeHeader
                    key={idx}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    reverseSort={reverseSort}
                    setReverseSort={setReverseSort}
                    header={header}
                />
            ))}
        </ul>
    );
    const rowItemContent = usePaginateDataOrNull?.map((position, idx) => (
        <RangesRow
            key={idx}
            position={position}
            currentPositionActive={currentPositionActive}
            setCurrentPositionActive={setCurrentPositionActive}
            openGlobalModal={props.openGlobalModal}
            closeGlobalModal={props.closeGlobalModal}
            isShowAllEnabled={isShowAllEnabled}
            ipadView={ipadView}
            showColumns={showColumns}
            showSidebar={showSidebar}
            isUserLoggedIn={isUserLoggedIn}
            crocEnv={crocEnv}
            chainData={chainData}
            provider={provider}
            chainId={chainId}
            baseTokenBalance={baseTokenBalance}
            quoteTokenBalance={quoteTokenBalance}
            baseTokenDexBalance={baseTokenDexBalance}
            quoteTokenDexBalance={quoteTokenDexBalance}
            lastBlockNumber={lastBlockNumber}
            isOnPortfolioPage={false}
            // blockExplorer={blockExplorer}
        />
    ));

    return (
        <main
            className={`${styles.main_list_container} `}
            style={{ height: expandTradeTable ? 'calc(100vh - 10rem)' : '250px' }}
        >
            {headerColumnsDisplay}
            {rowItemContent}
            {footerDisplay}
        </main>
    );
}
