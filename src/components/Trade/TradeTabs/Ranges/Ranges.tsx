/* eslint-disable no-irregular-whitespace */
// todo: Commented out code were commented out on 10/14/2022 for a new refactor. If not uncommented by 12/14/2022, they can be safely removed from the file. -Jr

// START: Import React and Dongles
import { Dispatch, SetStateAction, ReactNode, useEffect, useState } from 'react';
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
import { PositionIF, TokenIF } from '../../../../utils/interfaces/exports';
import { updatePositionStats } from '../../../../App/functions/getPositionData';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import RangeHeader from './RangesTable/RangeHeader';
import RangesRow from './RangesTable/RangesRow';
import TableSkeletons from '../TableSkeletons/TableSkeletons';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
import { SpotPriceFn } from '../../../../App/functions/querySpotPrice';
import useWindowDimensions from '../../../../utils/hooks/useWindowDimensions';
import { allDexBalanceMethodsIF } from '../../../../App/hooks/useExchangePrefs';

// interface for props
interface propsIF {
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
    openGlobalModal: (content: ReactNode) => void;
    closeGlobalModal: () => void;
    showSidebar: boolean;
    isOnPortfolioPage: boolean;
    setLeader?: Dispatch<SetStateAction<string>>;
    setLeaderOwnerId?: Dispatch<SetStateAction<string>>;
    handlePulseAnimation?: (type: string) => void;
    cachedQuerySpotPrice: SpotPriceFn;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    dexBalancePrefs: allDexBalanceMethodsIF;
}

// react functional component
export default function Ranges(props: propsIF) {
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
        cachedQuerySpotPrice,
        setSimpleRangeWidth,
        dexBalancePrefs
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

    const userPositionsToDisplayOnTrade = positionsByUserMatchingSelectedTokens.filter(
        (position) => {
            if (position.positionLiq !== '0' || position.source === 'manual') {
                return true;
            } else {
                return false;
            }
        },
    );

    const [rangeData, setRangeData] = useState(
        isOnPortfolioPage ? activeAccountPositionData || [] : positionsByPool,
    );

    useEffect(() => {
        if (
            isOnPortfolioPage &&
            activeAccountPositionData &&
            JSON.stringify(activeAccountPositionData) !== JSON.stringify(rangeData)
        ) {
            setRangeData(activeAccountPositionData);
        } else if (!isShowAllEnabled && !isOnPortfolioPage) {
            setRangeData(userPositionsToDisplayOnTrade);
        } else if (positionsByPool && !isOnPortfolioPage) {
            setRangeData(positionsByPool);
        }
    }, [
        isOnPortfolioPage,
        isShowAllEnabled,
        connectedAccountActive,
        JSON.stringify(activeAccountPositionData),
        JSON.stringify(userPositionsToDisplayOnTrade),
        JSON.stringify(positionsByPool),
    ]);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] = useSortedPositions(
        'time',
        rangeData,
    );

    const dispatch = useAppDispatch();

    useEffect(() => {
        const topThreePositions = sortedPositions.slice(0, 3);

        if (topThreePositions) {
            Promise.all(
                topThreePositions.map((position: PositionIF) => {
                    return updatePositionStats(position);
                }),
            )
                .then((updatedPositions) => {
                    if (!isOnPortfolioPage) {
                        if (isShowAllEnabled) {
                            if (updatedPositions) dispatch(addPositionsByPool(updatedPositions));
                        } else {
                            const updatedPositionsMatchingUser = updatedPositions.filter(
                                (position) => position.user.toLowerCase() === account.toLowerCase(),
                            );
                            if (updatedPositionsMatchingUser.length)
                                // console.log({ updatedPositionsMatchingUser });
                                dispatch(addPositionsByUser(updatedPositionsMatchingUser));
                        }
                    } else {
                        // console.log({ updatedPositions });
                        // console.log({ sortedPositions });
                        const newArray = updatedPositions.concat(sortedPositions.slice(3));
                        setRangeData(newArray);
                    }
                })
                .catch(console.log);
        }
    }, [
        JSON.stringify({
            id0: sortedPositions[0]?.positionId,
            id1: sortedPositions[1]?.positionId,
            id2: sortedPositions[2]?.positionId,
        }),
        lastBlockNumber,
        isShowAllEnabled,
        isOnPortfolioPage,
    ]);

    // ---------------------
    const [currentPage, setCurrentPage] = useState(1);
    // transactions per page media queries
    const showColumns = useMediaQuery('(max-width: 1900px)');

    const phoneScreen = useMediaQuery('(max-width: 500px)');

    const { height } = useWindowDimensions();
    // const ordersPerPage = Math.round(((0.7 * height) / 33) )
    // height => current height of the viewport
    // 250 => Navbar, header, and footer. Everything that adds to the height not including the pagination contents
    // 30 => Height of each paginated row item

    const regularRangesItems = Math.round((height - 250) / 36);
    const showColumnRangesItems = Math.round((height - 250) / 60);
    const rangesPerPage = showColumns ? showColumnRangesItems : regularRangesItems;

    useEffect(() => {
        setCurrentPage(1);
    }, [account, isShowAllEnabled, JSON.stringify({ baseTokenAddress, quoteTokenAddress })]);

    // Get current tranges
    const indexOfLastRanges = currentPage * rangesPerPage;
    const indexOfFirstRanges = indexOfLastRanges - rangesPerPage;
    const currentRanges = sortedPositions?.slice(indexOfFirstRanges, indexOfLastRanges);
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };
    const largeScreenView = useMediaQuery('(min-width: 1200px)');

    const usePaginateDataOrNull =
        expandTradeTable && !isOnPortfolioPage && largeScreenView ? currentRanges : sortedPositions;

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

    const ipadView = useMediaQuery('(max-width: 580px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !showSidebar;

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
            show: isOnPortfolioPage && showPair,
            slug: 'pool',
            sortable: true,
        },
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
            show: showColumns && !phoneScreen,
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
            name: 'Status',
            className: 'status',
            show: true,
            slug: 'status',
            sortable: true,
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
            cachedQuerySpotPrice={cachedQuerySpotPrice}
            account={account}
            key={idx}
            // key={`Ranges-Row-wefwewa4564f-${JSON.stringify(position)}`}
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
            showPair={showPair}
            setSimpleRangeWidth={setSimpleRangeWidth}
            dexBalancePrefs={dexBalancePrefs}
        />
    ));

    const mobileView = useMediaQuery('(max-width: 1200px)');

    const mobileViewHeight = mobileView ? '70vh' : '250px';

    const expandStyle = expandTradeTable ? 'calc(100vh - 10rem)' : mobileViewHeight;
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
