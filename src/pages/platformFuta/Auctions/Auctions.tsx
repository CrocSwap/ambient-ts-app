import { useContext, useEffect, useRef } from 'react';
import FutaDivider2 from '../../../components/Futa/Divider/FutaDivider2';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import TickerComponent from '../../../components/Futa/TickerComponent/TickerComponent';
import Chart from '../../../components/Futa/Chart/Chart';
import HexReveal from '../Home/Animations/HexReveal';
import ResizableComponent from './ResizeableComponent';
import { motion, AnimatePresence } from 'framer-motion';

import { AppStateContext } from '../../../contexts';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { FutaSearchableTickerContext } from '../../../contexts/Futa/FutaSearchableTickerContext';

import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { sortedAuctionsIF, useSortedAuctions } from './useSortedAuctions';
import { FlexContainer } from '../../../styled/Common';

import styles from './Auctions.module.css';

interface Props {
    hideTicker?: boolean;
    placeholderTicker?: boolean;
}

export default function Auctions({ hideTicker, placeholderTicker }: Props) {
    // Contexts
    const {
        globalAuctionList,
        updateGlobalAuctionsList,
        updateUserAuctionsList,
    } = useContext(AuctionsContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        searchableTickerHeights,
        setSearchableTickerHeight,
        setIsSearchableTickerHeightMinimum,
        canvasRef,
    } = useContext(FutaSearchableTickerContext);

    // Hooks
    const isTabletPortrait = useMediaQuery('tabletPortrait');
    const isTabletLandscape = useMediaQuery('tabletLandscape');
    const isDesktop = useMediaQuery('desktop');
    // const isMobile =
    //     useMediaQuery('mobilePortrait') || useMediaQuery('mobileLandscape');

    // Refs
    const tableParentRef = useRef<HTMLDivElement>(null);

    // Derived Values
    const sorted: sortedAuctionsIF = useSortedAuctions(
        globalAuctionList.data || [],
    );
    const cacheFrequency = Math.floor(Date.now() / 30000);

    // Effects
    useEffect(() => {
        updateGlobalAuctionsList();
        updateUserAuctionsList(userAddress || '');
    }, [userAddress, chainId, cacheFrequency]);

    // Components
    const ResizableTickers = (
        <ResizableComponent
            tableParentRef={tableParentRef}
            searchableTickerHeights={searchableTickerHeights}
            setSearchableTickerHeight={setSearchableTickerHeight}
            setIsSearchableTickerHeightMinimum={
                setIsSearchableTickerHeightMinimum
            }
        >
            <SearchableTicker
                auctions={sorted}
                placeholderTicker={placeholderTicker}
            />
        </ResizableComponent>
    );

    const tickerComponentDisplay = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className={styles.flexColumn}
            >
                <HexReveal>
                    <p className={styles.label}>TICKER</p>
                </HexReveal>
                <FutaDivider2 />
                {!hideTicker && (
                    <TickerComponent
                        isAuctionPage
                        placeholderTicker={placeholderTicker}
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );

    const resizableComponentDisplay = (
        <div id='auctions_search_wrapper'>
            <div
                className={styles.searchable_ticker}
                style={{
                    height: isTabletPortrait ? 'calc(100svh - 60px)' : '100%',
                }}
                ref={canvasRef}
            >
                <FlexContainer
                    flexDirection='column'
                    fullHeight
                    ref={tableParentRef}
                >
                    {ResizableTickers}
                    {<Chart />}
                </FlexContainer>
            </div>
        </div>
    );

    if (isDesktop || isTabletLandscape) {
        return (
            <div className={styles.desktopContainer}>
                <div
                    className={styles.auctionsTickerContainer}
                    style={{
                        gridTemplateColumns: hideTicker ? '1fr' : '1fr 390px',
                    }}
                >
                    {resizableComponentDisplay}
                    {tickerComponentDisplay}
                </div>
            </div>
        );
    }

    if (isTabletPortrait) {
        return (
            <div className={styles.tabletPortraitColumn}>
                <div className={styles.tabletPortraitRow}>
                    <div
                        style={{
                            border: 'var(--futa-box-border)',
                            padding: '0 8px',
                        }}
                    >
                        <SearchableTicker
                            auctions={sorted}
                            placeholderTicker={placeholderTicker}
                        />
                    </div>
                    {tickerComponentDisplay}
                </div>
                <div style={{ marginTop: 'auto', height: '100%' }}>
                    <Chart />
                </div>
            </div>
        );
    }
    // mobile
    return (
        <div className={styles.mobileContainer}>
            <h3>AUCTIONS</h3>
            <div
                id='auctions_search_wrapper'
                className={styles.auctions_search_wrapper}
            >
                <SearchableTicker
                    auctions={sorted}
                    placeholderTicker={placeholderTicker}
                />
            </div>
        </div>
    );
}
