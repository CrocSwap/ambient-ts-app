const removeLeadingZeros = (numStr: string) => {
    const parts = numStr.split('.');
    console.log(parts);

    let integerPart = numStr.includes('e')
        ? parseFloat(parts[0])
        : parseInt(parts[0]);
    if (isNaN(integerPart)) integerPart = 0;

    let decimalPart = '';
    if (parts.length > 1) decimalPart = `.${parts[1]}`;

    return `${integerPart}${decimalPart}`;
};

export default removeLeadingZeros;
