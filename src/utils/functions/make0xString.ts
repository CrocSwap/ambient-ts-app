export default function make0xString(num: number): string | undefined {
    try {
        if (Number.isSafeInteger(num)) {
            return '0x' + num.toString(16).toLowerCase();
        } else {
            throw new Error(`Could not convert value <<${num}>> to to a 0x hex string because it was not evaluated to be a safe integer.`);
        }
    } catch (err) {
        console.warn(err);
    }
}