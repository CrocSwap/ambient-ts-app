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
import {
    mockAuctionData,
    mockAccountData1,
    mockAccountData2,
    mockAuctionDetailsServerResponseGenerator,
} from '../pages/platformFuta/mockAuctionData';
import {
    tickerWatchlistIF,
    useTickerWatchlist,
} from '../pages/platformFuta/useTickerWatchlist';

interface AuctionsContextIF {
    auctions: AuctionsDataIF;
    accountData: AccountDataIF;
    getAccountData(address: string, chainId: string): void;
    getAuctions(): void;
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

// interface for auction data used to generate tables
export interface AuctionDataIF {
    ticker: string;
    chainId: string;
    createdAt: number;
    auctionLength: number;
    filledClearingPriceInNativeTokenWei: string;

    // user specific data received for account queries
    userAddress?: string;
    userBidClearingPriceInNativeTokenWei?: string | undefined;
    qtyBidByUserInNativeTokenWei?: string | undefined;
    qtyUnclaimedByUserInAuctionedTokenWei?: string | undefined;
    qtyClaimedByUserInAuctionedTokenWei?: string | undefined;
    qtyUnreturnedToUserInNativeTokenWei?: string | undefined;
    qtyReturnedToUserInNativeTokenWei?: string | undefined;
}

// interface for auction status data used to generate auction details view
export interface AuctionStatusDataServerIF {
    ticker: string;
    chainId: string;
    createdAt: number;
    auctionLength: number;
    filledClearingPriceInNativeTokenWei: string;

    // open bid data
    openBidClearingPriceInNativeTokenWei?: string | undefined;
    openBidQtyFilledInNativeTokenWei?: string | undefined;
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
    data: AuctionDataIF[];
}

export interface AccountDataIF {
    dataReceived: boolean;
    chainId: string;
    userAddress: string;
    auctions: AuctionDataIF[];
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

    const [auctionsData, setAuctionsData] = useState<AuctionsDataIF>({
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

    const fetchAuctionsData = async (): Promise<AuctionDataIF[]> => {
        return mockAuctionData;
    };

    const fetchAccountData = async (
        address: string,
        chainId: string,
    ): Promise<AuctionDataIF[]> => {
        false &&
            console.log('fetching account data for address:', {
                address,
                chainId,
            });
        if (
            address.toLowerCase() ===
            '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc'.toLowerCase()
        ) {
            return mockAccountData1;
        }
        return mockAccountData2;
    };

    const fetchAuctionStatusData = async (
        ticker: string,
    ): Promise<AuctionStatusDataServerIF> => {
        return mockAuctionDetailsServerResponseGenerator(ticker, chainId);
    };

    function getAuctionsData() {
        fetchAuctionsData().then((data) => {
            setAuctionsData({
                dataReceived: true,
                chainId: chainId,
                data: data,
            });
        });
    }

    function getAccountData(address: string, chainId: string) {
        fetchAccountData(address, chainId).then((data) => {
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

    // useEffect to fetch auctions  data every 30 seconds
    useEffect(() => {
        getAuctionsData();
        const interval = setInterval(() => {
            getAuctionsData();
        }, 30000);
        return () => clearInterval(interval);
    }, [chainId]);

    // hook managing ticker watchlists for each FUTA version
    const watchlistV1: tickerWatchlistIF = useTickerWatchlist('v1');

    const [showWatchlist, setShowWatchlist] = useState<boolean>(false);

    function displayWatchlist(show?: boolean): void {
        setShowWatchlist(show ?? !showWatchlist);
    }

    const auctionsContext: AuctionsContextIF = {
        auctionStatusData: auctionStatusData,
        auctions: auctionsData,
        accountData: accountData,
        getAccountData: getAccountData,
        getAuctions: getAuctionsData,
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
