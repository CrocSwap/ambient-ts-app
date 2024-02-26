// this interface conforms to the industry standard token data obj shape
export interface ServerTokenIF {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
    logoURI: string;
}

// this interface extends the industry standard with our own internal decorations
export interface TokenIF extends ServerTokenIF {
    fromList?: string;
    listedBy?: string[];
    walletBalance?: string;
    dexBalance?: string;
}
