import styles from './Auctions.module.css';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Divider from '../../../components/Futa/Divider/FutaDivider';
import { useContext, useEffect, useState } from 'react';
import { sortedAuctionsIF, useSortedAuctions } from './useSortedAuctions';
import TickerComponent from '../../../components/Futa/TickerComponent/TickerComponent';

import { AuctionsContext } from '../../../contexts/AuctionsContext';
import Separator from '../../../components/Futa/Separator/Separator';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
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
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);

    const sorted: sortedAuctionsIF = useSortedAuctions(
        globalAuctionList.data || [],
    );

    // DOM id for search input field
    const INPUT_DOM_ID = 'ticker_auction_search_input';

    false && INPUT_DOM_ID;

    const desktopScreen: boolean = useMediaQuery('(min-width: 968px)');
    const [_, setIsFullLayoutActive] = useState<boolean>(false);

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
                                title='AUCTIONS'
                                setIsFullLayoutActive={setIsFullLayoutActive}
                                placeholderTicker={placeholderTicker}
                            />
                        </div>
                    </span>

                    <Separator dots={100} />
                    <div className={styles.flexColumn}>
                        <Divider count={2} />
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
