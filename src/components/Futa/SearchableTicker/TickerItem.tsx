import { toDisplayQty } from '@crocswap-libs/sdk';
import { Dispatch, MutableRefObject, SetStateAction, useContext } from 'react';
import { GoChevronRight } from 'react-icons/go';
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
import styles from './TickerItem.module.css';

interface propsIF {
    auction: AuctionDataIF;
    setSelectedTicker: Dispatch<SetStateAction<string | undefined>>;
    selectedTicker: string | undefined;
    isAccount: boolean | undefined;
    isCreated: boolean;
    isMobile: boolean;
    setShowComplete: Dispatch<SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useRefTicker: MutableRefObject<any>;
}
export default function TickerItem(props: propsIF) {
    const {
        auction,
        selectedTicker,
        setSelectedTicker,
        isAccount,
        isCreated,
        isMobile,
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

    const statusText = isUserInTheMoney
        ? isAuctionOpen
            ? 'IN'
            : 'WON'
        : isUserOutOfTheMoney
          ? isAuctionOpen
              ? 'OUT'
              : 'LOST'
          : userActionsCompleted
            ? 'CLAIMED'
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

    function convertWeiToEth(
        rawVal: string,
        decimals: number,
        trunc: number,
    ): string {
        let formattedWei: string = rawVal;
        while (formattedWei.length < decimals + 1) {
            formattedWei = 0 + formattedWei;
        }
        const positionToSplit: number = formattedWei.length - decimals;
        const firstPart: string = formattedWei.slice(0, positionToSplit);
        const lastPart: string = formattedWei.slice(positionToSplit);
        const output: string = (firstPart + '.' + lastPart).slice(0, trunc);
        return output;
    }
    console.log(isMobile);
    return (
        <Link
            ref={(el) => (useRefTicker.current[ticker] = el)}
            className={[
                //  spacing and visual arrangement styles
                styles.ticker_item,
                //  add background highlighting when ticker is active
                //  ... or when hovered
                isAccount ||
                    styles[
                        auction?.ticker === selectedTicker
                            ? 'active'
                            : 'inactive'
                    ],
                styles[
                    auction?.ticker === hoveredTicker &&
                    hoveredTicker !== selectedTicker
                        ? 'hoverActive'
                        : ''
                ],
            ].join(' ')}
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
                {isMobile || (
                    <GoChevronRight size={20} className={styles.ticker_arrow} />
                )}
                <p>{ticker}</p>
            </div>
            <p className={styles.market_cap}>{formattedMarketCap}</p>
            <p className={styles.auction_status}>{statusText}</p>
            <p className={styles.time_remaining}>{timeRemaining}</p>
            {isCreated && (
                <p className={styles.native_tkn_committed}>
                    {auction.nativeTokenCommitted &&
                        convertWeiToEth(auction.nativeTokenCommitted, 18, 6)}
                </p>
            )}
            {isCreated && (
                <p className={styles.native_tkn_reward}>
                    {auction.nativeTokenReward &&
                        convertWeiToEth(auction.nativeTokenReward, 18, 6)}
                </p>
            )}
        </Link>
    );
}
