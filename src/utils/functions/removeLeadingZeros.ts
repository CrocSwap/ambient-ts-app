const removeLeadingZeros = (numStr: string) => {
    const parts = numStr.split('.');

    const integerPart = parseInt(parts[0]);

    let decimalPart = '';
    if (parts.length > 1) decimalPart = `.${parts[1]}`;

    return `${integerPart}${decimalPart}`;
};

export default removeLeadingZeros;
