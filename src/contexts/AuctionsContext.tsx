import React, {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { CrocEnvContext } from './CrocEnvContext';
import { mockAuctionDetailsServerResponseGenerator } from '../pages/platformFuta/mockAuctionData';
import {
    tickerWatchlistIF,
    useTickerWatchlist,
} from '../pages/platformFuta/useTickerWatchlist';
import { UserDataContext } from './UserDataContext';
import {
    AuctionDataIF,
    AuctionStatusDataServerIF,
} from '../ambient-utils/dataLayer/functions/getAuctionData';
import { CachedDataContext } from './CachedDataContext';

interface AuctionsContextIF {
    globalAuctionList: AuctionsDataIF;
    accountData: AccountDataIF;
    updateUserAuctionsList(address: string): void;
    updateGlobalAuctionsList(): void;
    getAuctionData(ticker: string): void;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    showComments: boolean;
    setShowComments: Dispatch<SetStateAction<boolean>>;
    tickerInput: string;
    setTickerInput: Dispatch<SetStateAction<string>>;
    auctionStatusData: AuctionStatusDataIF;
    selectedTicker: string | undefined;
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
    openBidClearingPriceInNativeTokenWei: string | undefined;
    openBidQtyFilledInNativeTokenWei: string | undefined;
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

export const AuctionsContext = createContext<AuctionsContextIF>(
    {} as AuctionsContextIF,
);

export const AuctionsContextProvider = (props: { children: ReactNode }) => {
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);
    const { cachedGetGlobalAuctionsList, cachedGetUserAuctionsList } =
        useContext(CachedDataContext);

    const [globalAuctionList, setGlobalAuctionList] =
        React.useState<AuctionsDataIF>({
            dataReceived: false,
            chainId: chainId,
            data: [],
        });

    const [accountData, setAccountData] = useState<AccountDataIF>({
        dataReceived: false,
        chainId: chainId,
        userAddress: '',
        auctions: [],
    });

    const [auctionStatusData, setAuctionStatusData] =
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

    // const fetchAccountData = async (
    //     address: string,
    //     chainId: string,
    // ): Promise<AuctionDataIF[]> => {
    //     false &&
    //         console.log('fetching account data for address:', {
    //             address,
    //             chainId,
    //         });
    //     if (
    //         address.toLowerCase() ===
    //         '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc'.toLowerCase()
    //     ) {
    //         return mockAccountData1;
    //     }
    //     return mockAccountData2;
    // };

    const fetchAuctionStatusData = async (
        ticker: string,
    ): Promise<AuctionStatusDataServerIF> => {
        return mockAuctionDetailsServerResponseGenerator(ticker, chainId);
    };

    function updateGlobalAuctionsList() {
        cachedGetGlobalAuctionsList(
            chainId,
            Math.floor(Date.now() / 30000),
        ).then((data) => {
            setGlobalAuctionList({
                dataReceived: true,
                chainId: chainId,
                data: data,
            });
        });
    }

    function updateUserAuctionsList(address: string) {
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
    }

    function getAuctionData(ticker: string) {
        fetchAuctionStatusData(ticker).then((data) => {
            setAuctionStatusData({
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
            });
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
        auctionStatusData: auctionStatusData,
        globalAuctionList: globalAuctionList,
        accountData: accountData,
        updateUserAuctionsList: updateUserAuctionsList,
        updateGlobalAuctionsList: updateGlobalAuctionsList,
        getAuctionData: getAuctionData,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
        tickerInput: tickerInput,
        setTickerInput: setTickerInput,
        showComments: showComments,
        setShowComments: setShowComments,
        selectedTicker: selectedTicker,
        setSelectedTicker: setSelectedTicker,
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
