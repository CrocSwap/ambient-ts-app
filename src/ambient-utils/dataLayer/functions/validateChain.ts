import { chainIdRegEx } from './regex';

// fn to validate a chain ID (construction only)
export function validateChain(chn: string): boolean {
    return chainIdRegEx.test(chn);
}
