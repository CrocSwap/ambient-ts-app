export const handleWETH = {
    check(userInput: string): boolean {
        const wethStrings: string[] = [
            'weth',
            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        ];
        const isWeth: boolean = wethStrings.some((str: string) =>
            userInput.includes(str),
        );
        return isWeth;
    },
    message:
        'It looks like you want to use Wrapped Ether (WETH). Do you know that you can trade Native Ether (ETH) at lower gas cost on Ambient?',
};
