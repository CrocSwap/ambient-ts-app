import { Dispatch, SetStateAction, useContext, useRef } from 'react';
import { FaEye } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { supportedNetworks } from '../../../ambient-utils/constants';
import {
    AuctionDataIF,
    getFormattedNumber,
    getTimeDifference,
} from '../../../ambient-utils/dataLayer';
import {
    AuctionStatusDataIF,
    AuctionsContext,
} from '../../../contexts/AuctionsContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import Divider from '../Divider/FutaDivider';
import styles from './TickerComponent.module.css';

import { toDisplayQty } from '@crocswap-libs/sdk';
import { LuChevronDown } from 'react-icons/lu';
import { AppStateContext } from '../../../contexts';
import {
    MARKET_CAP_MULTIPLIER_BIG_INT,
    maxMarketCapWeiValues,
} from '../../../pages/platformFuta/mockAuctionData';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { CurrencySelector } from '../../Form/CurrencySelector';
import ProgressBar from '../ProgressBar/ProgressBar';
import TooltipLabel from '../TooltipLabel/TooltipLabel';
import FutaDivider2 from '../Divider/FutaDivider2';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

// Props interface
export interface PropsIF {
    freshAuctionStatusData: AuctionStatusDataIF;
    auctionDetailsForConnectedUser: AuctionDataIF | undefined;
    filledMarketCapInEth: string | undefined;
    filledMarketCapUsdValue: number | undefined;
    timeRemainingInSeconds: number | undefined;
    isAuctionCompleted?: boolean;
    placeholderTicker?: boolean;
    auctionDetails: AuctionDataIF | undefined;
    bidGasPriceinDollars: string | undefined;
    formattedPriceImpact: string;
    isAuctionPage?: boolean;
    isMaxDropdownOpen: boolean;
    setIsMaxDropdownOpen: Dispatch<SetStateAction<boolean>>;
    selectedMaxMarketCapInWeiBigInt: bigint | undefined;
    setSelectedMaxMarketCapInWeiBigInt: Dispatch<
        SetStateAction<bigint | undefined>
    >;
    bidUsdValue: number | undefined;
    nativeTokenWalletBalanceTruncated: string;
    bidQtyNonDisplay: string | undefined;
    setBidQtyNonDisplay: Dispatch<SetStateAction<string | undefined>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
}

