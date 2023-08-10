export const handleWETH = {
    check(userInput: string): boolean {
        const wethStrings: string[] = [
            // goerli WETH
            '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
            'b4fbf271143f4fbf7b91a5ded31805e42b2208d6',
            // mainnet WETH
            'c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        ];
        const isWeth: boolean = wethStrings.some(
            (str: string) => userInput.toLowerCase() === str,
        );
        return isWeth;
    },
    message: ' Ambient uses Native Ether (ETH) to lower gas costs.',
};
