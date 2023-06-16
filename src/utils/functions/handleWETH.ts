export const handleWETH = (
    userInput: string,
): {
    isWeth: boolean;
    message: string;
} => {
    let isWeth = false;
    const wethStrings: string[] = [
        'weth',
        'wrapped ether',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ];
    wethStrings.forEach((str: string) => {
        if (userInput.toLowerCase().includes(str)) isWeth = true;
    });
    const message =
        'It looks like you want to use Wrapped Ether. Do you know that native Ether is cheaper on the Ambient platform?';
    return {
        isWeth,
        message,
    };
};
