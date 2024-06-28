import { Link } from 'react-router-dom';
import styles from './SearchableTicker.module.css';
import styles2 from './TickerItem.module.css';
import {
    getFormattedNumber,
    getTimeRemainingAbbrev,
} from '../../../ambient-utils/dataLayer';
import { Dispatch, SetStateAction, useContext } from 'react';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import {
    AuctionDataIF,
    AuctionsContext,
} from '../../../contexts/AuctionsContext';
import {
    getRetrievedAuctionDetailsForAccount,
    marketCapMultiplier,
} from '../../../pages/platformFuta/mockAuctionData';

interface PropsIF {
    auction: AuctionDataIF;
    setSelectedTicker: Dispatch<SetStateAction<string | undefined>>;
    selectedTicker: string | undefined;
    isAccount: boolean | undefined;
    setShowComplete: Dispatch<SetStateAction<boolean>>;
}
export default function TickerItem(props: PropsIF) {
    const {
        auction,
        selectedTicker,
        setSelectedTicker,
        isAccount,
        setShowComplete,
    } = props;

    const { accountData } = useContext(AuctionsContext);

    const { ticker, clearingPriceInEth, createdAt, auctionLength } = auction;

    const { nativeTokenUsdPrice } = useContext(ChainDataContext);

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const auctionEndTime = createdAt + auctionLength;
    const timeRemainingInSec = auctionEndTime - currentTimeInSeconds;

    const timeRemaining = getTimeRemainingAbbrev(timeRemainingInSec);

    const userDataForAuction = getRetrievedAuctionDetailsForAccount(
        ticker,
        accountData,
    );

    const isAuctionOpen = timeRemainingInSec > 0;

    const isUserInTheMoney = isAuctionOpen
        ? userDataForAuction?.clearingPriceForUserBidInEth !== undefined &&
          userDataForAuction.clearingPriceForUserBidInEth >= clearingPriceInEth
        : userDataForAuction?.clearingPriceForUserBidInEth !== undefined &&
          userDataForAuction.clearingPriceForUserBidInEth ===
              clearingPriceInEth &&
          userDataForAuction?.tokenAllocationUnclaimedByUser &&
          userDataForAuction.tokenAllocationUnclaimedByUser > 0;

    const isUserOutOfTheMoney = isAuctionOpen
        ? userDataForAuction?.clearingPriceForUserBidInEth !== undefined &&
          userDataForAuction.clearingPriceForUserBidInEth < clearingPriceInEth
        : userDataForAuction?.clearingPriceForUserBidInEth !== undefined &&
          userDataForAuction.clearingPriceForUserBidInEth !==
              clearingPriceInEth &&
          userDataForAuction?.ethUnclaimedByUser &&
          userDataForAuction.ethUnclaimedByUser > 0;

    const userActionsCompleted =
        !isAuctionOpen &&
        userDataForAuction?.clearingPriceForUserBidInEth !== undefined &&
        !userDataForAuction?.tokenAllocationUnclaimedByUser &&
        !userDataForAuction?.ethUnclaimedByUser;

    const status2 = isUserInTheMoney
        ? 'var(--text1)'
        : isUserOutOfTheMoney
          ? 'var(--orange)'
          : userActionsCompleted
            ? 'var(--accent2)'
            : undefined;

    const marketCap = clearingPriceInEth * marketCapMultiplier;

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

    return (
        <Link
            className={`${styles.tickerItemContainer} ${
                auction?.ticker === selectedTicker && !isAccount
                    ? styles.active
                    : ''
            }`}
            to={'/auctions/v1/' + ticker}
            onClick={() => {
                setSelectedTicker(ticker);
                const shouldSetShowComplete =
                    timeRemainingInSec < 0 ? true : false;
                setShowComplete(shouldSetShowComplete);
            }}
        >
            <p className={styles2.ticker_name}>{ticker}</p>
            <p className={styles.marketCap}>{formattedMarketCap}</p>
            <p
                style={{
                    color:
                        // set color to orange if time remaining is less than 2 hours
                        timeRemainingInSec > 7200
                            ? 'var(--text1)'
                            : 'var(--orange)',
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
