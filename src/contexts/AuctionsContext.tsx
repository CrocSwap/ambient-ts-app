import React, {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { CURRENT_AUCTION_VERSION } from '../ambient-utils/constants';
import { AuctionDataIF } from '../ambient-utils/dataLayer/functions/getAuctionData';
import {
    tickerWatchlistIF,
    useTickerWatchlist,
} from '../pages/platformFuta/useTickerWatchlist';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { UserDataContext } from './UserDataContext';

export interface AuctionsContextIF {
    globalAuctionList: AuctionsDataIF;
    setFilteredAuctionList: Dispatch<
        SetStateAction<AuctionDataIF[] | undefined>
    >;
    filteredAuctionList: AuctionDataIF[] | undefined;
    accountData: AccountDataIF;
    updateUserAuctionsList(address: string): void;
    updateGlobalAuctionsList(): void;
    getFreshAuctionData(ticker: string): void;
    freshAuctionStatusData: AuctionStatusDataIF;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    showComments: boolean;
    setShowComments: Dispatch<SetStateAction<boolean>>;
    tickerInput: string;
    setTickerInput: Dispatch<SetStateAction<string>>;
    selectedTicker: string | undefined;
    hoveredTicker: string | undefined;
    setHoveredTicker: Dispatch<SetStateAction<string | undefined>>;
    setSelectedTicker: Dispatch<SetStateAction<string | undefined>>;
    watchlists: {
        v1: tickerWatchlistIF;
        shouldDisplay: boolean;
        show: () => void;
        unshow: () => void;
        toggle: () => void;
    };
    showComplete: boolean;
    setShowComplete: Dispatch<SetStateAction<boolean>>;
}

export interface AuctionStatusDataIF {
    dataReceived: boolean;
    chainId: string;
    ticker: string;
    createdAt: number;
    auctionLength: number;
    filledClearingPriceInNativeTokenWei: string;

    // open bid data
    openBidClearingPriceInNativeTokenWei?: string | undefined;
    openBidQtyFilledInNativeTokenWei?: string | undefined;

    // closed auction data
    tokenAddress?: string | undefined;
}

export interface AuctionsDataIF {
    dataReceived: boolean;
    chainId: string;
    data: AuctionDataIF[] | undefined;
}

export interface AccountDataIF {
    dataReceived: boolean;
    chainId: string;
    userAddress: string;
    auctions: AuctionDataIF[] | undefined;
}

export interface AuctionIF {
    status: string;
}

export const AuctionsContext = createContext({} as AuctionsContextIF);

export const AuctionsContextProvider = (props: { children: ReactNode }) => {
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        cachedGetGlobalAuctionsList,
        cachedGetUserAuctionsList,
        cachedGetAuctionStatus,
    } = useContext(CachedDataContext);

    const [globalAuctionList, setGlobalAuctionList] =
        React.useState<AuctionsDataIF>({
            dataReceived: false,
            chainId: chainId,
            data: [],
        });

    const [filteredAuctionList, setFilteredAuctionList] = React.useState<
        AuctionDataIF[] | undefined
    >([]);

    const [accountData, setAccountData] = useState<AccountDataIF>({
        dataReceived: false,
        chainId: chainId,
        userAddress: '',
        auctions: [],
    });

    const [freshAuctionStatusData, setFreshAuctionStatusData] =
        useState<AuctionStatusDataIF>({
            dataReceived: false,
            ticker: '',
            createdAt: 0,
            auctionLength: 0,
            chainId: chainId,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
            openBidClearingPriceInNativeTokenWei: undefined,
            openBidQtyFilledInNativeTokenWei: undefined,
        });

    const [isLoading, setIsLoading] = useState(true);
    const [tickerInput, setTickerInput] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showComplete, setShowComplete] = useState<boolean>(false);

    const [selectedTicker, setSelectedTicker] = useState<string | undefined>();
    const [hoveredTicker, setHoveredTicker] = useState<string | undefined>();

    function updateGlobalAuctionsList() {
        cachedGetGlobalAuctionsList(
            chainId,
            Math.floor(Date.now() / 30000),
        ).then((data) => {
            const res = {
                dataReceived: true,
                chainId: chainId,
                data: data,
            };
            setGlobalAuctionList(res);
        });
    }

    function updateUserAuctionsList(address: string) {
        if (address !== '') {
            cachedGetUserAuctionsList(
                chainId,
                address,
                Math.floor(Date.now() / 30000),
            ).then((data) => {
                setAccountData({
                    dataReceived: true,
                    chainId: chainId,
                    userAddress: address,
                    auctions: data,
                });
            });
        } else {
            setAccountData({
                dataReceived: false,
                chainId: chainId,
                userAddress: '',
                auctions: [],
            });
        }
    }

    function getFreshAuctionData(ticker: string) {
        cachedGetAuctionStatus(
            ticker,
            CURRENT_AUCTION_VERSION,
            chainId,
            Math.floor(Date.now() / 30000),
        ).then((response) => {
            const data = response?.data;
            if (!data) {
                setFreshAuctionStatusData({
                    dataReceived: false,
                    ticker: '',
                    createdAt: 0,
                    auctionLength: 0,
                    chainId: '',
                    filledClearingPriceInNativeTokenWei: '',
                    openBidClearingPriceInNativeTokenWei: '',
                    openBidQtyFilledInNativeTokenWei: '',
                    tokenAddress: '',
                });
            } else {
                setFreshAuctionStatusData({
                    dataReceived: true,
                    ticker: data.ticker,
                    createdAt: data.createdAt,
                    auctionLength: data.auctionLength,
                    chainId: chainId,
                    filledClearingPriceInNativeTokenWei:
                        data.filledClearingPriceInNativeTokenWei,
                    openBidClearingPriceInNativeTokenWei:
                        data.openBidClearingPriceInNativeTokenWei,
                    openBidQtyFilledInNativeTokenWei:
                        data.openBidQtyFilledInNativeTokenWei,
                    tokenAddress: data.tokenAddress,
                });
            }
        });
    }

    useEffect(() => {
        // clear account data when user logs out
        if (!userAddress) {
            setAccountData({
                dataReceived: false,
                chainId: '',
                userAddress: '',
                auctions: [],
            });
        }
    }, [userAddress]);

    // hook managing ticker watchlists for each FUTA version
    const watchlistV1: tickerWatchlistIF = useTickerWatchlist('v1');

    const [showWatchlist, setShowWatchlist] = useState<boolean>(false);

    function displayWatchlist(show?: boolean): void {
        setShowWatchlist(show ?? !showWatchlist);
    }

    const auctionsContext: AuctionsContextIF = {
        freshAuctionStatusData: freshAuctionStatusData,
        globalAuctionList: globalAuctionList,
        filteredAuctionList: filteredAuctionList,
        setFilteredAuctionList: setFilteredAuctionList,
        accountData: accountData,
        updateUserAuctionsList: updateUserAuctionsList,
        updateGlobalAuctionsList: updateGlobalAuctionsList,
        getFreshAuctionData: getFreshAuctionData,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
        tickerInput: tickerInput,
        setTickerInput: setTickerInput,
        showComments: showComments,
        setShowComments: setShowComments,
        selectedTicker: selectedTicker,
        setSelectedTicker: setSelectedTicker,
        hoveredTicker: hoveredTicker,
        setHoveredTicker: setHoveredTicker,
        watchlists: {
            v1: watchlistV1,
            shouldDisplay: showWatchlist,
            show: () => displayWatchlist(true),
            unshow: () => displayWatchlist(false),
            toggle: () => displayWatchlist(),
        },
        showComplete: showComplete,
        setShowComplete: setShowComplete,
    };

    return (
        <AuctionsContext.Provider value={auctionsContext}>
            {props.children}
        </AuctionsContext.Provider>
    );
};