// Main function
export const tickerDisplayElements = (props: PropsIF) => {
    // Destructure props
    const {
        freshAuctionStatusData,
        auctionDetailsForConnectedUser,
        filledMarketCapInEth,
        filledMarketCapUsdValue,
        timeRemainingInSeconds,
        isAuctionCompleted,
        placeholderTicker,
        bidGasPriceinDollars,
        formattedPriceImpact,
        isAuctionPage,
        isMaxDropdownOpen,
        setIsMaxDropdownOpen,
        selectedMaxMarketCapInWeiBigInt,
        setSelectedMaxMarketCapInWeiBigInt,
        bidUsdValue,
        nativeTokenWalletBalanceTruncated,
        setBidQtyNonDisplay,
        inputValue,
        setInputValue,
    } = props;

    // Contexts
    const { ticker: tickerFromParams } = useParams();
    const { nativeTokenUsdPrice } = useContext(ChainDataContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { showComments, setShowComments, watchlists } =
        useContext(AuctionsContext);

    const currentMarketCapUsdFormatted =
        filledMarketCapUsdValue !== undefined
            ? getFormattedNumber({
                  value: filledMarketCapUsdValue,
                  isUSD: true,
              })
            : '...';

    const formattedMarketCapEthValue = getFormattedNumber({
        value: parseFloat(filledMarketCapInEth ?? '0'),
        prefix: 'Ξ ',
    });

    const timeRemainingString = timeRemainingInSeconds
        ? getTimeDifference(timeRemainingInSeconds)
        : '-';

    const SECTION_HEADER_FONT_SIZE = '18px';
    const isMobile =
        useMediaQuery('mobilePortrait') || useMediaQuery('mobileLandscape');

    // Status data
    const statusData = [
        {
            label: 'status',
            value: !placeholderTicker
                ? isAuctionCompleted
                    ? 'CLOSED'
                    : 'OPEN'
                : '-',
            color: 'var(--text2)',
            tooltipLabel: 'The current status of the auction - open or closed',
        },
        {
            label: isAuctionCompleted ? 'time completed' : 'time remaining',
            value: !placeholderTicker ? timeRemainingString : '-',
            // set color to orange if time remaining is less than 2 hours
            color: isAuctionCompleted
                ? 'var(--text1)'
                : timeRemainingInSeconds && timeRemainingInSeconds <= 7200
                  ? 'var(--orange)'
                  : 'var(--text1)',
            tooltipLabel: isAuctionCompleted
                ? 'Time elapsed since the auction completed'
                : 'Total time remaining in the auction',
        },
        {
            label: 'market cap',
            value: !placeholderTicker
                ? formattedMarketCapEthValue +
                  ' / ' +
                  currentMarketCapUsdFormatted
                : '-',
            color: 'var(--text2)',
            tooltipLabel: isAuctionCompleted
                ? 'Filled market cap at the end of the auction in ETH'
                : 'CURRENT FILLED MARKET CAP OF THE AUCTION IN ETH',
        },
        // {
        //     label: 'market cap ($)',
        //     value: !placeholderTicker ? currentMarketCapUsdFormatted : '-',
        //     color: 'var(--text1)',
        //     tooltipLabel: isAuctionCompleted
        //         ? 'Filled market cap at the end of the auction in dollars based on the current price of eth'
        //         : 'Current filled market cap in dollars based on the current price of eth',
        // },
    ];

    const openBidClearingPriceInWeiBigInt =
        freshAuctionStatusData.openBidClearingPriceInNativeTokenWei
            ? BigInt(
                  freshAuctionStatusData.openBidClearingPriceInNativeTokenWei,
              )
            : undefined;

    const openBidMarketCapInWeiBigInt = openBidClearingPriceInWeiBigInt
        ? openBidClearingPriceInWeiBigInt * MARKET_CAP_MULTIPLIER_BIG_INT
        : undefined;

    const openBidMarketCapInEth = openBidMarketCapInWeiBigInt
        ? toDisplayQty(openBidMarketCapInWeiBigInt, 18)
        : undefined;

    const formattedOpenBidMarketCapEthValue = openBidMarketCapInEth
        ? getFormattedNumber({
              value: parseFloat(openBidMarketCapInEth),
              prefix: 'Ξ ',
          })
        : '...';

    const userBidClearingPriceInWeiBigInt =
        auctionDetailsForConnectedUser?.userBidClearingPriceInNativeTokenWei
            ? BigInt(
                  auctionDetailsForConnectedUser?.userBidClearingPriceInNativeTokenWei,
              )
            : undefined;

    const userBidMarketCapInWeiBigInt = userBidClearingPriceInWeiBigInt
        ? userBidClearingPriceInWeiBigInt * MARKET_CAP_MULTIPLIER_BIG_INT
        : undefined;

    const userBidMarketCapInEthNum = userBidMarketCapInWeiBigInt
        ? parseFloat(toDisplayQty(userBidMarketCapInWeiBigInt, 18))
        : undefined;

    const formattedUserBidMarketCapEthValue = userBidMarketCapInEthNum
        ? getFormattedNumber({
              value: userBidMarketCapInEthNum,
              prefix: 'Ξ ',
          })
        : '-';

    const userBidMarketCapUsdValue =
        nativeTokenUsdPrice !== undefined &&
        userBidMarketCapInEthNum !== undefined
            ? nativeTokenUsdPrice * userBidMarketCapInEthNum
            : undefined;

    const formattedUserBidMarketCapUsdValue = userBidMarketCapUsdValue
        ? getFormattedNumber({
              value: userBidMarketCapUsdValue,
              prefix: '$',
          })
        : '-';

    const qtyBidByUserInWeiBigInt =
        auctionDetailsForConnectedUser?.qtyBidByUserInNativeTokenWei
            ? BigInt(
                  auctionDetailsForConnectedUser?.qtyBidByUserInNativeTokenWei,
              )
            : undefined;

    const qtyBidByUserInEthNum = qtyBidByUserInWeiBigInt
        ? parseFloat(toDisplayQty(qtyBidByUserInWeiBigInt, 18))
        : undefined;

    const formattedBidSizeEthValue = qtyBidByUserInEthNum
        ? getFormattedNumber({
              value: qtyBidByUserInEthNum,
              prefix: 'Ξ ',
          })
        : '-';

    const qtyUserBidFilledInWeiBigInt =
        auctionDetailsForConnectedUser?.qtyUserBidFilledInNativeTokenWei
            ? BigInt(
                  auctionDetailsForConnectedUser?.qtyUserBidFilledInNativeTokenWei,
              )
            : undefined;

    const qtyUserBidFilledInEthNum = qtyUserBidFilledInWeiBigInt
        ? parseFloat(toDisplayQty(qtyUserBidFilledInWeiBigInt, 18))
        : undefined;

    const formattedFilledBidEthValue = qtyUserBidFilledInEthNum
        ? getFormattedNumber({
              value: qtyUserBidFilledInEthNum,
              prefix: 'Ξ ',
          })
        : '-';

    const currentOpenBidUsdValue =
        nativeTokenUsdPrice !== undefined && openBidMarketCapInEth !== undefined
            ? nativeTokenUsdPrice * parseFloat(openBidMarketCapInEth)
            : undefined;

    const currentOpenBidUsdValueFormatted =
        currentOpenBidUsdValue !== undefined
            ? getFormattedNumber({
                  value: currentOpenBidUsdValue,
                  isUSD: true,
              })
            : '...';

    const openBidMarketCapIndex = openBidMarketCapInWeiBigInt
        ? maxMarketCapWeiValues.findIndex(
              (item) => item === openBidMarketCapInWeiBigInt,
          )
        : -1;

    const openBidClearingPriceInEthNum = openBidClearingPriceInWeiBigInt
        ? parseFloat(toDisplayQty(openBidClearingPriceInWeiBigInt, 18))
        : undefined;

    const openBidQtyFilledInEthNum =
        freshAuctionStatusData.openBidQtyFilledInNativeTokenWei
            ? parseFloat(
                  toDisplayQty(
                      freshAuctionStatusData.openBidQtyFilledInNativeTokenWei,
                      18,
                  ),
              )
            : undefined;

    const formattedOpenBidClearingPriceInEth = getFormattedNumber({
        value: openBidClearingPriceInEthNum,
        prefix: 'Ξ ',
    });
    const formattedOpenBidQtyFilledInEth = getFormattedNumber({
        value: openBidQtyFilledInEthNum,
        prefix: 'Ξ ',
    });

    const formattedOpenBidStatus = `${formattedOpenBidQtyFilledInEth} / ${formattedOpenBidClearingPriceInEth}`;

    const fillPercentage =
        openBidQtyFilledInEthNum && openBidClearingPriceInEthNum
            ? openBidQtyFilledInEthNum / openBidClearingPriceInEthNum
            : 0.0;

    const fillPercentageFormatted = getFormattedNumber({
        value: fillPercentage * 100,
        isPercentage: true,
    });
    // Opened bid data
    const openedBidData = [
        {
            label: 'market cap',
            value: !placeholderTicker
                ? formattedOpenBidMarketCapEthValue +
                  ' / ' +
                  currentOpenBidUsdValueFormatted
                : '-',
            color: 'var(--text2)',
            tooltipLabel:
                'Current open bid market cap in ETH terms and in dollar terms based on the current price of ETH',
        },
        {
            label: 'bid size',
            value: !placeholderTicker ? formattedOpenBidStatus : '-',
            color: 'var(--text2)',
            tooltipLabel: 'CURRENT OPEN BID TOTAL FILL SIZE',
        },
    ];
    // Your bid data
    const yourBidData = [
        {
            label: 'max market cap',
            value: !placeholderTicker
                ? formattedUserBidMarketCapEthValue +
                  ' / ' +
                  formattedUserBidMarketCapUsdValue
                : '-',
            color: 'var(--text2)',
            tooltipLabel: 'THE MAX MARKET CAP YOUR CURRENT BID WILL BID UP TO',
        },
        {
            label: 'Bid size',
            value: !placeholderTicker ? formattedBidSizeEthValue : '-',
            color: 'var(--text2)',
            tooltipLabel: 'THE MAX BID SIZE YOU ARE WILLING TO GET FILLED',
        },
        {
            label: 'Filled Amount',
            value: !placeholderTicker ? formattedFilledBidEthValue : '-',
            color: 'var(--text2)',
            tooltipLabel: 'THE AMOUNT OF YOUR BID SIZE ALREADY FILLED',
        },
    ];

    // Extra info data
    const networkFee = bidGasPriceinDollars;
    const extraInfoData = isAuctionCompleted
        ? [
              {
                  title: 'NETWORK FEE',
                  tooltipTitle: 'NETWORK FEE PAID IN ORDER TO TRANSACT',
                  data: networkFee ? '~' + networkFee : '...',
              },
          ]
        : [
              {
                  title: 'PRICE IMPACT',
                  tooltipTitle:
                      'THE IMPACT YOUR BID HAS ON THE MARKET PRICE OF THIS AUCTION',
                  data: formattedPriceImpact,
              },
              {
                  title: 'NETWORK FEE',
                  tooltipTitle: 'NETWORK FEE PAID IN ORDER TO TRANSACT',
                  data: networkFee ? '~' + networkFee : '...',
              },
          ];

    const progressValue = !placeholderTicker ? fillPercentageFormatted : '-';

    // Ticker display component
    const tickerDisplay = (
        <div className={styles.tickerContainer}>
            {!isAuctionPage && !isMobile && <Divider count={2} />}
            <div className={styles.tickerNameContainer}>
                <h2>{!placeholderTicker ? tickerFromParams : '-'}</h2>
                {!placeholderTicker && (
                    <div className={styles.commentWatchlistContainer}>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`${styles.commentButton} ${
                                showComments && styles.buttonOn
                            }`}
                        >
                            COMMENTS{' '}
                        </button>
                        <FaEye
                            className={
                                styles[
                                    tickerFromParams &&
                                    watchlists.v1.data.includes(
                                        tickerFromParams,
                                    )
                                        ? 'watchlistButtonActive'
                                        : 'watchlistButtonInactive'
                                ]
                            }
                            size={25}
                            onClick={() =>
                                tickerFromParams &&
                                watchlists.v1.toggle(tickerFromParams)
                            }
                        />
                    </div>
                )}
            </div>
            {!showComments &&
                statusData.map((item, idx) => (
                    <div className={styles.tickerRow} key={idx}>
                        <TooltipLabel
                            itemTitle={item.label}
                            tooltipTitle={item.tooltipLabel}
                        />
                        <p
                            style={{
                                color: item.color,
                                fontSize: '14px',
                            }}
                        >
                            {item.value}
                        </p>
                    </div>
                ))}
        </div>
    );

    // Opened bid display component
    const openedBidDisplay = (
        <div className={`${styles.tickerContainer} ${styles.openBidContainer}`}>
            <FutaDivider2 />
            <h3 style={{ fontSize: SECTION_HEADER_FONT_SIZE }}>OPEN BID</h3>
            {openedBidData.map((item, idx) => (
                <div className={styles.tickerRow} key={idx}>
                    <TooltipLabel
                        itemTitle={item.label}
                        tooltipTitle={item.tooltipLabel}
                    />
                    <p
                        style={{
                            color: item.color,
                            fontSize: '14px',
                        }}
                    >
                        {item.value}
                    </p>
                </div>
            ))}
            <div className={styles.progressContainer}>
                <ProgressBar fillPercentage={fillPercentage * 100} />
                {!placeholderTicker ? (
                    <p className={styles.progressValue}>{progressValue}%</p>
                ) : (
                    '-'
                )}
            </div>
        </div>
    );
    // Your bid display component
    const yourBidDisplay = (
        <div className={`${styles.tickerContainer} ${styles.openBidContainer}`}>
            <FutaDivider2 />
            <h3 style={{ fontSize: SECTION_HEADER_FONT_SIZE }}>YOUR BID</h3>
            {yourBidData.map((item, idx) => (
                <div className={styles.tickerRow} key={idx}>
                    <TooltipLabel
                        itemTitle={item.label}
                        tooltipTitle={item.tooltipLabel}
                    />
                    <p
                        style={{
                            color: item.color,
                            fontSize: '14px',
                        }}
                    >
                        {item.value}
                    </p>
                </div>
            ))}
        </div>
    );

    const selectedMaxMarketCapInEthNum = selectedMaxMarketCapInWeiBigInt
        ? parseFloat(toDisplayQty(selectedMaxMarketCapInWeiBigInt, 18))
        : undefined;

    // Max FDV display component
    const tickerDropdownRef = useRef<HTMLDivElement>(null);
    const clickOutsideWalletHandler = () => {
        if (isMaxDropdownOpen) {
            setIsMaxDropdownOpen(false);
        } else return;
    };
    useOnClickOutside(tickerDropdownRef, clickOutsideWalletHandler);

    const fdvUsdValue =
        nativeTokenUsdPrice !== undefined && selectedMaxMarketCapInEthNum
            ? nativeTokenUsdPrice * selectedMaxMarketCapInEthNum
            : undefined;

    const selectedFdvUsdMaxValue =
        fdvUsdValue !== undefined
            ? fdvUsdValue
                ? getFormattedNumber({
                      value: fdvUsdValue,
                      isTickerDisplay: true,
                  })
                : '$0.00'
            : '...';

    const handleSelectItem = (item: bigint) => {
        setSelectedMaxMarketCapInWeiBigInt(item);
        setIsMaxDropdownOpen(false);
    };

    const formattedSelectedFdvValue = getFormattedNumber({
        value: selectedMaxMarketCapInEthNum ?? 0,
        prefix: 'Ξ ',
    });

    const maxFdvData = maxMarketCapWeiValues.slice(openBidMarketCapIndex);

    const maxFdvDisplay = (
        <div
            className={`${styles.tickerContainer} ${styles.maxMarketContainer}`}
        >
            <FutaDivider2 />
            <TooltipLabel
                tooltipTitle='The max market cap you are willing to bid up to'
                itemTitle='MAX MARKET CAP'
                isHeader
                fontSize={SECTION_HEADER_FONT_SIZE}
            />
            <div
                className={styles.maxDropdownContainer}
                ref={tickerDropdownRef}
            >
                <button
                    onClick={() => {
                        tickerFromParams &&
                            setIsMaxDropdownOpen(!isMaxDropdownOpen);
                    }}
                    className={styles.maxDropdownButton}
                    style={tickerFromParams ? {} : { cursor: 'not-allowed' }}
                >
                    <p>
                        {!placeholderTicker && formattedSelectedFdvValue
                            ? formattedSelectedFdvValue
                            : '-'}
                    </p>
                    <div
                        className={styles.alignCenter}
                        style={{ fontSize: '18px' }}
                    >
                        {!placeholderTicker
                            ? '(' + selectedFdvUsdMaxValue + ')'
                            : '-'}
                        {!placeholderTicker && <LuChevronDown size={20} />}
                    </div>
                </button>
                {isMaxDropdownOpen && (
                    <div className={styles.maxDropdownContent}>
                        {maxFdvData.map((item, idx) => {
                            const maxFdvInEth = toDisplayQty(item, 18);

                            const fdvUsdValue =
                                nativeTokenUsdPrice !== undefined &&
                                item !== undefined
                                    ? nativeTokenUsdPrice *
                                      parseFloat(maxFdvInEth)
                                    : undefined;

                            const fdvUsdValueTruncated =
                                fdvUsdValue !== undefined
                                    ? fdvUsdValue
                                        ? getFormattedNumber({
                                              value: fdvUsdValue,
                                              isTickerDisplay: true,
                                          })
                                        : '$0.00'
                                    : undefined;

                            const formattedFdvValue = getFormattedNumber({
                                value: parseFloat(maxFdvInEth),
                                prefix: 'Ξ ',
                            });

                            return (
                                <div
                                    className={styles.maxRow}
                                    key={idx}
                                    onClick={() => handleSelectItem(item)}
                                >
                                    <p>{formattedFdvValue}</p>(
                                    {fdvUsdValueTruncated})
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    const bidUsdValueTruncated =
        bidUsdValue !== undefined
            ? bidUsdValue
                ? getFormattedNumber({
                      value: bidUsdValue,
                      isUSD: true,
                  })
                : '$0.00'
            : undefined;

    const nativeToken = supportedNetworks[chainId]?.defaultPair[0];

    // Bid size display component
    const bidSizeDisplay = (
        <div className={styles.tickerContainer}>
            <TooltipLabel
                tooltipTitle='The max bid size you are willing to submit'
                itemTitle='BID SIZE'
                isHeader
                fontSize={SECTION_HEADER_FONT_SIZE}
            />
            <CurrencySelector
                disable={!tickerFromParams}
                selectedToken={nativeToken}
                setQty={setBidQtyNonDisplay}
                inputValue={inputValue}
                setInputValue={setInputValue}
                customBorderRadius='0px'
                noModals
                usdValue={bidUsdValueTruncated}
                walletBalance={nativeTokenWalletBalanceTruncated}
            />
        </div>
    );

    // Extra info display component
    const extraInfoDisplay = (
        <div className={styles.extraInfoContainer}>
            {extraInfoData.map((item, idx) => (
                <div className={styles.extraRow} key={idx}>
                    <TooltipLabel
                        itemTitle={item.title}
                        tooltipTitle={item.tooltipTitle}
                    />
                    <p style={{ color: 'var(--text2)' }}>{item.data}</p>
                </div>
            ))}
        </div>
    );

    return {
        maxFdvDisplay,
        bidSizeDisplay,
        extraInfoDisplay,
        tickerDisplay,
        openedBidDisplay,
        yourBidDisplay,
    };
};
