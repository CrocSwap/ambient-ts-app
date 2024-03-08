import { tokenListURIs } from '../../constants';

// string-union type of all acceptable values for `fromList` property
type uris = typeof tokenListURIs[keyof typeof tokenListURIs];
type otherTokenSources = 'on_chain_by_URL_param';
type tokenProvenances = uris | otherTokenSources;

export interface TokenIF {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
    logoURI: string;
    fromList?: tokenProvenances;
    listedBy?: string[];
    walletBalance?: string;
    dexBalance?: string;
}
