export const handleWETH = (): {
    checkIsWETH: (userInput: string) => boolean;
    message: string;
} => {
    const checkIsWETH = (userInput: string): boolean => {
        const wethStrings: string[] = [
            'weth',
            'wrapped ether',
            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        ];
        const isWeth: boolean = wethStrings.some((str: string) =>
            userInput.includes(str),
        );
        return isWeth;
    };
    const message =
        'It looks like you want to use Wrapped Ether. Do you know that native Ether is cheaper on the Ambient platform?';
    return {
        checkIsWETH,
        message,
    };
};
