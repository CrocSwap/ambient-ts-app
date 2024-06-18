import { Dispatch, SetStateAction, useContext, useRef } from 'react';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { useParams } from 'react-router-dom';
import styles from './TickerComponent.module.css';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import Divider from '../Divider/Divider';
import { FaEye } from 'react-icons/fa';
import {
    AuctionDataIF,
    AuctionsContext,
} from '../../../contexts/AuctionsContext';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';
import { supportedNetworks } from '../../../ambient-utils/constants';

import { CurrencySelector } from '../../Form/CurrencySelector';

// Props interface
export interface PropsIF {
    maxFdvData: { value: number }[];
    marketCapEthValue: number | undefined;
    currentMarketCapUsdValue: number | undefined;
    timeRemaining: string | undefined;
    isAuctionCompleted?: boolean;
    placeholderTicker?: boolean;
    auctionDetails: AuctionDataIF | undefined;
    bidGasPriceinDollars: string | undefined;
    formattedPriceImpact: string;
    isAuctionPage?: boolean;
    isMaxDropdownOpen: boolean;
    setIsMaxDropdownOpen: Dispatch<SetStateAction<boolean>>;
    selectedMaxValue: {
        value: number;
    };
    setSelectedMaxValue: Dispatch<
        SetStateAction<{
            value: number;
        }>
    >;
    fdvUsdValue: number | undefined;
    bidUsdValue: number | undefined;
    handleBalanceClick: () => void;
    nativeTokenWalletBalanceTruncated: string;
    bidQtyNonDisplay: string | undefined;
    setBidQtyNonDisplay: Dispatch<SetStateAction<string | undefined>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
}

// Tooltip Label Component
interface TooltipTitleProps {
    itemTitle: string;
    tooltipTitle: string;
    isHeader?: boolean;
}

const TooltipLabel = (props: TooltipTitleProps) => {
    const { itemTitle, tooltipTitle, isHeader } = props;
    return (
        <div className={styles.tooltipLabelContainer}>
            <p
                className={styles.tickerLabel}
                style={{
                    color: isHeader ? 'var(--text1)' : '',
                    fontSize: isHeader ? '20px' : '',
                }}
            >
                {itemTitle}
            </p>
            <TooltipComponent
                placement='bottom'
                noBg
                title={
                    <div className={styles.tooltipTitleDisplay}>
                        {tooltipTitle}
                    </div>
                }
            />
        </div>
    );
};

