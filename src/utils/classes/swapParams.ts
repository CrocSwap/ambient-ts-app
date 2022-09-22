export default class swapParams {
    chain: string;
    tokenA: string;
    tokenB: string;

    constructor(inputArray: string[][]) {
        const findValue = (key: string) => {
            const queriedPair = inputArray.find((pair: string[]) => pair[0] === key);
            return queriedPair ? queriedPair[1] : '';
        };
        this.chain = findValue('chain');
        this.tokenA = findValue('tokenA');
        this.tokenB = findValue('tokenB');
    }
}
