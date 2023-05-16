const baseForHexNumbers = 16;

export default function chainNumToString(chainNumber: number): string {
    return '0x' + chainNumber.toString(baseForHexNumbers).toLowerCase();
}
