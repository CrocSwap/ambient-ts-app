export function truncateDecimals(number: number, decimalPlaces: number) {
    return number % 1 ? number.toFixed(decimalPlaces) : number.toString();
    // if (number >= 2) {
    //     return number % 1 ? parseFloat(number.toFixed(decimalPlaces)) : number;
    // } else {
    //     return number % 1 ? parseFloat(number.toFixed(4)) : number;
    // }
}
