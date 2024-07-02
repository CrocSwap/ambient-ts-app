import { useContext, useEffect, useState } from 'react';
import styles from './TickerComponent.module.css';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { useParams } from 'react-router-dom';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
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
import {
    AuctionDataIF,
    getFormattedNumber,
    getTimeRemainingAbbrev,
} from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import useDebounce from '../../../App/hooks/useDebounce';
import { toDisplayQty } from '@crocswap-libs/sdk';

import BreadCrumb from '../Breadcrumb/Breadcrumb';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Comments from '../Comments/Comments';
import { tickerDisplayElements } from './tickerDisplayElements';
import moment from 'moment';
import {
    getFreshAuctionDetailsForAccount,
    marketCapMultiplier,
} from '../../../pages/platformFuta/mockAuctionData';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

interface PropsIF {
    isAuctionPage?: boolean;
    placeholderTicker?: boolean;
}

// Contexts
const useAuctionContexts = () => {
    const {
        showComments,
        setShowComments,
        globalAuctionList,
        accountData,
        getAuctionData,
        auctionStatusData,
    } = useContext(AuctionsContext);
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const { isUserConnected } = useContext(UserDataContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);
    const { tokenBalances } = useContext(TokenBalanceContext);
    const { userAddress } = useContext(UserDataContext);
    const { gasPriceInGwei, isActiveNetworkL2, nativeTokenUsdPrice } =
        useContext(ChainDataContext);

    return {
        getAuctionData,
        auctionStatusData,
        accountData,
        globalAuctionList,
        chainId,
        showComments,
        setShowComments,
        isUserConnected,
        openWalletModal,
        tokenBalances,
        userAddress,
        gasPriceInGwei,
        isActiveNetworkL2,
        nativeTokenUsdPrice,
    };
};

// States
const useAuctionStates = () => {
    const { isActiveNetworkL2, auctionStatusData } = useAuctionContexts();
    const [isMaxDropdownOpen, setIsMaxDropdownOpen] = useState(false);
    const [bidQtyNonDisplay, setBidQtyNonDisplay] = useState<
        string | undefined
    >('');
    const [auctionDetails, setAuctionDetails] = useState<
        AuctionDataIF | undefined
    >();
    const [auctionDetailsForConnectedUser, setAuctionDetailsForConnectedUser] =
        useState<AuctionDataIF | undefined>();
    const [bidGasPriceinDollars, setBidGasPriceinDollars] = useState<
        string | undefined
    >();
    const [inputValue, setInputValue] = useState('');
    const [isValidationInProgress, setIsValidationInProgress] =
        useState<boolean>(false);
    const [isPriceImpactQueryInProgress, setIsPriceImpactQueryInProgress] =
        useState<boolean>(false);
    const [isValidated, setIsValidated] = useState<boolean>(false);
    const [priceImpact, setPriceImpact] = useState<number | undefined>();
    const [selectedMaxValue, setSelectedMaxValue] = useState<
        number | undefined
    >();
    const [l1GasFeeLimitInGwei] = useState<number>(
        isActiveNetworkL2 ? 0.0002 * 1e9 : 0,
    );

    const openBidClearingPriceInEth =
        auctionStatusData.openBidClearingPriceInNativeTokenWei
            ? parseFloat(
                  toDisplayQty(
                      auctionStatusData.openBidClearingPriceInNativeTokenWei,
                      18,
                  ),
              )
            : undefined;

    useEffect(() => {
        const openBidMarketCap = openBidClearingPriceInEth
            ? openBidClearingPriceInEth * marketCapMultiplier
            : 0;
        setSelectedMaxValue(openBidMarketCap);
    }, [openBidClearingPriceInEth]);

    return {
        isMaxDropdownOpen,
        setIsMaxDropdownOpen,
        bidQtyNonDisplay,
        setBidQtyNonDisplay,
        auctionDetails,
        setAuctionDetails,
        auctionDetailsForConnectedUser,
        setAuctionDetailsForConnectedUser,
        bidGasPriceinDollars,
        setBidGasPriceinDollars,
        inputValue,
        setInputValue,
        isValidationInProgress,
        setIsValidationInProgress,
        isPriceImpactQueryInProgress,
        setIsPriceImpactQueryInProgress,
        isValidated,
        setIsValidated,
        priceImpact,
        setPriceImpact,
        selectedMaxValue,
        setSelectedMaxValue,
        l1GasFeeLimitInGwei,
    };
};

