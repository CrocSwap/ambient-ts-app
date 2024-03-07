import { dexTokenData } from '../../../pages/Explore/useTokenStats';

interface sortedDexTokensIF {
    sorted: dexTokenData[];
}

type sortByTypes = 'default' | 'time';

export const useSortedDexTokens = (
    unsorted: dexTokenData[],
): sortedDexTokensIF => {
    // const [sortBy, setSortBy] = useState<sortByTypes>('default');

    // function sortByTime(tkns: dexTokenData[]) {
    //     const output = tkns.sort((a: dexTokenData, b: dexTokenData) => {
    //         return a.
    //     })
    // };
    return {
        sorted: unsorted,
    };
};
