import { IS_LOCAL_ENV } from '../constants';

// type to allow devs to specify how input will be re-cased
// 'lower' ➜ will apply `.toLowerCase()` to input string(s)
// 'upper' ➜ will apply `.toUpperCase()` to input string(s)
// 'native' ➜ will return input string(s) with no case modification
export type letterCasings = 'lower' | 'upper' | 'native';

// TODO:    refactor this file with a third overload which allows a developer to
// TODO:    ... pass an array of `[string, letterCasings]` tuples such that each
// TODO:    ... the file can process multiple strings with different casing needs

// single input string => single output string
export default function fixCase(input: string, casing?: letterCasings): string;
// array of input strings => array of output strings
export default function fixCase(
    input: string[],
    casing?: letterCasings,
): string[];

// fn definition
export default function fixCase(
    input: string | string[],
    casing: letterCasings = 'native',
): string | string[] {
    // change format of input to `string[]` for unified data handling
    const inputAsArray: string[] = typeof input === 'string' ? [input] : input;

    // fn to apply the proper letter casing to a string
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

    // map over array of input data applying specified casing to each string
    const fixedInputArray: string[] = inputAsArray.map((inp: string) =>
        setCaseSingular(inp, casing),
    );

    // return single string or array of strings as implied by shape of args
    return Array.isArray(input) ? fixedInputArray : fixedInputArray[0];
}
