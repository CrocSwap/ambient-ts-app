export default function chainNumToString(chainNumber: number): string {
    return '0x' + chainNumber.toString(16).toLowerCase();
}