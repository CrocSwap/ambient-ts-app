// This is a search hook to search and filter through an array

import { useEffect, useState, ChangeEvent } from 'react';

export function useSearch<T = Record<string, unknown>>(key: keyof T, items: T[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<T[]>(items);

    // update state if the item changes
    useEffect(() => {
        setFilteredData(items);
    }, [items]);

    function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setSearchTerm(value);

        // return original data if there are no matches for search term
        if (value.length <= 0) {
            setFilteredData(items);

            // else use the provided key term to search
        } else {
            setFilteredData(
                items.filter((v) =>
                    (v[key] as unknown as string)
                        .toString()
                        .toLowerCase()
                        .includes(value.toLowerCase()),
                ),
            );
        }
    }

    return {
        searchTerm,
        onSearchChange,
        filteredData,
    };
}

// TUTORIAL
// 1. To use this hook, first import searchTerm, onSearchChange, and filteredData from the hook as follow:
//       const {searchTerm, onSearchChange, filteredData} = useSearch<TokenIF>('symbol', tokensInDOM)
// In this example, we are using the hook to filter through a list of tokens(tokensInDom). We are using the token interface and from that interface, we are using 'symbol' as the key. In other words, match the search term with token.symbol
// const {searchTerm, onSearchChange, filteredData} = useSearch<Interface of your searchable values>('the key from that interface you want to use to search', the data you are searching through)

// 2. Create a search input and assign it the value and onChange function from this hook, as follow:
// <input
//     placeholder='Search tokens'
//     type='text'

//     value={searchTerm}
//     onChange={onSearchChange}
// />

// 3. From here, filtereData should return the data with the  items that matches the search term. For a better demonstration, refer to Tokens.tsx in the PortfolioTabs, or reach out to Junior.
