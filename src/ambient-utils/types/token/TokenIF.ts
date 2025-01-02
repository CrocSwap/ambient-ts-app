import { tokenListURIs } from '../../constants';

// string-union type of all acceptable values for `fromList` property
type uris = (typeof tokenListURIs)[keyof typeof tokenListURIs];
export type otherTokenSources = 'on_chain_by_URL_param';
type tokenProvenances = uris | otherTokenSources;

// interface conforming to Uniswap standard, this is the format we expect
// ... of any token retrieved from an external URI
export interface ServerTokenIF {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
    logoURI: string;
}

// interface describing our internal standard we use for token data after
// ... being decorated by in-app middleware
export interface TokenIF extends ServerTokenIF {
    fromList?: tokenProvenances;
    listedBy?: string[];
    walletBalance?: string;
    dexBalance?: string;
    totalSupply?: bigint;
    isFuta?: boolean;
}
