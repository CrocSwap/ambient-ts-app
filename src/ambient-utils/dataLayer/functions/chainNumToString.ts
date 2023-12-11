const baseForHexNumbers = 16;

export function chainNumToString(chainNumber: number): string {
    return '0x' + chainNumber.toString(baseForHexNumbers).toLowerCase();
}
