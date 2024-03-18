import { IS_LOCAL_ENV } from '../constants';

export type letterCasings = 'lower' | 'upper' | 'native';

export default function fixCase(input: string, casing: letterCasings): string;
export default function fixCase(
    input: string[],
    casing: letterCasings,
): string[];

export default function fixCase(
    input: string | string[],
    casing: letterCasings = 'native',
): string | string[] {
    const inputAsArray: string[] = typeof input === 'string' ? [input] : input;

    function setCaseSingular(text: string, casing: letterCasings) {
        let output: string;
        const allWhitespace = /^\s*$/;
        const defaultOutput = '';
        if (text === '' || allWhitespace.test(text) || casing === 'native') {
            output = text;
        } else if (casing === 'lower') {
            output = text.toLowerCase();
        } else if (casing === 'upper') {
            output = text.toUpperCase();
        } else {
            IS_LOCAL_ENV &&
                console.debug(
                    `Fn <<${fixCase.name}>> could not properly fix casing for input <<${input}>>, refer to file fixCase.ts to troubleshoot. Fn will return default output of <<${defaultOutput}>>.`,
                );
            output = defaultOutput;
        }
        return output;
    }

    const fixedInputArray: string[] = inputAsArray.map((inp: string) =>
        setCaseSingular(inp, casing),
    );

    return Array.isArray(input) ? fixedInputArray : fixedInputArray[0];
}
