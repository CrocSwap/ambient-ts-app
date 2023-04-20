/**
 * Creates an `onChange` event handler that validates input and calls a provided
 * `handleEventLocal` function.
 * @param handleEventLocal A function that is called when the input is valid.
 * @param options An object with options for the function.
 * @param options.replaceCommas If `true`, replaces commas with dots in the input.
 * @param options.regexPattern A regular expression pattern used to validate the input.
 * @param options.maxPrecision The maximum number of decimal places allowed in the input.
 * @returns An `onChange` event handler that validates the input and calls `handleEventLocal`.
 */
const createOnChangeHandler = (
    handleEventLocal: (event: React.ChangeEvent<HTMLInputElement>) => void,
    options: {
        replaceCommas?: boolean;
        regexPattern: RegExp;
        maxPrecision: number;
    },
) => {
    /**
     * Calculates the precision of a decimal number string.
     * @param inputString The decimal number string to calculate precision for.
     * @returns The number of decimal places in the input string, or 0 if none.
     */
    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        return 0;
    };

    /**
     * The `onChange` event handler function.
     * @param event The `ChangeEvent` object from the input element.
     */
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        let targetValue = event.target.value;
        if (options.replaceCommas) {
            targetValue = targetValue.replace(',', '.');
        }

        const isPrecisionGreaterThanDecimals =
            precisionOfInput(targetValue) > options.maxPrecision;

        const isUserInputValid = options.regexPattern.test(targetValue);
        if (isUserInputValid && !isPrecisionGreaterThanDecimals) {
            handleEventLocal({
                ...event,
                target: { ...event.target, value: targetValue },
            });
        }
    };
};
export default createOnChangeHandler;
