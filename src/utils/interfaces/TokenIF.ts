export interface TokenIF {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
    logoURI: string;
    fromList?: string;
    listedBy?: string[];
    walletBalance?: string;
    walletBalanceDisplay?: string;
    walletBalanceDisplayTruncated?: string;
    dexBalance?: string;
    dexBalanceDisplay?: string;
    dexBalanceDisplayTruncated?: string;
    combinedBalance?: string;
    combinedBalanceDisplay?: string;
    combinedBalanceDisplayTruncated?: string;
}
