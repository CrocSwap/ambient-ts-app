import { IS_LOCAL_ENV } from '../constants';

export type letterCasings = 'lower' | 'upper' | 'native';

export default function fixCase(
    input: string,
    casing: letterCasings = 'native',
): string {
    let output: string;
    const allWhitespace = /^\s*$/;
    const defaultOutput = '';
    if (input === '' || allWhitespace.test(input) || casing === 'native') {
        output = input;
    } else if (casing === 'lower') {
        output = input.toLowerCase();
    } else if (casing === 'upper') {
        output = input.toUpperCase();
    } else {
        IS_LOCAL_ENV &&
            console.debug(
                `Fn <<${fixCase.name}>> could not properly fix casing for input <<${input}>>, refer to file fixCase.ts to troubleshoot. Fn will return default output of <<${defaultOutput}>>.`,
            );
        output = defaultOutput;
    }
    return output;
}
