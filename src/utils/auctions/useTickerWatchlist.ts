import { useState } from 'react';

export type tickerVersions = 'v1';

export interface tickerWatchlistIF {
    data: string[];
    version: tickerVersions;
    add: (t: string) => void;
    remove: (t: string) => void;
    toggle: (t: string) => void;
}

export function useTickerWatchlist(
    version: tickerVersions,
    defaultWatchlist: string[] = [],
): tickerWatchlistIF {
    // local storage key, each FUTA version keeps a separate watchlist
    const LS_KEY: string = 'ticker_watchlist_' + version;

    // array of actively watched tokens
    const [watchlist, setWatchlist] = useState<string[]>(getPersisted());

    // logic to get a list of persisted tokens from local storage
    // if no list is found or it fails to parse, use default list
    function getPersisted(): string[] {
        let output: string[];
        const persistedRaw: string | null = localStorage.getItem(LS_KEY);
        if (persistedRaw) {
            const parsed: string[] = JSON.parse(persistedRaw);
            if (Array.isArray(parsed)) {
                output = parsed;
            } else {
                localStorage.setItem(LS_KEY, JSON.stringify(defaultWatchlist));
                output = defaultWatchlist;
            }
        } else {
            localStorage.setItem(LS_KEY, JSON.stringify(defaultWatchlist));
            output = defaultWatchlist;
        }
        return output;
    }

    // fn to update the watchlist in local state and local storage
    function processUpdate(tickers: string[]): void {
        setWatchlist(tickers);
        localStorage.setItem(LS_KEY, JSON.stringify(tickers));
    }

    // fn to add a ticker to the active watchlist
    function watchTicker(t: string): void {
        const currentList: string[] = [...watchlist];
        if (!currentList.includes(t)) {
            processUpdate(currentList.concat([t]));
        }
    }

    // fn to remove a ticker from the active watchlist
    function unwatchTicker(t: string): void {
        if (watchlist.includes(t)) {
            processUpdate(watchlist.filter((e: string) => e !== t));
        }
    }

    // fn to intelligently add or remove a ticker from the active watchlist
    function toggleWatching(t: string): void {
        watchlist.includes(t) ? unwatchTicker(t) : watchTicker(t);
    }

    // return object
    return {
        data: watchlist,
        version: version,
        add: watchTicker,
        remove: unwatchTicker,
        toggle: toggleWatching,
    };
}
