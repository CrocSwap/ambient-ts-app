import { useContext, useEffect, useState } from 'react';
import styles from './TickerComponent.module.css';
import {
    AuctionDataIF,
    AuctionsContext,
} from '../../../contexts/AuctionsContext';
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
    getFormattedNumber,
    getTimeRemaining,
    getTimeRemainingAbbrev,
} from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { BigNumber } from 'ethers';
import useDebounce from '../../../App/hooks/useDebounce';
import { toDisplayQty } from '@crocswap-libs/sdk';

import BreadCrumb from '../Breadcrumb/Breadcrumb';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Comments from '../Comments/Comments';
import { tickerDisplayElements } from './tickerDisplayElements';
import moment from 'moment';

interface PropsIF {
    isAuctionPage?: boolean;
    placeholderTicker?: boolean;
}

// Contexts
const useAuctionContexts = () => {
    const {
        showComments,
        setShowComments,
        auctions,
        accountData,
        getAuctionData,
        auctionStatusData,
    } = useContext(AuctionsContext);

    const chainId = auctions.chainId;

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
        auctions,
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
    const [allocationForConnectedUser, setAllocationForConnectedUser] =
        useState<number | undefined>();
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

    useEffect(() => {
        setSelectedMaxValue(auctionStatusData.openBidMarketCap);
    }, [auctionStatusData.openBidMarketCap]);

    return {
        isMaxDropdownOpen,
        setIsMaxDropdownOpen,
        bidQtyNonDisplay,
        setBidQtyNonDisplay,
        auctionDetails,
        setAuctionDetails,
        allocationForConnectedUser,
        setAllocationForConnectedUser,
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
        auctions,
    } = useAuctionContexts();

    const {
        isMaxDropdownOpen,
        setIsMaxDropdownOpen,
        bidQtyNonDisplay,
        setBidQtyNonDisplay,
        auctionDetails,
        setAuctionDetails,
        allocationForConnectedUser,
        setAllocationForConnectedUser,
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
        return auctions.data.find(
            (data) => data.ticker.toLowerCase() === ticker.toLowerCase(),
        );
    };
    const getAuctionDetailsForAccount = async (ticker: string) => {
        return accountData.auctions.find(
            (data) => data.ticker.toLowerCase() === ticker.toLowerCase(),
        );
    };

    const { ticker: tickerFromParams } = useParams();

    useEffect(() => {
        if (!tickerFromParams) return;
        Promise.resolve(getAuctionData(tickerFromParams)).then(() => {
            console.log('fetched data for ' + tickerFromParams);
        });
    }, [tickerFromParams]);

    const formattedunclaimedTokenAllocationForConnectedUser =
        allocationForConnectedUser
            ? allocationForConnectedUser.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
              })
            : undefined;

    const marketCapEthValue = auctionDetails?.marketCap;

    const timeRemainingAbbrev = auctionDetails
        ? getTimeRemainingAbbrev(
              moment(auctionDetails.createdAt * 1000).diff(
                  Date.now() - auctionDetails.auctionLength * 1000,
                  'seconds',
              ),
          )
        : undefined;

    const [timeRemaining, setTimeRemaining] = useState<string | undefined>();

    const refreshTimeRemaining = () => {
        if (auctionDetails) {
            const timeRemainingInSeconds = moment(
                auctionDetails.createdAt * 1000,
            ).diff(Date.now() - auctionDetails.auctionLength * 1000, 'seconds');
            const timeRemainingString = getTimeRemaining(
                timeRemainingInSeconds,
            );
            setTimeRemaining(timeRemainingString);
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
    }, [tickerFromParams, auctions.data]);

    useEffect(() => {
        if (!tickerFromParams) return;
        if (userAddress) {
            Promise.resolve(getAuctionDetailsForAccount(tickerFromParams)).then(
                (details) =>
                    setAllocationForConnectedUser(
                        details?.unclaimedTokenAllocation
                            ? details?.unclaimedTokenAllocation
                            : undefined,
                    ),
            );
        } else {
            setAllocationForConnectedUser(undefined);
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
        allocationForConnectedUser && allocationForConnectedUser > 0;

    const showTradeButton =
        (isAuctionCompleted && !isUserConnected) ||
        (isUserConnected &&
            isAuctionCompleted &&
            !isAllocationAvailableToClaim);

    const isButtonDisabled =
        isUserConnected &&
        !isAuctionCompleted &&
        (isValidationInProgress || !isValidated);

    const buttonLabel =
        !tickerFromParams && isUserConnected
            ? 'Select an Auction'
            : isAllocationAvailableToClaim
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
                          `clicked claim for amount: ${formattedunclaimedTokenAllocationForConnectedUser}`,
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
        marketCapEthValue,
        currentMarketCapUsdValue,
        timeRemaining,
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
    } = tickerDisplayElements(tickerDisplayElementsProps);

    const allocationDisplay = (
        <div className={styles.allocationContainer}>
            <h3>ALLOCATION</h3>
            <div className={styles.allocationDisplay}>
                {formattedunclaimedTokenAllocationForConnectedUser}
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
                        <div className={styles.flexColumn}>
                            {!isAuctionCompleted && maxFdvDisplay}
                            {!isAuctionCompleted && bidSizeDisplay}
                            {isUserConnected &&
                                !showTradeButton &&
                                isAuctionCompleted &&
                                allocationDisplay}
                            {!isAuctionCompleted && extraInfoDisplay}
                        </div>
                    </>
                )}
            </div>
            {!showComments && bidButton}
        </div>
    );
}
