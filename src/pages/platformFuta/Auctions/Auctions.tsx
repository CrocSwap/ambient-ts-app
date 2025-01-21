import { useContext, useEffect, useRef } from 'react';
import FutaDivider2 from '../../../components/Futa/Divider/FutaDivider2';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import TickerComponent from '../../../components/Futa/TickerComponent/TickerComponent';
import Chart from '../../../components/Futa/Chart/Chart';
import HexReveal from '../Home/Animations/HexReveal';
import ResizableComponent from './ResizeableComponent';

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
    const isMobile = useMediaQuery('(max-width: 768px)');
    const desktopScreen = useMediaQuery('(min-width: 1024px)');

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

    if (desktopScreen) {
        return (
            <div className={styles.desktopContainer}>
                <div
                    className={styles.auctionsTickerContainer}
                    style={{
                        gridTemplateColumns: hideTicker ? '1fr' : '1fr 390px',
                    }}
                >
                    <div id='auctions_search_wrapper'>
                        <div
                            className={styles.searchable_ticker}
                            style={{ height: '100%' }}
                            ref={canvasRef}
                        >
                            <FlexContainer
                                flexDirection='column'
                                fullHeight
                                ref={tableParentRef}
                            >
                                {ResizableTickers}
                                {!isMobile && <Chart />}
                            </FlexContainer>
                        </div>
                    </div>
                    <div className={styles.flexColumn}>
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
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.mobileContainer}>
            <h3>AUCTIONS</h3>
            <span id='auctions_search_wrapper'>{ResizableTickers}</span>
        </div>
    );
}
