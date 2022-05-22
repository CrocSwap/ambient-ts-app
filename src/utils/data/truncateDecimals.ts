export default function truncateDecimals(number: number, decimalPlaces: number) {
    const truncatedNumber = number % 1 ? number.toFixed(decimalPlaces) : number;
    return truncatedNumber;
}
