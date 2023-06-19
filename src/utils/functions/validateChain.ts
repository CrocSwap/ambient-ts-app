import { chainIdRegEx } from '../regex/exports';

// fn to validate a chain ID (construction only)
export default function validateChain(chn: string): boolean {
    return chainIdRegEx.test(chn);
}
