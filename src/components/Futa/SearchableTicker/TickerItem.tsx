import { Link } from 'react-router-dom';
import styles from './SearchableTicker.module.css';
import styles2 from './TickerItem.module.css';
import {
    getFormattedNumber,
    getTimeRemainingAbbrev,
} from '../../../ambient-utils/dataLayer';
import { Dispatch, SetStateAction, useContext } from 'react';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { AuctionDataIF } from '../../../contexts/AuctionsContext';
import { marketCapMultiplier } from '../../../pages/platformFuta/mockAuctionData';

interface PropsIF {
    auction: AuctionDataIF;
    setSelectedTicker: Dispatch<SetStateAction<string | undefined>>;
    selectedTicker: string | undefined;
    isAccount: boolean | undefined;
}
export default function TickerItem(props: PropsIF) {
    const { auction, selectedTicker, setSelectedTicker, isAccount } = props;

    const { ticker, highestFilledBidInEth, createdAt, auctionLength } = auction;

    const { nativeTokenUsdPrice } = useContext(ChainDataContext);

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const auctionEndTime = createdAt + auctionLength;
    const timeRemainingInSec = auctionEndTime - currentTimeInSeconds;

    const timeRemaining = getTimeRemainingAbbrev(timeRemainingInSec);

    const status2 = ticker.toLowerCase().includes('juni')
        ? 'var(--orange)'
        : ticker.toLowerCase().includes('doge')
          ? 'var(--text1)'
          : ticker.toLowerCase().includes('emily')
            ? 'var(--accent2)'
            : undefined;

    const marketCap = highestFilledBidInEth * marketCapMultiplier;

    const marketCapUsdValue =
        nativeTokenUsdPrice !== undefined && marketCap !== undefined
            ? nativeTokenUsdPrice * marketCap
            : undefined;

    const formattedMarketCap =
        marketCapUsdValue !== undefined
            ? marketCapUsdValue
                ? getFormattedNumber({
                      value: marketCapUsdValue,
                      minFracDigits: 0,
                      maxFracDigits: 0,
                      isUSD: true,
                  })
                : '$0'
            : undefined;

    const timeRemainingColor = undefined;

    return (
        <Link
            className={`${styles.tickerItemContainer} ${
                auction?.ticker === selectedTicker && !isAccount
                    ? styles.active
                    : ''
            }`}
            to={'/auctions/v1/' + ticker}
            onClick={() => setSelectedTicker(ticker)}
        >
            <p className={styles2.ticker_name}>{ticker}</p>
            <p className={styles.marketCap}>{formattedMarketCap}</p>
            <p
                style={{
                    color: timeRemainingColor
                        ? timeRemainingColor
                        : 'var(--text1)',
                }}
            >
                {timeRemaining}
            </p>
            <div className={styles.statusContainer}>
                {status2 && (
                    <span
                        className={styles.tickerStatus}
                        style={{ background: status2 ? status2 : '' }}
                    />
                )}
            </div>
        </Link>
    );
}
