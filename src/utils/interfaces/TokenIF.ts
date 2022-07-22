export interface TokenIF {
    name: string;
    address: string;
    // eslint-disable-next-line camelcase
    token_address?: string;
    symbol: string;
    decimals: number;
    chainId: number;
    logoURI: string;
    fromList?: string;
    balance?: string;
}
