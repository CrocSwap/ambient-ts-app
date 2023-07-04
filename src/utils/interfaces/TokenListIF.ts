import { TokenIF } from './TokenIF';

export interface TokenListIF {
    keywords: Array<string>;
    logoURI: string;
    name: string;
    timestamp: string;
    tokens: Array<TokenIF>;
    version: {
        major: number;
        minor: number;
        version: number;
    };
    refreshAfter?: number;
    // eslint-disable-next-line
    tags?: any;
    default?: boolean;
    uri?: string;
    dateRetrieved?: string | number;
}
