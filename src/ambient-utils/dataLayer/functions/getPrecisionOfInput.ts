export const precisionOfInput = (inputString: string) => {
    if (inputString.includes('.')) {
        return inputString.split('.')[1].length;
    }
    // String Does Not Contain Decimal
    return 0;
};
