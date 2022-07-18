export default class Token {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
    logoURI: string;
    fromList?: string;

    constructor(
        name = 'Unknown Token',
        address: string,
        symbol: '???',
        decimals: number,
        chainId: number,
        logoURI: string,  
        fromList: string
    ) {
        this.name = name;
        this.address = address;
        this.symbol = symbol;
        this.decimals = decimals;
        this.chainId = chainId;
        this.logoURI = logoURI;
        this.fromList = fromList;
    }
}