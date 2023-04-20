const createOnChangeHandler = (
    handleEventLocal: (event: React.ChangeEvent<HTMLInputElement>) => void,
    options: {
        replaceCommas?: boolean;
        regexPattern: RegExp;
        maxPrecision: number;
    },
) => {
    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        return 0;
    };

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
