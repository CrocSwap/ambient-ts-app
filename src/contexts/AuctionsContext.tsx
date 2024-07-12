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
    tickerWatchlistIF,
    useTickerWatchlist,
} from '../pages/platformFuta/useTickerWatchlist';
import { UserDataContext } from './UserDataContext';
import {
    AuctionDataIF,
    fetchFreshAuctionStatusData,
} from '../ambient-utils/dataLayer/functions/getAuctionData';
import { CachedDataContext } from './CachedDataContext';
import { TokenIF } from '../ambient-utils/types';
import { CURRENT_AUCTION_VERSION } from '../ambient-utils/constants';

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
    activeTickers: {
        pair: [TokenIF, TokenIF];
        update: (tickerA: TokenIF, tickerB: TokenIF) => void;
        reverse: () => void;
    };
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
        fetchFreshAuctionStatusData(
            ticker,
            CURRENT_AUCTION_VERSION,
            chainId,
        ).then((data) => {
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

    const [tickerPair, setTickerPair] = useState<[TokenIF, TokenIF]>([
        {
            name: 'Native Ether',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            decimals: 18,
            chainId: 11155111,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        },
        {
            address: '0x60bBA138A74C5e7326885De5090700626950d509',
            chainId: 11155111,
            decimals: 6,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            name: 'USDC',
            symbol: 'USDC',
        },
    ]);

    function changeTickers(tickerA: TokenIF, tickerB: TokenIF): void {
        setTickerPair([tickerA, tickerB]);
    }

    function reverseTickers(): void {
        setTickerPair([tickerPair[1], tickerPair[0]]);
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
        activeTickers: {
            pair: tickerPair,
            update: changeTickers,
            reverse: reverseTickers,
        },
    };

    return (
        <AuctionsContext.Provider value={auctionsContext}>
            {props.children}
        </AuctionsContext.Provider>
    );
};
