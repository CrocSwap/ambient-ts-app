export interface TokenIF {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
    logoURI: string;
    fromList?: string;
    balance?: string;
    dexBalance?: string;
    combinedBalance?: string;
}
