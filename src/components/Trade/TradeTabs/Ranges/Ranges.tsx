/* eslint-disable no-irregular-whitespace */
// todo: Commented out code were commented out on 10/14/2022 for a new refactor. If not uncommented by 12/14/2022, they can be safely removed from the file. -Jr

// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

// START: Import JSX Components

// START: Import Local Files
import styles from './Ranges.module.css';
import {
    addPositionsByPool,
    addPositionsByUser,
    graphData,
} from '../../../../utils/state/graphDataSlice';
import Pagination from '../../../Global/Pagination/Pagination';

import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useSortedPositions } from '../useSortedPositions';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { updateApy } from '../../../../App/functions/getPositionData';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import RangeHeader from './RangesTable/RangeHeader';
import RangesRow from './RangesTable/RangesRow';
import TableSkeletons from '../TableSkeletons/TableSkeletons';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
// import RangeAccordions from './RangeAccordions/RangeAccordions';

// interface for props
interface RangesPropsIF {
    activeAccountPositionData?: PositionIF[];
    connectedAccountActive?: boolean;
    isUserLoggedIn: boolean | undefined;
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    provider: ethers.providers.Provider | undefined;
    account: string;
    chainId: string;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled?: Dispatch<SetStateAction<boolean>>;
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
    isOnPortfolioPage: boolean;

    setLeader?: Dispatch<SetStateAction<string>>;
    setLeaderOwnerId?: Dispatch<SetStateAction<string>>;
    handlePulseAnimation?: (type: string) => void;
}

