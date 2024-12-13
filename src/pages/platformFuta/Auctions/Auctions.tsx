import { useContext, useEffect } from 'react';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import TickerComponent from '../../../components/Futa/TickerComponent/TickerComponent';
import { AppStateContext } from '../../../contexts';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import styles from './Auctions.module.css';
import { sortedAuctionsIF, useSortedAuctions } from './useSortedAuctions';
import FutaDivider2 from '../../../components/Futa/Divider/FutaDivider2';

interface propsIF {
    hideTicker?: boolean;
    placeholderTicker?: boolean;
}

export default function Auctions(props: propsIF) {
    const { hideTicker, placeholderTicker } = props;
    // placeholder data until the platform has live data

    const {
        globalAuctionList,
        updateGlobalAuctionsList,
        updateUserAuctionsList,
    } = useContext(AuctionsContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { userAddress } = useContext(UserDataContext);

    const sorted: sortedAuctionsIF = useSortedAuctions(
        globalAuctionList.data || [],
    );

    const desktopScreen: boolean = useMediaQuery('(min-width: 968px)');

    const cacheFrequency = Math.floor(Date.now() / 30000);

    useEffect(() => {
        updateGlobalAuctionsList();
        if (userAddress) {
            updateUserAuctionsList(userAddress);
        } else {
            updateUserAuctionsList('');
        }
    }, [userAddress, chainId, cacheFrequency]);

    if (desktopScreen)
        return (
            <div className={styles.desktopContainer}>
                <div
                    className={styles.auctionsTickerContainer}
                    style={{
                        gridTemplateColumns: hideTicker
                            ? '1fr'
                            : '1fr 4px 390px',
                    }}
                >
                    <span id='auctions_search_wrapper'>
                        <div style={{ height: 'calc(100vh - 80px)' }}>
                            <SearchableTicker
                                auctions={sorted}
                                placeholderTicker={placeholderTicker}
                            />
                        </div>
                    </span>

                    {
                        /* <Separator dots={100} /> */
                        // empty `<div />` on the next line preserves
                        // ... spacing with CSS Grid layout
                    }
                    <div />
                    <div className={styles.flexColumn}>
                        <p className={styles.label}>TICKER</p>
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

    return (
        <div className={styles.mobileContainer}>
            <h3>AUCTIONS</h3>

            <span id='auctions_search_wrapper'>
                <SearchableTicker
                    auctions={sorted}
                    placeholderTicker={placeholderTicker}
                />
            </span>
        </div>
    );
}