// Main function
export const tickerDisplayElements = (props: PropsIF) => {
    // Destructure props
    const {
        maxFdvData,
        marketCapEthValue,
        currentMarketCapUsdValue,
        timeRemaining,
        isAuctionCompleted,
        placeholderTicker,
        bidGasPriceinDollars,
        formattedPriceImpact,
        isAuctionPage,
        isMaxDropdownOpen,
        setIsMaxDropdownOpen,
        selectedMaxValue,
        setSelectedMaxValue,
        fdvUsdValue,
        bidUsdValue,
        handleBalanceClick,
        nativeTokenWalletBalanceTruncated,
        setBidQtyNonDisplay,
        inputValue,
        setInputValue,
    } = props;

    // Contexts
    const { ticker: tickerFromParams } = useParams();
    const { nativeTokenUsdPrice } = useContext(ChainDataContext);
    const {
        auctions: { chainId },
        showComments,
        setShowComments,
    } = useContext(AuctionsContext);

    const currentMarketCapUsdFormatted =
        currentMarketCapUsdValue !== undefined
            ? getFormattedNumber({
                  value: currentMarketCapUsdValue,
                  isUSD: true,
              })
            : '...';

    // Status data
    const statusData = [
        {
            label: 'status',
            value: !placeholderTicker
                ? isAuctionCompleted
                    ? 'CLOSED'
                    : 'OPEN'
                : '-',
            color: 'var(--accent1)',
            tooltipLabel: 'The current status of the auction - open or closed',
        },
        {
            label: 'time remaining',
            value: !placeholderTicker ? timeRemaining : '-',
            color: 'var(--positive)',
            tooltipLabel: 'The time remaining till the auction is closed',
        },
        {
            label: 'market cap (ETH)',
            value: !placeholderTicker ? 'Ξ ' + marketCapEthValue : '-',
            color: 'var(--text1)',
            tooltipLabel: 'Current filled market cap in eth terms',
        },
        {
            label: 'market cap ($)',
            value: !placeholderTicker ? currentMarketCapUsdFormatted : '-',
            color: 'var(--text1)',
            tooltipLabel:
                'Current filled market cap in dollars based on the current price of eth',
        },
    ];

    const openBidEthValueNum = maxFdvData[0] ? maxFdvData[0].value : undefined;
    const openBidEthValueFormatted = openBidEthValueNum
        ? openBidEthValueNum.toString()
        : '...';

    const currentOpenBidUsdValue =
        nativeTokenUsdPrice !== undefined && openBidEthValueNum !== undefined
            ? nativeTokenUsdPrice * openBidEthValueNum
            : undefined;

    const currentOpenBidUsdValueFormatted =
        currentOpenBidUsdValue !== undefined
            ? getFormattedNumber({
                  value: currentOpenBidUsdValue,
                  isUSD: true,
              })
            : '...';

    // Opened bid data
    const openedBidData = [
        {
            label: 'market cap (ETH)',
            value: !placeholderTicker ? 'Ξ ' + openBidEthValueFormatted : '-',
            color: 'var(--text1)',
            tooltipLabel: 'Current open bid market cap in ETH terms',
        },
        {
            label: 'market cap ($)',
            value: !placeholderTicker ? currentOpenBidUsdValueFormatted : '-',
            color: 'var(--text1)',
            tooltipLabel:
                'Current open bid market cap in dollar terms based on the current price of ETH',
        },
        {
            label: 'bid size',
            value: !placeholderTicker ? 'XXX.XXX / XXX.XXX' : '-',
            color: 'var(--accent1)',
            tooltipLabel: 'Filled and total bid sized of the current open bid',
        },
    ];

    // Extra info data
    const networkFee = bidGasPriceinDollars;
    const extraInfoData = isAuctionCompleted
        ? [
              {
                  title: 'NETWORK FEE',
                  tooltipTitle:
                      'Estimated network fee (i.e. gas cost) to join bid',
                  data: networkFee ? '~' + networkFee : '...',
              },
          ]
        : [
              {
                  title: 'PRICE IMPACT',
                  tooltipTitle:
                      'Difference Between Current (Spot) Price and Final Price',
                  data: formattedPriceImpact,
              },
              {
                  title: 'NETWORK FEE',
                  tooltipTitle:
                      'Estimated network fee (i.e. gas cost) to join bid',
                  data: networkFee ? '~' + networkFee : '...',
              },
          ];

    const progressValue = !placeholderTicker ? 'XX.X' : '-';

    // Ticker display component
    const tickerDisplay = (
        <div className={styles.tickerContainer}>
            {!isAuctionPage && <Divider count={2} />}
            <div className={styles.tickerNameContainer}>
                <h2>{!placeholderTicker ? tickerFromParams : '-'}</h2>
                {!placeholderTicker && (
                    <div className={styles.alignCenter}>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`${styles.commentButton} ${
                                showComments && styles.buttonOn
                            }`}
                        >
                            COMMENTS{' '}
                        </button>
                        <FaEye size={25} className={styles.watchlistButton} />
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
                        <p style={{ color: item.color }}>{item.value}</p>
                    </div>
                ))}
        </div>
    );

    // Opened bid display component
    const openedBidDisplay = (
        <div className={`${styles.tickerContainer} ${styles.openBidContainer}`}>
            <h3>OPEN BID</h3>
            {openedBidData.map((item, idx) => (
                <div className={styles.tickerRow} key={idx}>
                    <TooltipLabel
                        itemTitle={item.label}
                        tooltipTitle={item.tooltipLabel}
                    />
                    <p style={{ color: item.color }}>{item.value}</p>
                </div>
            ))}
            <div className={styles.progressContainer}>
                <div className={styles.progressContent}>
                    {Array.from({ length: 10 }, (_, idx) => (
                        <span className={styles.progressBar} key={idx} />
                    ))}
                </div>
                {!placeholderTicker ? (
                    <p className={styles.progressValue}>{progressValue}%</p>
                ) : (
                    '-'
                )}
            </div>
        </div>
    );

    // Max FDV display component
    const tickerDropdownRef = useRef<HTMLDivElement>(null);
    const clickOutsideWalletHandler = () => setIsMaxDropdownOpen(false);
    useOnClickOutside(tickerDropdownRef, clickOutsideWalletHandler);

    const selectedFdvUsdMaxValue =
        fdvUsdValue !== undefined
            ? fdvUsdValue
                ? getFormattedNumber({
                      value: fdvUsdValue,
                      isUSD: true,
                  })
                : '$0.00'
            : '...';

    const handleSelectItem = (item: { value: number }) => {
        setSelectedMaxValue(item);
        setIsMaxDropdownOpen(false);
    };

    const maxFdvDisplay = (
        <div
            className={`${styles.tickerContainer} ${styles.maxMarketContainer}`}
        >
            <TooltipLabel
                tooltipTitle='The max market cap you are willing to bid up to'
                itemTitle='MAX MARKET CAP'
                isHeader
            />
            <div className={styles.maxDropdownContainer}>
                <button
                    onClick={() => {
                        tickerFromParams &&
                            setIsMaxDropdownOpen(!isMaxDropdownOpen);
                    }}
                    className={styles.maxDropdownButton}
                    style={tickerFromParams ? {} : { cursor: 'not-allowed' }}
                >
                    <p>
                        {!placeholderTicker && selectedMaxValue
                            ? selectedMaxValue?.value
                            : '-'}
                    </p>
                    {!placeholderTicker ? selectedFdvUsdMaxValue : '-'}
                </button>
                {isMaxDropdownOpen && (
                    <div
                        className={styles.maxDropdownContent}
                        ref={tickerDropdownRef}
                    >
                        {maxFdvData.map((item, idx) => {
                            const fdvUsdValue =
                                nativeTokenUsdPrice !== undefined &&
                                item.value !== undefined
                                    ? nativeTokenUsdPrice * item.value
                                    : undefined;

                            const fdvUsdValueTruncated =
                                fdvUsdValue !== undefined
                                    ? fdvUsdValue
                                        ? getFormattedNumber({
                                              value: fdvUsdValue,
                                              isUSD: true,
                                          })
                                        : '$0.00'
                                    : undefined;

                            return (
                                <div
                                    className={styles.maxRow}
                                    key={idx}
                                    onClick={() => handleSelectItem(item)}
                                >
                                    <p>{item.value}</p>({fdvUsdValueTruncated})
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
                handleBalanceClick={handleBalanceClick}
            />
        </div>
    );

    // Extra info display component
    const extraInfoDisplay = (
        <div className={styles.extraInfoContainer}>
            {extraInfoData.map((item, idx) => (
                <div className={styles.extraRow} key={idx}>
                    <div className={styles.alignCenter}>
                        <p>{item.title}</p>
                        <TooltipComponent title={item.tooltipTitle} />
                    </div>
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
    };
};
