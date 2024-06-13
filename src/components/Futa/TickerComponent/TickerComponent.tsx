import { useContext, useEffect, useRef, useState } from 'react';
import styles from './TickerComponent.module.css';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { useParams } from 'react-router-dom';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import {
    DEFAULT_MAINNET_GAS_PRICE_IN_GWEI,
    DEFAULT_SCROLL_GAS_PRICE_IN_GWEI,
    DEPOSIT_BUFFER_MULTIPLIER_MAINNET,
    DEPOSIT_BUFFER_MULTIPLIER_SCROLL,
    GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE,
    GAS_DROPS_ESTIMATE_RANGE_HARVEST,
    NUM_GWEI_IN_ETH,
    NUM_GWEI_IN_WEI,
    NUM_WEI_IN_GWEI,
    supportedNetworks,
} from '../../../ambient-utils/constants';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { BigNumber } from 'ethers';
import useDebounce from '../../../App/hooks/useDebounce';
import { toDisplayQty } from '@crocswap-libs/sdk';
import Divider from '../Divider/Divider';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { CurrencySelector } from '../../Form/CurrencySelector';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import BreadCrumb from '../Breadcrumb/Breadcrumb';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Comments from '../Comments/Comments';
import { FaEye } from 'react-icons/fa';
interface PropsIF {
    isAuctionPage?: boolean;
    placeholderTicker?: boolean;
}
export default function TickerComponent(props: PropsIF) {
    const { isAuctionPage, placeholderTicker } = props;
    const desktopScreen = useMediaQuery('(min-width: 1280px)');

    const [isMaxDropdownOpen, setIsMaxDropdownOpen] = useState(false);
    const [bidQtyNonDisplay, setBidQtyNonDisplay] = useState<
        string | undefined
    >('');
    const { crocEnv } = useContext(CrocEnvContext);

    const {
        auctions: { chainId: chainId },
        showComments,
        setShowComments,
        // auctions,
    } = useContext(AuctionsContext);

    const { isUserConnected } = useContext(UserDataContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);
    const { tokenBalances } = useContext(TokenBalanceContext);
    const { userAddress } = useContext(UserDataContext);

    const { ticker: tickerFromParams } = useParams();

    const { gasPriceInGwei, isActiveNetworkL2 } = useContext(ChainDataContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const [nativeTokenUsdPrice, setNativeTokenUsdPrice] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (!crocEnv) return;
        Promise.resolve(
            cachedFetchTokenPrice(nativeToken.address, chainId, crocEnv),
        ).then((price) => {
            if (price?.usdPrice !== undefined) {
                setNativeTokenUsdPrice(price.usdPrice);
            } else {
                setNativeTokenUsdPrice(undefined);
            }
        });
    }, [crocEnv, chainId]);

    const getAuctionDetails = async (ticker: string) => {
        if (
            ticker.toLowerCase() === 'not' ||
            ticker.toLowerCase() === 'mog' ||
            ticker.toLowerCase() === 'mew'
        )
            return { status: 'CLOSED' };

        return { status: 'OPEN' };
    };

    const getAllocationByUser = async (
        ticker: string,
        userAddress: `0x${string}` | undefined,
    ) => {
        if (!userAddress) return { unclaimedAllocation: '0' };
        if (ticker.toLowerCase() === 'not')
            return { unclaimedAllocation: '100000' };
        if (ticker.toLowerCase() === 'mog')
            return { unclaimedAllocation: '168200' };

        return { unclaimedAllocation: '0' };
    };

    // setState for auction details
    const [auctionDetails, setAuctionDetails] = useState<
        { status: string } | undefined
    >();
    // setState for allocation for user
    const [allocationForConnectedUser, setAllocationForConnectedUser] =
        useState<{ unclaimedAllocation: string } | undefined>();

    const [bidGasPriceinDollars, setBidGasPriceinDollars] = useState<
        string | undefined
    >();

    const formattedUnclaimedAllocationForConnectedUser = parseFloat(
        allocationForConnectedUser?.unclaimedAllocation ?? '0',
    ).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    const isAuctionCompleted =
        auctionDetails?.status?.toLowerCase() === 'closed';

    useEffect(() => {
        if (!tickerFromParams) return;
        Promise.resolve(getAuctionDetails(tickerFromParams)).then((details) =>
            setAuctionDetails(details),
        );
    }, [tickerFromParams]);

    useEffect(() => {
        if (!tickerFromParams) return;
        Promise.resolve(
            getAllocationByUser(tickerFromParams, userAddress),
        ).then((details) => setAllocationForConnectedUser(details));
    }, [tickerFromParams, userAddress]);

    const averageGasUnitsForBidTxInGasDrops = GAS_DROPS_ESTIMATE_RANGE_HARVEST;

    useEffect(() => {
        if (gasPriceInGwei && nativeTokenUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageGasUnitsForBidTxInGasDrops *
                NUM_GWEI_IN_WEI *
                nativeTokenUsdPrice;

            setBidGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, nativeTokenUsdPrice]);

    const [inputValue, setInputValue] = useState('');

    const [isValidationInProgress, setIsValidationInProgress] =
        useState<boolean>(false);
    const [isPriceImpactQueryInProgress, setIsPriceImpactQueryInProgress] =
        useState<boolean>(false);

    const [isValidated, setIsValidated] = useState<boolean>(false);
    const [priceImpact, setPriceImpact] = useState<number | undefined>();

    useEffect(() => {
        setIsValidationInProgress(true);
        setIsPriceImpactQueryInProgress(true);
    }, [inputValue]);

    const nativeToken = supportedNetworks[chainId]?.defaultPair[0];

    const nativeData: TokenIF | undefined =
        tokenBalances &&
        tokenBalances.find(
            (tkn: TokenIF) => tkn.address === nativeToken.address,
        );

    const nativeTokenWalletBalance = nativeData?.walletBalance;

    const bidDisplayNum = inputValue
        ? parseFloat(inputValue ?? '0')
        : undefined;

    const bidUsdValue =
        nativeTokenUsdPrice !== undefined && bidDisplayNum !== undefined
            ? nativeTokenUsdPrice * bidDisplayNum
            : undefined;

    const bidUsdValueTruncated =
        bidUsdValue !== undefined
            ? bidUsdValue
                ? getFormattedNumber({
                      value: bidUsdValue,
                      isUSD: true,
                  })
                : '$0.00'
            : undefined;

    const nativeTokenDecimals = nativeToken.decimals;

    const checkBidValidity = async (bidQtyNonDisplay: string) => {
        const isNonZero =
            !!bidQtyNonDisplay && parseFloat(bidQtyNonDisplay) > 0;

        if (!isNonZero) return false;

        if (!isUserConnected) {
            return true;
        } else {
            if (!nativeTokenWalletBalanceAdjustedNonDisplayString) return false;

            const bidSizeLessThanAdjustedBalance = BigNumber.from(
                nativeTokenWalletBalanceAdjustedNonDisplayString,
            ).gt(BigNumber.from(bidQtyNonDisplay));

            return bidSizeLessThanAdjustedBalance;
        }
    };

    const getPriceImpact = async (bidQtyNonDisplay: string) => {
        const isNonZero =
            !!bidQtyNonDisplay && parseFloat(bidQtyNonDisplay) > 0;

        if (!isNonZero) return undefined;

        const priceImpact = Math.random() * 0.1;

        return priceImpact;
    };

    const debouncedBidInput = useDebounce(bidQtyNonDisplay, 500);

    const nativeTokenWalletBalanceDisplay = nativeTokenWalletBalance
        ? toDisplayQty(nativeTokenWalletBalance, nativeTokenDecimals)
        : undefined;

    const nativeTokenWalletBalanceDisplayNum = nativeTokenWalletBalanceDisplay
        ? parseFloat(nativeTokenWalletBalanceDisplay)
        : undefined;

    const nativeTokenWalletBalanceTruncated = getFormattedNumber({
        value: nativeTokenWalletBalanceDisplayNum,
    });

    const [l1GasFeeLimitInGwei] = useState<number>(
        isActiveNetworkL2 ? 0.0002 * 1e9 : 0,
    );
    const amountToReduceNativeTokenQtyMainnet = BigNumber.from(
        Math.ceil(gasPriceInGwei || DEFAULT_MAINNET_GAS_PRICE_IN_GWEI),
    )
        .mul(BigNumber.from(NUM_WEI_IN_GWEI))
        .mul(BigNumber.from(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE))
        .mul(BigNumber.from(DEPOSIT_BUFFER_MULTIPLIER_MAINNET));

    const amountToReduceNativeTokenQtyL2 = BigNumber.from(
        Math.ceil(gasPriceInGwei || DEFAULT_SCROLL_GAS_PRICE_IN_GWEI),
    )
        .mul(BigNumber.from(NUM_WEI_IN_GWEI))
        .mul(BigNumber.from(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE))
        .mul(BigNumber.from(DEPOSIT_BUFFER_MULTIPLIER_SCROLL));

    const amountToReduceNativeTokenQty = isActiveNetworkL2
        ? amountToReduceNativeTokenQtyL2
        : amountToReduceNativeTokenQtyMainnet;

    const isTokenWalletBalanceGreaterThanZero = nativeTokenWalletBalance
        ? parseFloat(nativeTokenWalletBalance) > 0
        : false;

    const nativeTokenWalletBalanceAdjustedNonDisplayString =
        nativeTokenWalletBalance
            ? BigNumber.from(nativeTokenWalletBalance)

                  .sub(amountToReduceNativeTokenQty)
                  .sub(BigNumber.from(l1GasFeeLimitInGwei * NUM_GWEI_IN_ETH))
                  .toString()
            : nativeTokenWalletBalance;

    const adjustedTokenWalletBalanceDisplay = useDebounce(
        nativeTokenWalletBalanceAdjustedNonDisplayString
            ? toDisplayQty(
                  nativeTokenWalletBalanceAdjustedNonDisplayString,
                  nativeTokenDecimals,
              )
            : undefined,
        500,
    );

    useEffect(() => {
        checkBidValidity(debouncedBidInput).then((isValid) => {
            setIsValidationInProgress(false);
            setIsValidated(isValid);
        });
        getPriceImpact(debouncedBidInput).then((impact) => {
            setIsPriceImpactQueryInProgress(false);
            setPriceImpact(impact);
        });
    }, [debouncedBidInput, nativeTokenWalletBalanceAdjustedNonDisplayString]);

    const handleBalanceClick = () => {
        if (isTokenWalletBalanceGreaterThanZero) {
            setBidQtyNonDisplay(
                nativeTokenWalletBalanceAdjustedNonDisplayString,
            );

            if (adjustedTokenWalletBalanceDisplay)
                setInputValue(adjustedTokenWalletBalanceDisplay);
        }
    };

    const statusData = [
        {
            label: 'status',
            value: !placeholderTicker ? auctionDetails?.status : '-',
            color: 'var(--accent1)',
        },
        {
            label: 'time remaining',
            value: !placeholderTicker ? 'XXh:XXm:XXs' : '-',
            color: 'var(--positive)',
        },
        {
            label: 'market cap (ETH)',
            value: !placeholderTicker ? 'XXX.XXX' : '-',
            color: 'var(--text1)',
        },
        {
            label: 'market cap ($)',
            value: !placeholderTicker ? '($XXX,XXX,XXX)' : '-',
            color: 'var(--text1)',
        },
    ];
    const openedBidData = [
        {
            label: 'market cap (ETH)',
            value: !placeholderTicker ? 'XXX.XXX' : '-',
            color: 'var(--text1)',
        },
        {
            label: 'market cap ($)',
            value: !placeholderTicker ? '($XXX,XXX,XXX)' : '-',
            color: 'var(--text1)',
        },
        {
            label: 'bid size',
            value: !placeholderTicker ? 'XXX.XXX / XXX.XXX' : '-',
            color: 'var(--accent1)',
        },
    ];
    const maxFdvData = [
        { value: 0.216 },
        { value: 0.271 },
        { value: 0.338 },
        { value: 0.423 },
        { value: 0.529 },
    ];

    const formattedPriceImpact =
        !priceImpact || isPriceImpactQueryInProgress
            ? '...'
            : getFormattedNumber({
                  value: priceImpact * 100,
                  isPercentage: true,
              }) + '%';

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

    const [selectedMaxValue, setSelectedMaxValue] = useState(maxFdvData[0]);

    const handleSelectItem = (item: { value: number }) => {
        setSelectedMaxValue(item);
        setIsMaxDropdownOpen(false);
    };

    const tickerDisplay = (
        <div className={styles.tickerContainer}>
            {!isAuctionPage && <Divider count={2} />}
            <div className={styles.tickerNameContainer}>
                <h2>{!placeholderTicker ? tickerFromParams : '-'}</h2>
                {!placeholderTicker && (
                    <button onClick={() => setShowComments(!showComments)}>
                        COMMENTS{' '}
                        <FaEye
                            size={20}
                            color={showComments ? 'var(--accent1)' : ''}
                        />
                    </button>
                )}
            </div>
            {!showComments &&
                statusData.map((item, idx) => (
                    <div className={styles.tickerRow} key={idx}>
                        <p className={styles.tickerLabel}>{item.label}:</p>
                        <p style={{ color: item.color }}>{item.value}</p>
                    </div>
                ))}
        </div>
    );

    const openedBidDisplay = (
        <div className={styles.tickerContainer}>
            <h3>OPEN BID</h3>
            {openedBidData.map((item, idx) => (
                <div className={styles.tickerRow} key={idx}>
                    <p className={styles.tickerLabel}>{item.label}:</p>
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
    const tickerDropdownRef = useRef<HTMLDivElement>(null);
    const clickOutsideWalletHandler = () => setIsMaxDropdownOpen(false);

    const fdvUsdValue =
        nativeTokenUsdPrice !== undefined &&
        selectedMaxValue.value !== undefined
            ? nativeTokenUsdPrice * selectedMaxValue.value
            : undefined;

    const selectedFdvUsdMaxValue =
        fdvUsdValue !== undefined
            ? fdvUsdValue
                ? getFormattedNumber({
                      value: fdvUsdValue,
                      isUSD: true,
                  })
                : '$0.00'
            : '...';
    useOnClickOutside(tickerDropdownRef, clickOutsideWalletHandler);
    const maxFdvDisplay = (
        <div className={styles.tickerContainer}>
            <h3>MAX MARKET CAP</h3>
            <div className={styles.maxDropdownContainer}>
                <button
                    onClick={() => setIsMaxDropdownOpen(!isMaxDropdownOpen)}
                    className={styles.maxDropdownButton}
                >
                    <p> {!placeholderTicker ? selectedMaxValue.value : '-'}</p>
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

    const userQtyDisplay = (
        <div className={styles.userQtyDisplay}>
            <p style={{ color: 'var(--text2)' }}>{bidUsdValueTruncated}</p>
            {nativeTokenWalletBalance !== '0' && (
                <div
                    className={styles.maxButtonContainer}
                    onClick={handleBalanceClick}
                >
                    <p>{nativeTokenWalletBalanceTruncated}</p>
                </div>
            )}
        </div>
    );
    const bidSizeDisplay = (
        <div className={styles.tickerContainer}>
            <h3>BID SIZE</h3>
            <CurrencySelector
                selectedToken={nativeToken}
                setQty={setBidQtyNonDisplay}
                inputValue={inputValue}
                setInputValue={setInputValue}
                customBottomContent={userQtyDisplay}
                customBorderRadius='0px'
                noModals
            />
        </div>
    );

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

    const isAllocationAvailableToClaim =
        allocationForConnectedUser?.unclaimedAllocation &&
        parseFloat(allocationForConnectedUser.unclaimedAllocation) > 0;

    const showTradeButton =
        (isAuctionCompleted && !isUserConnected) ||
        (isUserConnected &&
            isAuctionCompleted &&
            !isAllocationAvailableToClaim);

    const isButtonDisabled =
        isUserConnected &&
        !isAuctionCompleted &&
        (isValidationInProgress || !isValidated);

    const buttonLabel = isAllocationAvailableToClaim
        ? 'Claim'
        : showTradeButton
        ? 'Trade'
        : !isUserConnected
        ? 'Connect Wallet'
        : !bidQtyNonDisplay || parseFloat(bidQtyNonDisplay) === 0
        ? 'Enter a Bid Size'
        : isValidationInProgress
        ? 'Validating Bid...'
        : isValidated
        ? 'Bid'
        : 'Invalid Bid';

    const bidButton = (
        <button
            className={`${styles.bidButton} ${
                isButtonDisabled ? styles.bidButtonDisabled : ''
            } ${desktopScreen ? styles.bidButtonDesktop : ''}`}
            onClick={() =>
                isAllocationAvailableToClaim
                    ? console.log(
                          `clicked claim for amount: ${formattedUnclaimedAllocationForConnectedUser}`,
                      )
                    : showTradeButton
                    ? console.log(
                          `clicked Trade for ticker: ${tickerFromParams}`,
                      )
                    : !isUserConnected
                    ? openWalletModal()
                    : console.log(`clicked Bid for display qty: ${inputValue}`)
            }
            disabled={isButtonDisabled}
        >
            {buttonLabel}
        </button>
    );

    const allocationDisplay = (
        <div className={styles.allocationContainer}>
            <h3>ALLOCATION</h3>
            <div className={styles.allocationDisplay}>
                {formattedUnclaimedAllocationForConnectedUser}
            </div>
            {extraInfoDisplay}
        </div>
    );
    const QTY_INPUT_ID = 'exchangeBalance_qty';
    const bidQtyInputField = document.getElementById(
        QTY_INPUT_ID,
    ) as HTMLInputElement;

    useEffect(() => {
        /* auto-focus the bid qty input field on first load
                                   and when the max market cap value changes,
                                   but only when the input field is empty */
        if (bidQtyInputField && !inputValue) bidQtyInputField.focus();
    }, [bidQtyInputField, selectedMaxValue.value, inputValue]);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.flexColumn}>
                    {!isAuctionPage && <BreadCrumb />}
                    {tickerDisplay}
                    {showComments && <Comments />}
                </div>

                {!showComments && (
                    <>
                        {!isAuctionCompleted && openedBidDisplay}
                        {!isAuctionCompleted && maxFdvDisplay}
                        {!isAuctionCompleted && bidSizeDisplay}
                        {isUserConnected &&
                            !showTradeButton &&
                            isAuctionCompleted &&
                            allocationDisplay}
                        {!isAuctionCompleted && extraInfoDisplay}
                    </>
                )}
            </div>
            {!showComments && bidButton}
        </div>
    );
}