// Component
export default function TickerComponent(props: PropsIF) {
    const { isAuctionPage, placeholderTicker } = props;
    const desktopScreen = useMediaQuery('(min-width: 1280px)');
    const {
        auctionStatusData,
        getAuctionData,
        chainId,
        showComments,
        isUserConnected,
        openWalletModal,
        tokenBalances,
        userAddress,
        gasPriceInGwei,
        isActiveNetworkL2,
        nativeTokenUsdPrice,
        accountData,
        globalAuctionList,
    } = useAuctionContexts();

    const {
        isMaxDropdownOpen,
        setIsMaxDropdownOpen,
        bidQtyNonDisplay,
        setBidQtyNonDisplay,
        auctionDetails,
        setAuctionDetails,
        auctionDetailsForConnectedUser,
        setAuctionDetailsForConnectedUser,
        bidGasPriceinDollars,
        setBidGasPriceinDollars,
        inputValue,
        setInputValue,
        isValidationInProgress,
        setIsValidationInProgress,
        isPriceImpactQueryInProgress,
        setIsPriceImpactQueryInProgress,
        isValidated,
        setIsValidated,
        priceImpact,
        setPriceImpact,
        selectedMaxValue,
        setSelectedMaxValue,
        l1GasFeeLimitInGwei,
    } = useAuctionStates();

    // Utility functions
    const getAuctionDetails = async (ticker: string) => {
        return globalAuctionList.data
            ? globalAuctionList.data.find(
                  (data) => data.ticker.toLowerCase() === ticker.toLowerCase(),
              )
            : undefined;
    };

    const { ticker: tickerFromParams } = useParams();

    useEffect(() => {
        if (!tickerFromParams) return;
        Promise.resolve(getAuctionData(tickerFromParams)).then(() => {
            // console.log('fetched data for ' + tickerFromParams);
        });
    }, [tickerFromParams]);

    const auctionedTokenQtyUnclaimedByUser =
        auctionDetailsForConnectedUser?.qtyUnclaimedByUserInAuctionedTokenWei
            ? toDisplayQty(
                  auctionDetailsForConnectedUser?.qtyUnclaimedByUserInAuctionedTokenWei,
                  18,
              )
            : undefined;

    const unclaimedTokenNum = auctionedTokenQtyUnclaimedByUser
        ? parseFloat(auctionedTokenQtyUnclaimedByUser)
        : 0;

    const formattedUnclaimedTokenAllocationForConnectedUser =
        unclaimedTokenNum.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        }) +
        ' ' +
        auctionDetailsForConnectedUser?.ticker;

    const qtyUnreturnedToUser =
        auctionDetailsForConnectedUser?.qtyUnreturnedToUserInNativeTokenWei
            ? toDisplayQty(
                  auctionDetailsForConnectedUser?.qtyUnreturnedToUserInNativeTokenWei,
                  18,
              )
            : undefined;

    const unreturnedTokenNum = qtyUnreturnedToUser
        ? parseFloat(qtyUnreturnedToUser)
        : 0;

    const formattedQtyUnreturnedToUser =
        unreturnedTokenNum.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        }) +
        ' ' +
        'ETH';
    const marketCapEthValue = auctionDetails
        ? parseFloat(
              toDisplayQty(
                  auctionDetails.filledClearingPriceInNativeTokenWei,
                  18,
              ),
          ) * marketCapMultiplier
        : undefined;

    const timeRemainingAbbrev = auctionDetails
        ? getTimeRemainingAbbrev(
              moment(auctionDetails.createdAt * 1000).diff(
                  Date.now() - auctionDetails.auctionLength * 1000,
                  'seconds',
              ),
          )
        : undefined;

    const [timeRemainingInSeconds, setTimeRemainingInSeconds] = useState<
        number | undefined
    >();
    // const [timeRemaining, setTimeRemaining] = useState<string | undefined>();

    const refreshTimeRemaining = () => {
        if (auctionDetails) {
            const timeRemainingInSeconds = moment(
                auctionDetails.createdAt * 1000,
            ).diff(Date.now() - auctionDetails.auctionLength * 1000, 'seconds');

            setTimeRemainingInSeconds(timeRemainingInSeconds);
            // setTimeRemaining(timeRemainingString);
        }
    };

    useEffect(() => {
        // refresh time remaining every 1 second
        refreshTimeRemaining();
        const interval = setInterval(() => {
            refreshTimeRemaining();
        }, 1000);
        return () => clearInterval(interval);
    }, [tickerFromParams, auctionDetails]);

    const isAuctionCompleted =
        timeRemainingAbbrev?.toLowerCase() === 'complete';

    useEffect(() => {
        if (!tickerFromParams) return;
        Promise.resolve(getAuctionDetails(tickerFromParams)).then((details) => {
            setAuctionDetails(details);
        });
    }, [tickerFromParams, globalAuctionList.data]);

    useEffect(() => {
        if (!tickerFromParams) return;
        if (userAddress) {
            Promise.resolve(
                getFreshAuctionDetailsForAccount(tickerFromParams, accountData),
            ).then((details) => {
                setAuctionDetailsForConnectedUser(
                    details ? details : undefined,
                );
            });
        } else {
            setAuctionDetailsForConnectedUser(undefined);
        }
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

    const nativeTokenDecimals = nativeToken.decimals;

    const checkBidValidity = async (bidQtyNonDisplay: string) => {
        const isNonZero =
            !!bidQtyNonDisplay && parseFloat(bidQtyNonDisplay) > 0;

        if (!isNonZero) return false;

        if (!isUserConnected) {
            return true;
        } else {
            if (!nativeTokenWalletBalanceAdjustedNonDisplayString) return false;

            const bidSizeLessThanAdjustedBalance =
                BigInt(nativeTokenWalletBalanceAdjustedNonDisplayString) >
                BigInt(bidQtyNonDisplay);

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

    const amountToReduceNativeTokenQtyMainnet =
        BigInt(Math.ceil(gasPriceInGwei || DEFAULT_MAINNET_GAS_PRICE_IN_GWEI)) *
        BigInt(NUM_WEI_IN_GWEI) *
        BigInt(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE) *
        BigInt(DEPOSIT_BUFFER_MULTIPLIER_MAINNET);

    const amountToReduceNativeTokenQtyL2 =
        BigInt(Math.ceil(gasPriceInGwei || DEFAULT_SCROLL_GAS_PRICE_IN_GWEI)) *
        BigInt(NUM_WEI_IN_GWEI) *
        BigInt(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE) *
        BigInt(DEPOSIT_BUFFER_MULTIPLIER_SCROLL);

    const amountToReduceNativeTokenQty = isActiveNetworkL2
        ? amountToReduceNativeTokenQtyL2
        : amountToReduceNativeTokenQtyMainnet;

    const isTokenWalletBalanceGreaterThanZero = nativeTokenWalletBalance
        ? parseFloat(nativeTokenWalletBalance) > 0
        : false;

    const nativeTokenWalletBalanceAdjustedNonDisplayString =
        nativeTokenWalletBalance
            ? (
                  BigInt(nativeTokenWalletBalance) -
                  amountToReduceNativeTokenQty -
                  BigInt(l1GasFeeLimitInGwei * NUM_GWEI_IN_ETH)
              ).toString()
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

    useEffect(() => {
        setIsValidationInProgress(true);
    }, [bidQtyNonDisplay]);

    const handleBalanceClick = () => {
        if (isTokenWalletBalanceGreaterThanZero) {
            setBidQtyNonDisplay(
                nativeTokenWalletBalanceAdjustedNonDisplayString,
            );

            if (adjustedTokenWalletBalanceDisplay)
                setInputValue(adjustedTokenWalletBalanceDisplay);
        }
    };

    const formattedPriceImpact =
        !priceImpact || isPriceImpactQueryInProgress
            ? '...'
            : getFormattedNumber({
                  value: priceImpact * 100,
                  isPercentage: true,
              }) + '%';

    const fdvUsdValue =
        nativeTokenUsdPrice !== undefined && selectedMaxValue
            ? nativeTokenUsdPrice * selectedMaxValue
            : undefined;

    const currentMarketCapUsdValue =
        nativeTokenUsdPrice !== undefined && marketCapEthValue !== undefined
            ? nativeTokenUsdPrice * marketCapEthValue
            : undefined;

    const isAllocationAvailableToClaim =
        auctionedTokenQtyUnclaimedByUser &&
        parseFloat(auctionedTokenQtyUnclaimedByUser) > 0;

    const isNativeTokenAvailableToReturn =
        qtyUnreturnedToUser && parseFloat(qtyUnreturnedToUser) > 0;

    const showTradeButton =
        (isAuctionCompleted && !isUserConnected) ||
        (isUserConnected &&
            isAuctionCompleted &&
            !isAllocationAvailableToClaim &&
            !isNativeTokenAvailableToReturn);

    const isButtonDisabled =
        isUserConnected &&
        !isAuctionCompleted &&
        (isValidationInProgress || !isValidated);

    const buttonLabel =
        !tickerFromParams && isUserConnected
            ? 'Select an Auction'
            : isAllocationAvailableToClaim
              ? 'Claim'
              : isNativeTokenAvailableToReturn
                ? 'Return'
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
                          `clicked claim for amount: ${formattedUnclaimedTokenAllocationForConnectedUser}`,
                      )
                    : isNativeTokenAvailableToReturn
                      ? console.log(
                            `clicked return for amount: ${formattedQtyUnreturnedToUser}`,
                        )
                      : showTradeButton
                        ? console.log(
                              `clicked Trade for ticker: ${tickerFromParams}`,
                          )
                        : !isUserConnected
                          ? openWalletModal()
                          : console.log(
                                `clicked Bid for display qty: ${inputValue}`,
                            )
            }
            disabled={isButtonDisabled}
        >
            {buttonLabel}
        </button>
    );

    const tickerDisplayElementsProps = {
        auctionStatusData,
        auctionDetailsForConnectedUser,
        marketCapEthValue,
        currentMarketCapUsdValue,
        timeRemainingInSeconds,
        isAuctionCompleted,
        placeholderTicker,
        auctionDetails,
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
        bidQtyNonDisplay,
        setBidQtyNonDisplay,
        inputValue,
        setInputValue,
    };

    const {
        maxFdvDisplay,
        bidSizeDisplay,
        extraInfoDisplay,
        tickerDisplay,
        openedBidDisplay,
        yourBidDisplay,
    } = tickerDisplayElements(tickerDisplayElementsProps);

    const allocationOrReturnDisplay = (
        <div className={styles.allocationContainer}>
            <h3>{unclaimedTokenNum ? 'ALLOCATION' : 'RETURN'} </h3>
            <div className={styles.allocationDisplay}>
                {unclaimedTokenNum
                    ? formattedUnclaimedTokenAllocationForConnectedUser
                    : formattedQtyUnreturnedToUser}
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
    }, [bidQtyInputField, selectedMaxValue, inputValue]);

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
                        {!isAuctionCompleted && yourBidDisplay}
                        <div className={styles.flexColumn}>
                            {!isAuctionCompleted && maxFdvDisplay}
                            {!isAuctionCompleted && bidSizeDisplay}
                            {isUserConnected &&
                                isAuctionCompleted &&
                                !showTradeButton &&
                                allocationOrReturnDisplay}
                            {!isAuctionCompleted && extraInfoDisplay}
                        </div>
                    </>
                )}
            </div>
            {!showComments && bidButton}
        </div>
    );
}
