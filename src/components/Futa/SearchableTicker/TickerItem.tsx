import { toDisplayQty } from '@crocswap-libs/sdk';
import { Dispatch, MutableRefObject, SetStateAction, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    AuctionDataIF,
    getFormattedNumber,
    getTimeRemainingAbbrev,
} from '../../../ambient-utils/dataLayer';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import {
    getRetrievedAuctionDetailsForAccount,
    MARKET_CAP_MULTIPLIER_BIG_INT,
} from '../../../pages/platformFuta/mockAuctionData';
import styles from './SearchableTicker.module.css';
import { GoChevronRight } from 'react-icons/go';

interface PropsIF {
    auction: AuctionDataIF;
    setSelectedTicker: Dispatch<SetStateAction<string | undefined>>;
    selectedTicker: string | undefined;
    isAccount: boolean | undefined;
    setShowComplete: Dispatch<SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useRefTicker: MutableRefObject<any>;
}
export default function TickerItem(props: PropsIF) {
    const {
        auction,
        selectedTicker,
        setSelectedTicker,
        isAccount,
        setShowComplete,
        useRefTicker,
    } = props;

    const { accountData, hoveredTicker, setHoveredTicker } =
        useContext(AuctionsContext);

    const {
        ticker,
        filledClearingPriceInNativeTokenWei,
        createdAt,
        auctionLength,
    } = auction;

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

    const userBidClearingPriceInEth =
        userDataForAuction?.userBidClearingPriceInNativeTokenWei
            ? parseFloat(
                  toDisplayQty(
                      userDataForAuction?.userBidClearingPriceInNativeTokenWei,
                      18,
                  ),
              )
            : undefined;

    const auctionedTokenQtyUnclaimedByUser =
        userDataForAuction?.qtyUnclaimedByUserInAuctionedTokenWei
            ? parseFloat(
                  toDisplayQty(
                      userDataForAuction?.qtyUnclaimedByUserInAuctionedTokenWei,
                      18,
                  ),
              )
            : undefined;

    const qtyUnreturnedToUser =
        userDataForAuction?.qtyUnreturnedToUserInNativeTokenWei
            ? parseFloat(
                  toDisplayQty(
                      userDataForAuction?.qtyUnreturnedToUserInNativeTokenWei,
                      18,
                  ),
              )
            : undefined;

    const filledClearingPriceInEth = parseFloat(
        toDisplayQty(filledClearingPriceInNativeTokenWei, 18),
    );

    const filledClearingPriceInWeiBigInt = filledClearingPriceInNativeTokenWei
        ? BigInt(filledClearingPriceInNativeTokenWei)
        : undefined;

    const filledMarketCapInWeiBigInt = filledClearingPriceInWeiBigInt
        ? filledClearingPriceInWeiBigInt * MARKET_CAP_MULTIPLIER_BIG_INT
        : undefined;

    const filledMarketCapInEth = filledMarketCapInWeiBigInt
        ? toDisplayQty(filledMarketCapInWeiBigInt, 18)
        : undefined;

    const isUserInTheMoney = isAuctionOpen
        ? userBidClearingPriceInEth !== undefined &&
          userBidClearingPriceInEth >= filledClearingPriceInEth
        : userDataForAuction?.userBidClearingPriceInNativeTokenWei !==
              undefined &&
          userBidClearingPriceInEth === filledClearingPriceInEth &&
          auctionedTokenQtyUnclaimedByUser &&
          auctionedTokenQtyUnclaimedByUser > 0;

    const isUserOutOfTheMoney = isAuctionOpen
        ? userBidClearingPriceInEth !== undefined &&
          userBidClearingPriceInEth < filledClearingPriceInEth
        : userBidClearingPriceInEth !== undefined &&
          userBidClearingPriceInEth !== filledClearingPriceInEth &&
          qtyUnreturnedToUser &&
          qtyUnreturnedToUser > 0;

    const userActionsCompleted =
        !isAuctionOpen &&
        userDataForAuction?.userBidClearingPriceInNativeTokenWei !==
            undefined &&
        !userDataForAuction?.qtyUnclaimedByUserInAuctionedTokenWei &&
        !userDataForAuction?.qtyUnreturnedToUserInNativeTokenWei;

    const status2 = isUserInTheMoney
        ? 'var(--text1)'
        : isUserOutOfTheMoney
          ? 'var(--orange)'
          : userActionsCompleted
            ? 'var(--accent2)'
            : undefined;

    const filledMarketCapUsdValue =
        nativeTokenUsdPrice !== undefined && filledMarketCapInEth !== undefined
            ? nativeTokenUsdPrice * parseFloat(filledMarketCapInEth)
            : undefined;

    const formattedMarketCap =
        filledMarketCapUsdValue !== undefined
            ? filledMarketCapUsdValue
                ? getFormattedNumber({
                      value: filledMarketCapUsdValue,
                      minFracDigits: 0,
                      maxFracDigits: 0,
                      isUSD: true,
                  })
                : '$0'
            : undefined;

    return (
        <Link
            ref={(el) => (useRefTicker.current[ticker] = el)}
            className={`${styles.tickerItemContainer} ${
                auction?.ticker === selectedTicker && !isAccount
                    ? styles.active
                    : ''
            } 
            ${
                auction?.ticker === hoveredTicker &&
                hoveredTicker !== selectedTicker &&
                !isAccount
                    ? styles.hoverActive
                    : ''
            }
            `}
            to={'/auctions/v1/' + ticker}
            onClick={() => {
                setSelectedTicker(ticker);
                setHoveredTicker(undefined);
                const shouldSetShowComplete =
                    timeRemainingInSec < 0 ? true : false;
                setShowComplete(shouldSetShowComplete);
            }}
            onMouseMove={() => {
                setHoveredTicker(ticker);
            }}
        >
            <div className={styles.ticker_name}>
                <span className={styles.ticker_name_arrow}>
                    <GoChevronRight />
                </span>
                <p className={styles.tick_name}>{ticker}</p>
            </div>
            <p className={styles.marketCap}>{formattedMarketCap}</p>
            <p className={styles.statusContainer}>{!status2 ? 'IN' : 'OUT'}</p>

            <p
                style={{
                    color:
                        // set color to orange if time remaining is less than 2 hours
                        timeRemainingInSec <= 0
                            ? 'var(--accent1)'
                            : timeRemainingInSec > 7200
                              ? 'var(--text1)'
                              : 'var(--orange)',
                }}
                className={styles.timeRemaining}
            >
                {timeRemaining}
            </p>
        </Link>
    );
}