// react functional component
export default function Ranges(props: RangesPropsIF) {
    const {
        activeAccountPositionData,
        connectedAccountActive,
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
        isOnPortfolioPage,
        handlePulseAnimation,
        setIsShowAllEnabled,
        showSidebar,
    } = props;

    const tradeData = useAppSelector((state) => state.tradeData);
    const dataLoadingStatus = graphData?.dataLoadingStatus;

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const baseTokenAddressLowerCase = tradeData.baseToken.address.toLowerCase();
    const quoteTokenAddressLowerCase = tradeData.quoteToken.address.toLowerCase();

    const isConnectedUserRangeDataLoading = dataLoadingStatus?.isConnectedUserRangeDataLoading;
    const isLookupUserRangeDataLoading = dataLoadingStatus?.isLookupUserRangeDataLoading;
    const isPoolRangeDataLoading = dataLoadingStatus?.isPoolRangeDataLoading;

    const isRangeDataLoadingForPortfolio =
        (connectedAccountActive && isConnectedUserRangeDataLoading) ||
        (!connectedAccountActive && isLookupUserRangeDataLoading);

    const isRangeDataLoadingForTradeTable =
        (isShowAllEnabled && isPoolRangeDataLoading) ||
        (!isShowAllEnabled && isConnectedUserRangeDataLoading);

    const shouldDisplayLoadingAnimation =
        (isOnPortfolioPage && isRangeDataLoadingForPortfolio) ||
        (!isOnPortfolioPage && isRangeDataLoadingForTradeTable);

    const debouncedShouldDisplayLoadingAnimation = useDebounce(shouldDisplayLoadingAnimation, 1000); // debounce 1/4 second

    const positionsByPool = graphData.positionsByPool?.positions;

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

    const [rangeData, setRangeData] = useState(
        isOnPortfolioPage ? activeAccountPositionData || [] : positionsByPool,
    );

    const top3Positions = useMemo(() => {
        const sortByApy = (unsortedData: PositionIF[]) =>
            [...unsortedData].sort((a, b) => b.apy - a.apy);
        const dataByApy = sortByApy(rangeData);
        const topThree = dataByApy.slice(0, 3).map((data) => data.positionId);
        return topThree;
    }, [rangeData]);

    useEffect(() => {
        false && console.log(top3Positions);
    }, [top3Positions]);

    useEffect(() => {
        if (isOnPortfolioPage) {
            setRangeData(activeAccountPositionData || []);
        } else if (!isShowAllEnabled) {
            setRangeData(positionsByUserMatchingSelectedTokens);
        } else if (positionsByPool) {
            setRangeData(positionsByPool);
        }
    }, [
        isShowAllEnabled,
        connectedAccountActive,
        JSON.stringify(activeAccountPositionData),
        JSON.stringify(positionsByUserMatchingSelectedTokens),
        JSON.stringify(positionsByPool),
    ]);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] = useSortedPositions(
        'time',
        rangeData,
    );

    // useEffect(() => {
    //     console.log({ sortedPositions });
    // }, [sortedPositions]);

    const topThreePositions = sortedPositions.slice(0, 3);

    const dispatch = useAppDispatch();

    useEffect(() => {
        // console.log({ isShowAllEnabled });
        // console.log({ isOnPortfolioPage });
        // console.log({ topThreePositions });
        if (topThreePositions) {
            Promise.all(
                topThreePositions.map((position: PositionIF) => {
                    return updateApy(position);
                }),
            )
                .then((updatedPositions) => {
                    if (!isOnPortfolioPage) {
                        if (isShowAllEnabled) {
                            dispatch(addPositionsByPool(updatedPositions));
                        } else {
                            dispatch(
                                addPositionsByUser(
                                    updatedPositions.filter(
                                        (position) => position.user === account,
                                    ),
                                ),
                            );
                        }
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
        isOnPortfolioPage,
    ]);

    // ---------------------
    const [currentPage, setCurrentPage] = useState(1);
    // transactions per page media queries
    const txView1 = useMediaQuery('(max-width: 480px)');
    const txView2 = useMediaQuery('(max-width: 720px)');
    const txView3 = useMediaQuery('(max-width: 1200px)');
    const txView4 = useMediaQuery('(max-width: 1800px)');
    // const txView4 = useMediaQuery('(min-width: 2400px)');

    const rangesPerPage = txView1 ? 3 : txView2 ? 10 : txView3 ? 12 : txView4 ? 15 : 20;

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

    // const sidebarOpen = false;

    const ipadView = useMediaQuery('(max-width: 480px)');
    const desktopView = useMediaQuery('(max-width: 768px)');
    const showColumns = useMediaQuery('(max-width: 1440px)');

    // const showColumns = sidebarOpen || desktopView;

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
    const tokens = isOnPortfolioPage ? (
        <>Tokens</>
    ) : (
        <>
            <p>{`${baseTokenSymbol} ( ${baseTokenCharacter} )`}</p>
            <p>{`${quoteTokenSymbol} ( ${quoteTokenCharacter} )`}</p>
        </>
    );
    const headerColumns = [
        // {
        //     name: '',
        //     className: '',
        //     show: isOnPortfolioPage,
        //     slug: 'token_images',
        //     sortable: false,
        // },
        {
            name: 'Last Updated',
            className: '',
            show: !showColumns,
            slug: 'time',
            sortable: true,
        },
        {
            name: 'Pair',
            className: '',
            show: isOnPortfolioPage && !desktopView,
            slug: 'pool',
            sortable: true,
        },
        // {
        //     name: 'Pool',
        //     className: '',
        //     show: isOnPortfolioPage,
        //     slug: 'pool',
        //     sortable: false,
        // },
        {
            name: 'ID',
            className: 'ID',
            show: !showColumns,
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: !showColumns && !isOnPortfolioPage,
            slug: 'wallet',
            sortable: isShowAllEnabled,
        },
        {
            name: walID,
            className: 'wallet_id',
            show: showColumns,
            slug: 'walletid',
            sortable: isShowAllEnabled,
        },
        {
            name: 'Min',

            show: !showColumns,
            slug: 'min',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Max',
            className: 'side',
            show: !showColumns,
            slug: 'max',
            sortable: false,
            alignRight: true,
        },

        {
            name: minMax,
            className: 'side_type',
            show: showColumns && !ipadView,
            slug: 'minMax',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Value (USD)',
            className: 'value',
            show: true,
            slug: 'value',
            sortable: true,
            alignRight: true,
        },
        {
            name: isOnPortfolioPage ? '' : `${baseTokenSymbol}`,

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isOnPortfolioPage ? '' : `${quoteTokenSymbol}`,

            show: !showColumns,
            slug: quoteTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: tokens,
            className: 'tokens',
            show: showColumns,
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'APR',
            className: 'apr',
            show: true,
            slug: 'apr',
            sortable: true,
            alignRight: true,
        },
        {
            name: ' ',
            className: 'status',
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

    const headerStyle = isOnPortfolioPage ? styles.portfolio_header : styles.trade_header;

    const headerColumnsDisplay = (
        <ul className={`${styles.header} ${headerStyle}`}>
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
            account={account}
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
            isOnPortfolioPage={isOnPortfolioPage}
            idx={idx}
            handlePulseAnimation={handlePulseAnimation}

            // blockExplorer={blockExplorer}
        />
    ));

    const expandStyle = expandTradeTable ? 'calc(100vh - 10rem)' : '250px';

    const portfolioPageStyle = props.isOnPortfolioPage ? 'calc(100vh - 19.5rem)' : expandStyle;
    const rangeDataOrNull = rangeData.length ? (
        rowItemContent
    ) : (
        <NoTableData
            isShowAllEnabled={isShowAllEnabled}
            type='ranges'
            isOnPortfolioPage={isOnPortfolioPage}
            setIsShowAllEnabled={setIsShowAllEnabled}
        />
    );

    return (
        <section
            className={`${styles.main_list_container} `}
            style={{ height: portfolioPageStyle }}
        >
            {headerColumnsDisplay}
            {debouncedShouldDisplayLoadingAnimation ? <TableSkeletons /> : rangeDataOrNull}
            {footerDisplay}
        </section>
    );
}
